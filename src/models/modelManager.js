/**
 * 模型管理器
 * 负责ONNX模型的加载、管理和推理
 */
export class ModelManager {
  constructor() {
    this.session = null;
    this.isLoading = false;
    this.classLabels = [];
    this.currentModel = null;
  }

  /**
   * 可用的模型配置
   */
  static getAvailableModels() {
    return [
      {
        name: 'ResNet18',
        path: '/models/resnet18.onnx',
        description: 'ResNet18 图像分类模型',
        inputSize: 224,
        labelsPath: '/models/imagenet_classes.json'
      },
      {
        name: 'ResNet18-Simplified',
        path: '/models/resnet18_simplified.onnx',
        description: '简化版 ResNet18 模型',
        inputSize: 224,
        labelsPath: '/models/imagenet_classes.json'
      }
    ];
  }

  /**
   * 加载模型
   * @param {string} modelPath - 模型路径
   * @param {string} labelsPath - 标签文件路径
   * @returns {Promise<void>}
   */
  async loadModel(modelPath, labelsPath) {
    if (this.isLoading) {
      throw new Error('模型正在加载中，请稍候...');
    }

    this.isLoading = true;
    
    try {
      // 并行加载模型和标签
      const [session, labels] = await Promise.all([
        ort.InferenceSession.create(modelPath, {
          executionProviders: ["webgpu"],
          graphOptimizationLevel: "all"
        }),
        this.loadLabels(labelsPath)
      ]);

      this.session = session;
      this.classLabels = labels;
      this.currentModel = modelPath;
      
      console.log('模型加载成功:', modelPath);
    } catch (error) {
      console.error('模型加载失败:', error);
      throw new Error(`模型加载失败: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 加载标签文件
   * @param {string} labelsPath - 标签文件路径
   * @returns {Promise<Array>} 标签数组
   */
  async loadLabels(labelsPath) {
    try {
      const response = await fetch(labelsPath);
      if (!response.ok) {
        throw new Error(`标签文件加载失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('标签加载失败:', error);
      throw new Error(`标签加载失败: ${error.message}`);
    }
  }

  /**
   * 执行推理
   * @param {ort.Tensor} inputTensor - 输入张量
   * @returns {Promise<Object>} 推理结果
   */
  async runInference(inputTensor) {
    if (!this.session) {
      throw new Error('模型未加载，请先加载模型');
    }

    try {
      const feeds = { input: inputTensor };
      const results = await this.session.run(feeds);
      
      const output = results[Object.keys(results)[0]];
      const data = output.data;
      
      // 获取top-5预测结果
      const predictions = this.getTopPredictions(data, 5);
      
      return {
        predictions,
        rawData: data,
        modelName: this.currentModel
      };
    } catch (error) {
      console.error('推理失败:', error);
      throw new Error(`推理失败: ${error.message}`);
    }
  }

  /**
   * 获取top-k预测结果
   * @param {Float32Array} data - 模型输出数据
   * @param {number} k - 返回前k个结果
   * @returns {Array} 预测结果数组
   */
  getTopPredictions(data, k = 5) {
    const predictions = [];
    
    for (let i = 0; i < data.length; i++) {
      predictions.push({
        index: i,
        score: data[i],
        label: this.classLabels[i] || `类别${i}`
      });
    }
    
    // 按分数降序排序
    predictions.sort((a, b) => b.score - a.score);
    
    return predictions.slice(0, k);
  }

  /**
   * 检查WebGPU支持
   * @returns {boolean} 是否支持WebGPU
   */
  static checkWebGPUSupport() {
    return 'gpu' in navigator;
  }

  /**
   * 获取模型信息
   * @returns {Object} 模型信息
   */
  getModelInfo() {
    if (!this.session) {
      return null;
    }
    
    return {
      inputNames: this.session.inputNames,
      outputNames: this.session.outputNames,
      modelPath: this.currentModel,
      isLoaded: true
    };
  }
} 