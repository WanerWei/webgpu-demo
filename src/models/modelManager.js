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
        labelsPath: '/models/imagenet_classes.json',
        type: 'classification'
      },
      {
        name: 'ResNet18-Simplified',
        path: '/models/resnet18_simplified.onnx',
        description: '简化版 ResNet18 模型',
        inputSize: 224,
        labelsPath: '/models/imagenet_classes.json',
        type: 'classification'
      },
      {
        name: 'YOLOv8n',
        path: '/models/yolov8n.onnx',
        description: 'YOLOv8 Nano 目标检测模型',
        inputSize: 640,
        labelsPath: '/models/coco_classes.json',
        type: 'detection'
      },
      {
        name: 'StyleTransfer',
        path: '/models/mosaic-9.onnx',
        description: '神经风格迁移模型',
        inputSize: 224,
        labelsPath: null,
        type: 'style_transfer'
      }
    ];
  }

  /**
   * 加载模型
   * @param {string} modelPath - 模型路径
   * @param {string} labelsPath - 标签文件路径
   * @param {string} executionProvider - 执行提供者
   * @returns {Promise<void>}
   */
  async loadModel(modelPath, labelsPath, executionProvider = "webgpu") {
    if (this.isLoading) {
      throw new Error('模型正在加载中，请稍候...');
    }

    this.isLoading = true;
    
    try {
      // 配置执行提供者
      const sessionOptions = {
        graphOptimizationLevel: "all"
      };

      // 根据执行提供者配置不同的选项
      switch (executionProvider) {
        case "webgpu":
          sessionOptions.executionProviders = ["webgpu"];
          break;
        case "wasm":
          sessionOptions.executionProviders = ["wasm"];
          break;
        case "cpu":
          sessionOptions.executionProviders = ["cpu"];
          break;
        case "webgl":
          sessionOptions.executionProviders = ["webgl"];
          break;
        case "auto":
          // 自动选择最佳执行提供者
          sessionOptions.executionProviders = this.getAvailableExecutionProviders();
          break;
        default:
          sessionOptions.executionProviders = ["webgpu"];
      }

      // 并行加载模型和标签（如果labelsPath不为null）
      const loadPromises = [
        window.ort.InferenceSession.create(modelPath, sessionOptions)
      ];
      
      // 只有当labelsPath不为null时才加载标签
      if (labelsPath) {
        loadPromises.push(this.loadLabels(labelsPath));
      } else {
        // 对于不需要标签的模型（如风格迁移），使用空数组
        loadPromises.push(Promise.resolve([]));
      }
      
      const [session, labels] = await Promise.all(loadPromises);

      this.session = session;
      this.classLabels = labels;
      this.currentModel = modelPath;
      this.currentExecutionProvider = executionProvider;
      
      // 保存模型的输入信息
      this.modelInputInfo = {
        names: session.inputNames,
        inputMeta: session.inputNames.length > 0 ? session.inputNames[0] : null
      };
      
      // 获取模型的输入元数据
      try {
        const inputMeta = session.inputNames.length > 0 ? 
          session.inputNames[0] : null;
        if (inputMeta) {
          console.log('模型输入元数据:', inputMeta);
        }
      } catch (e) {
        console.warn('无法获取模型输入元数据:', e);
      }
      
      console.log('模型加载成功:', modelPath, '执行提供者:', executionProvider);
      console.log('模型输入信息:', this.modelInputInfo);
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
   * 获取模型的输入张量形状
   * @param {string} executionProvider - 执行提供者
   * @returns {Array} 输入张量形状
   */
  getInputTensorShape(executionProvider = null) {
    if (!this.session) {
      return [1, 3, 224, 224]; // 默认形状
    }
    
    // 根据执行提供者返回不同的形状
    const provider = executionProvider || this.currentExecutionProvider;
    
    if (provider === 'webgl') {
      // WebGL后端期望动态批次大小
      return [1, 3, 224, 224];
    } else {
      // 其他后端使用固定批次大小
      return [1, 3, 224, 224];
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
      // 获取模型的输入信息
      const inputNames = this.session.inputNames;
      const inputName = inputNames && inputNames.length > 0 ? inputNames[0] : 'input';
      
      console.log('模型输入信息:', {
        inputNames: this.session.inputNames,
        inputTensorShape: inputTensor.dims,
        inputTensorType: inputTensor.type,
        inputName: inputName
      });

      // 根据执行提供者调整张量形状
      let correctShape;
      if (this.currentExecutionProvider === 'webgl') {
        // WebGL后端期望动态批次大小，使用 -1 表示动态维度
        correctShape = [1, 3, 224, 224];
        console.log('WebGL后端：使用动态批次大小形状:', correctShape);
      } else {
        // 其他后端使用固定批次大小
        correctShape = [1, 3, 224, 224];
        console.log('其他后端：使用固定批次大小形状:', correctShape);
      }
      
      const correctedTensor = new window.ort.Tensor(inputTensor.type, inputTensor.data, correctShape);
      console.log('修正后的张量形状:', correctedTensor.dims);

      console.log('inputName :>> ', inputName);
      const feeds = { [inputName]: correctedTensor };
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
   * 执行目标检测推理
   * @param {ort.Tensor} inputTensor - 输入张量
   * @returns {Promise<Object>} 检测结果
   */
  async runDetectionInference(inputTensor) {
    if (!this.session) {
      throw new Error('模型未加载，请先加载模型');
    }

    try {
      // 获取模型的输入信息
      const inputNames = this.session.inputNames;
      const inputName = inputNames && inputNames.length > 0 ? inputNames[0] : 'images';
      
      console.log('检测模型输入信息:', {
        inputNames: this.session.inputNames,
        inputTensorShape: inputTensor.dims,
        inputTensorType: inputTensor.type,
        inputName: inputName
      });

      const feeds = { [inputName]: inputTensor };
      const results = await this.session.run(feeds);
      
      // YOLO模型通常输出 [batch, num_detections, 85] 格式
      // 85 = 4 (bbox) + 1 (confidence) + 80 (class probabilities)
      const output = results[Object.keys(results)[0]];
      const data = output.data;
      const shape = output.dims;
      
      console.log('检测输出形状:', shape);
      
      // 解析检测结果
      const detections = this.parseYOLOOutput(data, shape);
      
      return {
        detections,
        rawData: data,
        modelName: this.currentModel
      };
    } catch (error) {
      console.error('检测推理失败:', error);
      throw new Error(`检测推理失败: ${error.message}`);
    }
  }

  /**
   * 解析YOLO输出
   * @param {Float32Array} data - 模型输出数据
   * @param {Array} shape - 输出形状
   * @returns {Array} 检测结果数组
   */
  parseYOLOOutput(data, shape) {
    const detections = [];
    const [batch, numDetections, numValues] = shape;
    
    // 置信度阈值
    const confidenceThreshold = 0.5;
    // NMS阈值
    const nmsThreshold = 0.4;
    
    for (let i = 0; i < numDetections; i++) {
      const offset = i * numValues;
      
      // 获取边界框坐标 (center_x, center_y, width, height)
      const centerX = data[offset];
      const centerY = data[offset + 1];
      const width = data[offset + 2];
      const height = data[offset + 3];
      
      // 获取置信度
      const confidence = data[offset + 4];
      
      if (confidence < confidenceThreshold) continue;
      
      // 获取类别概率
      let maxClassScore = 0;
      let classId = 0;
      for (let j = 5; j < numValues; j++) {
        if (data[offset + j] > maxClassScore) {
          maxClassScore = data[offset + j];
          classId = j - 5;
        }
      }
      
      const finalScore = confidence * maxClassScore;
      if (finalScore < confidenceThreshold) continue;
      
      // 转换边界框格式 (center -> corner)
      const x1 = centerX - width / 2;
      const y1 = centerY - height / 2;
      const x2 = centerX + width / 2;
      const y2 = centerY + height / 2;
      
      detections.push({
        bbox: [x1, y1, x2, y2],
        confidence: finalScore,
        classId: classId,
        label: this.classLabels[classId] || `Class ${classId}`
      });
    }
    
    // 应用NMS (Non-Maximum Suppression)
    return this.applyNMS(detections, nmsThreshold);
  }

  /**
   * 应用非极大值抑制
   * @param {Array} detections - 检测结果
   * @param {number} threshold - NMS阈值
   * @returns {Array} 过滤后的检测结果
   */
  applyNMS(detections, threshold) {
    // 按置信度排序
    detections.sort((a, b) => b.confidence - a.confidence);
    
    const filtered = [];
    const suppressed = new Set();
    
    for (let i = 0; i < detections.length; i++) {
      if (suppressed.has(i)) continue;
      
      filtered.push(detections[i]);
      
      // 计算与其他检测框的IoU
      for (let j = i + 1; j < detections.length; j++) {
        if (suppressed.has(j)) continue;
        
        const iou = this.calculateIoU(detections[i].bbox, detections[j].bbox);
        if (iou > threshold) {
          suppressed.add(j);
        }
      }
    }
    
    return filtered;
  }

  /**
   * 计算IoU (Intersection over Union)
   * @param {Array} box1 - 边界框1 [x1, y1, x2, y2]
   * @param {Array} box2 - 边界框2 [x1, y1, x2, y2]
   * @returns {number} IoU值
   */
  calculateIoU(box1, box2) {
    const [x1_1, y1_1, x2_1, y2_1] = box1;
    const [x1_2, y1_2, x2_2, y2_2] = box2;
    
    // 计算交集
    const x1 = Math.max(x1_1, x1_2);
    const y1 = Math.max(y1_1, y1_2);
    const x2 = Math.min(x2_1, x2_2);
    const y2 = Math.min(y2_1, y2_2);
    
    if (x2 <= x1 || y2 <= y1) return 0;
    
    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = (x2_1 - x1_1) * (y2_1 - y1_1);
    const area2 = (x2_2 - x1_2) * (y2_2 - y1_2);
    const union = area1 + area2 - intersection;
    
    return intersection / union;
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
   * 获取可用的执行提供者
   * @returns {Array} 可用的执行提供者列表
   */
  getAvailableExecutionProviders() {
    const providers = [];
    
    // 检查WebGPU支持
    if (this.constructor.checkWebGPUSupport()) {
      providers.push("webgpu");
    }
    
    // 检查WebGL支持
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        providers.push("webgl");
      }
    } catch (e) {
      // WebGL不支持
    }
    
    // WASM和CPU通常都支持
    providers.push("wasm", "cpu");
    
    return providers;
  }

  /**
   * 检查ONNX Runtime Web后端支持
   * @returns {Object} 后端支持情况
   */
  static async checkBackendSupport() {
    const support = {
      webgpu: false,
      webgl: false,
      wasm: false,
      cpu: false
    };

    try {
      // 检查WebGPU后端
      if (this.checkWebGPUSupport()) {
        support.webgpu = true;
        console.log('WebGPU后端可用');
      }

      // 检查WebGL后端
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          support.webgl = true;
          console.log('WebGL后端可用');
        }
      } catch (e) {
        console.log('WebGL后端不可用:', e.message);
      }

      // WASM和CPU后端通常都支持
      support.wasm = true;
      support.cpu = true;
      console.log('WASM和CPU后端可用');

    } catch (error) {
      console.error('后端检测失败:', error);
    }

    return support;
  }

  /**
   * 获取执行提供者信息
   * @returns {Object} 执行提供者信息
   */
  getExecutionProviderInfo() {
    const info = {
      webgpu: {
        supported: this.constructor.checkWebGPUSupport(),
        description: "WebGPU - 下一代Web图形API",
        advantages: ["GPU加速", "高性能", "现代API"],
        disadvantages: ["浏览器支持有限", "需要较新版本"],
        useCase: "高性能推理，现代浏览器"
      },
      webgl: {
        supported: (() => {
          try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
          } catch (e) {
            return false;
          }
        })(),
        description: "WebGL - Web图形库",
        advantages: ["广泛支持", "GPU加速"],
        disadvantages: ["性能有限", "API较老", "需要特定构建版本"],
        useCase: "兼容性要求高的场景"
      },
      wasm: {
        supported: true,
        description: "WebAssembly - 高性能Web执行环境",
        advantages: ["广泛支持", "CPU优化", "稳定"],
        disadvantages: ["CPU限制", "无GPU加速"],
        useCase: "CPU推理，兼容性优先"
      },
      cpu: {
        supported: true,
        description: "CPU - 中央处理器",
        advantages: ["兼容性最好", "稳定可靠"],
        disadvantages: ["性能最低", "无并行加速"],
        useCase: "兼容性要求最高，性能要求不高"
      }
    };

    return info;
  }

  /**
   * 执行风格迁移推理
   * @param {ort.Tensor} contentTensor - 内容图像张量
   * @param {ort.Tensor} styleTensor - 风格图像张量
   * @returns {Promise<Object>} 风格迁移结果
   */
  async runStyleTransferInference(contentTensor, styleTensor) {
    if (!this.session) {
      throw new Error('模型未加载，请先加载模型');
    }

    try {
      // 获取模型的输入信息
      const inputNames = this.session.inputNames;
      console.log('风格迁移模型输入信息:', {
        inputNames: this.session.inputNames,
        contentTensorShape: contentTensor.dims,
        styleTensorShape: styleTensor.dims
      });

      // 构建输入
      const feeds = {};
      if (inputNames.includes('content_image')) {
        feeds['content_image'] = contentTensor;
      } else if (inputNames.includes('content')) {
        feeds['content'] = contentTensor;
      } else {
        feeds[inputNames[0]] = contentTensor;
      }

      if (inputNames.includes('style_image')) {
        feeds['style_image'] = styleTensor;
      } else if (inputNames.includes('style')) {
        feeds['style'] = styleTensor;
      } else if (inputNames.length > 1) {
        feeds[inputNames[1]] = styleTensor;
      }

      const results = await this.session.run(feeds);
      
      // 获取输出
      const output = results[Object.keys(results)[0]];
      const data = output.data;
      const shape = output.dims;
      
      console.log('风格迁移输出形状:', shape);
      
      return {
        outputData: data,
        outputShape: shape,
        modelName: this.currentModel
      };
    } catch (error) {
      console.error('风格迁移推理失败:', error);
      throw new Error(`风格迁移推理失败: ${error.message}`);
    }
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