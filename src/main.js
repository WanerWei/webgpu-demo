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
      // 显示性能信息
      this.showPerformanceInfo();
      
      // 检测ONNX Runtime Web后端支持
      await this.checkBackendSupport();
      
      // 创建模型选择器
      const models = ModelManager.getAvailableModels();
      this.ui.createModelSelector(models);
      
      // 创建执行提供者选择器
      const providerInfo = this.modelManager.getExecutionProviderInfo();
      this.ui.createExecutionProviderSelector(providerInfo);
      
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
   * 检查后端支持情况
   */
  async checkBackendSupport() {
    try {
      const backendSupport = await ModelManager.checkBackendSupport();
      console.log('ONNX Runtime Web后端支持情况:', backendSupport);
      
      // 显示后端支持信息
      const supportedBackends = Object.entries(backendSupport)
        .filter(([_, supported]) => supported)
        .map(([backend, _]) => backend.toUpperCase());
      
      if (supportedBackends.length > 0) {
        this.ui.showStatus(`支持的后端: ${supportedBackends.join(', ')}`, 'info');
      }
      
      // 如果WebGL不支持，显示提示
      if (!backendSupport.webgl) {
        console.warn('WebGL后端不可用，可能的原因：');
        console.warn('1. ONNX Runtime Web版本不包含WebGL后端');
        console.warn('2. 需要使用包含所有后端的构建版本');
        console.warn('3. 浏览器WebGL支持问题');
        
        this.ui.showStatus('WebGL后端不可用，将使用其他可用后端', 'warning');
      }
      
    } catch (error) {
      console.error('后端检测失败:', error);
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
      // 获取选中的执行提供者
      const selectedProvider = this.ui.elements.executionProviderSelect?.value || 'auto';
      await this.modelManager.loadModel(defaultModel.path, defaultModel.labelsPath, selectedProvider);
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

    // 性能对比事件
    this.ui.elements.benchmarkBtn.addEventListener('click', () => {
      this.runBenchmark();
    });

    // 推理次数输入验证
    if (this.ui.elements.benchmarkIterations) {
      this.ui.elements.benchmarkIterations.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value < 1) {
          e.target.value = 1;
        } else if (value > 50) {
          e.target.value = 50;
        }
      });
    }

    // 模型选择事件
    if (this.ui.elements.modelSelect) {
      this.ui.elements.modelSelect.addEventListener('change', (e) => {
        this.handleModelChange(e);
      });
    }

    // 执行提供者选择事件
    if (this.ui.elements.executionProviderSelect) {
      this.ui.elements.executionProviderSelect.addEventListener('change', (e) => {
        this.handleExecutionProviderChange(e);
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
      
      // 获取模型的输入张量形状
      const selectedProvider = this.ui.elements.executionProviderSelect?.value || 'auto';
      const inputShape = this.modelManager.getInputTensorShape(selectedProvider);
      this.currentTensor = ImageProcessor.createTensor(imageData, 224, inputShape);
      this.currentImage = image;
      
      // 更新界面
      this.ui.updateCanvas(image);
      this.ui.hideLoading();
      this.ui.showStatus('图像加载成功', 'success');
      
      // 启用推理和性能对比按钮
      this.ui.elements.runBtn.disabled = false;
      this.ui.elements.benchmarkBtn.disabled = false;
      
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
      const selectedProvider = this.ui.elements.executionProviderSelect?.value || 'auto';
      await this.modelManager.loadModel(modelPath, labelsPath, selectedProvider);
      this.ui.hideLoading();
      this.ui.showStatus('模型切换成功', 'success');
    } catch (error) {
      this.ui.hideLoading();
      this.ui.showError(`模型切换失败: ${error.message}`);
    }
  }

  /**
   * 处理执行提供者切换
   * @param {Event} event - 执行提供者选择事件
   */
  async handleExecutionProviderChange(event) {
    const selectedProvider = event.target.value;
    
    this.ui.showLoading('正在切换执行提供者...');
    
    try {
      const selectedOption = this.ui.elements.modelSelect?.selectedOptions[0];
      if (selectedOption) {
        const modelPath = selectedOption.value;
        const labelsPath = selectedOption.dataset.labels;
        await this.modelManager.loadModel(modelPath, labelsPath, selectedProvider);
      }
      this.ui.hideLoading();
      this.ui.showStatus('执行提供者切换成功', 'success');
    } catch (error) {
      this.ui.hideLoading();
      this.ui.showError(`执行提供者切换失败: ${error.message}`);
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
      const executionProvider = this.modelManager.currentExecutionProvider || 'webgpu';
      this.ui.showResults(result.predictions, inferenceTime, executionProvider);
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
      memoryUsage: this.getMemoryUsage(false),
      webgpuSupported: ModelManager.checkWebGPUSupport(),
      executionProvider: this.modelManager.currentExecutionProvider || 'webgpu'
    };
    
    this.ui.showPerformanceInfo(info);
  }

  /**
   * 运行性能对比测试
   */
  async runBenchmark() {
    if (!this.currentTensor) {
      this.ui.showError('请先选择图像');
      return;
    }

    // 获取用户设置的推理次数
    const iterations = parseInt(this.ui.elements.benchmarkIterations.value) || 5;
    if (iterations < 1 || iterations > 50) {
      this.ui.showError('推理次数必须在1-50之间');
      return;
    }

    this.ui.showLoading(`正在运行性能对比测试 (${iterations}次推理)...`);
    
    try {
      // 获取实际可用的执行提供者
      const availableProviders = this.modelManager.getAvailableExecutionProviders();
      const benchmarkResults = [];
      
      console.log('可用的执行提供者:', availableProviders);
      
      for (const provider of availableProviders) {
        try {
          // 加载模型
          const selectedOption = this.ui.elements.modelSelect?.selectedOptions[0];
          if (selectedOption) {
            const modelPath = selectedOption.value;
            const labelsPath = selectedOption.dataset.labels;
            await this.modelManager.loadModel(modelPath, labelsPath, provider);
          }
          
          // 记录初始内存使用
          const initialMemory = this.getMemoryUsage(true);
          let peakMemory = initialMemory;
          
          // 运行多次推理测试
          const times = [];
          for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            await this.modelManager.runInference(this.currentTensor);
            const endTime = performance.now();
            times.push(endTime - startTime);
            
            // 监控内存使用
            const currentMemory = this.getMemoryUsage(true);
            if (currentMemory && currentMemory > peakMemory) {
              peakMemory = currentMemory;
            }
            
            // 更新进度
            if (i % Math.max(1, Math.floor(iterations / 10)) === 0) {
              this.ui.showLoading(`正在测试 ${provider.toUpperCase()} (${i + 1}/${iterations})...`);
            }
          }
          
          const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
          const stdTime = Math.sqrt(times.reduce((sq, n) => sq + Math.pow(n - avgTime, 2), 0) / times.length);
          const finalMemory = this.getMemoryUsage(true);
          
          benchmarkResults.push({
            provider,
            avgTime,
            stdTime,
            memoryUsage: finalMemory,
            memoryPeak: peakMemory,
            iterations: iterations,
            status: 'success'
          });
          
        } catch (error) {
          console.error(`测试 ${provider} 失败:`, error);
          benchmarkResults.push({
            provider,
            avgTime: 0,
            stdTime: 0,
            memoryUsage: null,
            memoryPeak: null,
            iterations: iterations,
            status: 'error'
          });
        }
      }
      
      // 显示对比结果
      this.ui.showBenchmarkResults(benchmarkResults);
      this.ui.hideLoading();
      this.ui.showStatus(`性能对比测试完成 (${iterations}次推理)`, 'success');
      
    } catch (error) {
      this.ui.hideLoading();
      this.ui.showError(`性能对比测试失败: ${error.message}`);
    }
  }

  /**
   * 获取内存使用情况
   * @param {boolean} returnNumber - 是否返回数值而不是字符串
   * @returns {string|number} 内存使用信息或数值
   */
  getMemoryUsage(returnNumber = false) {
    if ('memory' in performance) {
      const memory = performance.memory;
      const used = memory.usedJSHeapSize / 1024 / 1024;
      const total = memory.totalJSHeapSize / 1024 / 1024;
      const limit = memory.jsHeapSizeLimit / 1024 / 1024;
      
      if (returnNumber) {
        return used;
      }
      
      return `${used.toFixed(1)}MB / ${total.toFixed(1)}MB (${limit.toFixed(1)}MB)`;
    }
    
    if (returnNumber) {
      return null;
    }
    
    return '内存信息不可用';
  }
}

// 等待DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new WebGPUApp();
});
