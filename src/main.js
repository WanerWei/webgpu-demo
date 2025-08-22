import { ImageProcessor } from './utils/imageProcessor.js';
import { ModelManager } from './models/modelManager.js';
import { UI } from './components/ui.js';

/**
 * WebGPU + ONNX Runtime Web 图像分类应用
 */
class WebGPUApp {
  constructor() {
    this.modelManager = new ModelManager();
    this.ui = new UI();
    this.currentImage = null;
    this.currentTensor = null;
    
    this.initialize();
  }

  /**
   * 初始化应用
   */
  async initialize() {
    try {
      // 检查WebGPU支持
      if (!ModelManager.checkWebGPUSupport()) {
        this.ui.showError('您的浏览器不支持WebGPU，请使用Chrome 113+或Edge 113+');
        return;
      }

      // 显示性能信息
      this.showPerformanceInfo();
      
      // 创建模型选择器
      const models = ModelManager.getAvailableModels();
      this.ui.createModelSelector(models);
      
      // 加载默认模型
      await this.loadDefaultModel();
      
      // 绑定事件
      this.bindEvents();
      
      this.ui.showStatus('应用初始化完成', 'success');
      
    } catch (error) {
      this.ui.showError(`初始化失败: ${error.message}`);
    }
  }

  /**
   * 加载默认模型
   */
  async loadDefaultModel() {
    const models = ModelManager.getAvailableModels();
    const defaultModel = models[0];
    
    this.ui.showLoading('正在加载模型...');
    
    try {
      await this.modelManager.loadModel(defaultModel.path, defaultModel.labelsPath);
      this.ui.hideLoading();
      this.ui.showStatus('模型加载成功', 'success');
    } catch (error) {
      this.ui.hideLoading();
      this.ui.showError(`模型加载失败: ${error.message}`);
    }
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 图像选择事件
    this.ui.elements.imageInput.addEventListener('change', (e) => {
      this.handleImageSelect(e);
    });

    // 运行推理事件
    this.ui.elements.runBtn.addEventListener('click', () => {
      this.runInference();
    });

    // 模型选择事件
    if (this.ui.elements.modelSelect) {
      this.ui.elements.modelSelect.addEventListener('change', (e) => {
        this.handleModelChange(e);
      });
    }

    // 拖拽上传
    this.setupDragAndDrop();
  }

  /**
   * 处理图像选择
   * @param {Event} event - 文件选择事件
   */
  async handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 验证文件
      ImageProcessor.validateImageFile(file);
      
      // 加载图像
      this.ui.showLoading('正在加载图像...');
      const image = await ImageProcessor.loadImageFile(file);
      
      // 预处理图像
      const imageData = ImageProcessor.preprocessImage(image);
      this.currentTensor = ImageProcessor.createTensor(imageData);
      this.currentImage = image;
      
      // 更新界面
      this.ui.updateCanvas(image);
      this.ui.hideLoading();
      this.ui.showStatus('图像加载成功', 'success');
      
    } catch (error) {
      this.ui.hideLoading();
      this.ui.showError(error.message);
    }
  }

  /**
   * 处理模型切换
   * @param {Event} event - 模型选择事件
   */
  async handleModelChange(event) {
    const selectedOption = event.target.selectedOptions[0];
    const modelPath = selectedOption.value;
    const labelsPath = selectedOption.dataset.labels;
    
    this.ui.showLoading('正在切换模型...');
    
    try {
      await this.modelManager.loadModel(modelPath, labelsPath);
      this.ui.hideLoading();
      this.ui.showStatus('模型切换成功', 'success');
    } catch (error) {
      this.ui.hideLoading();
      this.ui.showError(`模型切换失败: ${error.message}`);
    }
  }

  /**
   * 运行推理
   */
  async runInference() {
    if (!this.currentTensor) {
      this.ui.showError('请先选择图像');
      return;
    }

    this.ui.showLoading('正在推理...');
    
    try {
      const startTime = performance.now();
      
      // 执行推理
      const result = await this.modelManager.runInference(this.currentTensor);
      
      const endTime = performance.now();
      const inferenceTime = endTime - startTime;
      
      // 显示结果
      this.ui.showResults(result.predictions, inferenceTime);
      this.ui.hideLoading();
      this.ui.showStatus('推理完成', 'success');
      
      // 更新性能信息
      this.updatePerformanceInfo(inferenceTime);
      
    } catch (error) {
      this.ui.hideLoading();
      this.ui.showError(`推理失败: ${error.message}`);
    }
  }

  /**
   * 设置拖拽上传
   */
  setupDragAndDrop() {
    const dropZone = document.querySelector('.upload-area');
    
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.ui.elements.imageInput.files = files;
        this.handleImageSelect({ target: { files } });
      }
    });
  }

  /**
   * 显示性能信息
   */
  showPerformanceInfo() {
    const info = {
      modelName: '未加载',
      inferenceTime: 0,
      memoryUsage: this.getMemoryUsage(),
      webgpuSupported: ModelManager.checkWebGPUSupport()
    };
    
    this.ui.showPerformanceInfo(info);
  }

  /**
   * 更新性能信息
   * @param {number} inferenceTime - 推理时间
   */
  updatePerformanceInfo(inferenceTime) {
    const modelInfo = this.modelManager.getModelInfo();
    const info = {
      modelName: modelInfo ? modelInfo.modelPath.split('/').pop() : '未加载',
      inferenceTime: inferenceTime.toFixed(2),
      memoryUsage: this.getMemoryUsage(),
      webgpuSupported: ModelManager.checkWebGPUSupport()
    };
    
    this.ui.showPerformanceInfo(info);
  }

  /**
   * 获取内存使用情况
   * @returns {string} 内存使用量
   */
  getMemoryUsage() {
    if (performance.memory) {
      return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
    }
    return 'N/A';
  }
}

// 等待DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new WebGPUApp();
});
