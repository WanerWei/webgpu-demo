/**
 * UI组件类
 * 负责界面元素的创建、更新和交互
 */
export class UI {
  constructor() {
    this.elements = {};
    this.initializeElements();
  }

  /**
   * 初始化界面元素
   */
  initializeElements() {
    this.elements = {
      container: document.getElementById('app'),
      imageInput: document.getElementById('imageInput'),
      canvas: document.getElementById('canvas'),
      ctx: document.getElementById('canvas').getContext('2d'),
      runBtn: document.getElementById('runBtn'),
      outputDiv: document.getElementById('output'),
      modelSelect: document.getElementById('modelSelect'),
      loadingSpinner: document.getElementById('loadingSpinner'),
      statusBar: document.getElementById('statusBar'),
      resultsContainer: document.getElementById('resultsContainer'),
      performanceInfo: document.getElementById('performanceInfo')
    };
  }

  /**
   * 显示加载状态
   * @param {string} message - 加载消息
   */
  showLoading(message = '加载中...') {
    this.elements.loadingSpinner.style.display = 'block';
    this.elements.loadingSpinner.textContent = message;
    this.elements.runBtn.disabled = true;
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    this.elements.loadingSpinner.style.display = 'none';
    this.elements.runBtn.disabled = false;
  }

  /**
   * 显示状态信息
   * @param {string} message - 状态消息
   * @param {string} type - 消息类型 (success, error, warning, info)
   */
  showStatus(message, type = 'info') {
    this.elements.statusBar.textContent = message;
    this.elements.statusBar.className = `status-bar status-${type}`;
    this.elements.statusBar.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
      this.elements.statusBar.style.display = 'none';
    }, 3000);
  }

  /**
   * 显示推理结果
   * @param {Array} predictions - 预测结果数组
   * @param {number} inferenceTime - 推理时间
   */
  showResults(predictions, inferenceTime) {
    const resultsHTML = `
      <div class="results-header">
        <h3>推理结果</h3>
        <span class="inference-time">推理时间: ${inferenceTime.toFixed(2)}ms</span>
      </div>
      <div class="predictions-list">
        ${predictions.map((pred, index) => `
          <div class="prediction-item ${index === 0 ? 'top-prediction' : ''}">
            <div class="prediction-rank">#${index + 1}</div>
            <div class="prediction-content">
              <div class="prediction-label">${pred.label}</div>
              <div class="prediction-score">
                <div class="score-bar" style="width: ${(pred.score * 100).toFixed(1)}%"></div>
                <span class="score-text">${(pred.score * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    this.elements.resultsContainer.innerHTML = resultsHTML;
    this.elements.resultsContainer.style.display = 'block';
  }

  /**
   * 显示性能信息
   * @param {Object} info - 性能信息
   */
  showPerformanceInfo(info) {
    const infoHTML = `
      <div class="performance-grid">
        <div class="perf-item">
          <span class="perf-label">模型:</span>
          <span class="perf-value">${info.modelName}</span>
        </div>
        <div class="perf-item">
          <span class="perf-label">推理时间:</span>
          <span class="perf-value">${info.inferenceTime}ms</span>
        </div>
        <div class="perf-item">
          <span class="perf-label">内存使用:</span>
          <span class="perf-value">${info.memoryUsage}MB</span>
        </div>
        <div class="perf-item">
          <span class="perf-label">WebGPU:</span>
          <span class="perf-value ${info.webgpuSupported ? 'supported' : 'not-supported'}">
            ${info.webgpuSupported ? '支持' : '不支持'}
          </span>
        </div>
      </div>
    `;
    
    this.elements.performanceInfo.innerHTML = infoHTML;
  }

  /**
   * 更新画布显示
   * @param {HTMLImageElement} image - 图像元素
   */
  updateCanvas(image) {
    const canvas = this.elements.canvas;
    const ctx = this.elements.ctx;
    
    // 计算缩放比例，保持宽高比
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    
    // 居中显示
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制图像
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    
    // 添加边框
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, scaledWidth, scaledHeight);
  }

  /**
   * 创建模型选择器
   * @param {Array} models - 可用模型列表
   */
  createModelSelector(models) {
    const selectHTML = `
      <select id="modelSelect" class="model-select">
        ${models.map(model => `
          <option value="${model.path}" data-labels="${model.labelsPath}">
            ${model.name} - ${model.description}
          </option>
        `).join('')}
      </select>
    `;
    
    // 插入到适当位置
    const container = document.querySelector('.model-section');
    if (container) {
      container.innerHTML = selectHTML;
      this.elements.modelSelect = document.getElementById('modelSelect');
    }
  }

  /**
   * 显示错误信息
   * @param {string} error - 错误信息
   */
  showError(error) {
    this.showStatus(error, 'error');
    console.error('应用错误:', error);
  }

  /**
   * 重置界面
   */
  reset() {
    this.elements.canvas.getContext('2d').clearRect(0, 0, 224, 224);
    this.elements.resultsContainer.style.display = 'none';
    this.elements.outputDiv.textContent = '';
  }
} 