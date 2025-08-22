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
      benchmarkBtn: document.getElementById('benchmarkBtn'),
      benchmarkIterations: document.getElementById('benchmarkIterations'),
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
   * @param {string} executionProvider - 执行提供者
   */
  showResults(predictions, inferenceTime, executionProvider = 'webgpu') {
    const resultsHTML = `
      <div class="results-header">
        <h3>推理结果</h3>
        <div class="result-meta">
          <span class="inference-time">推理时间: ${inferenceTime.toFixed(2)}ms</span>
          <span class="execution-provider">执行提供者: ${executionProvider.toUpperCase()}</span>
        </div>
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
   * 显示性能对比结果
   * @param {Array} benchmarkResults - 性能对比结果
   */
  showBenchmarkResults(benchmarkResults) {
    const resultsHTML = `
      <div class="benchmark-header">
        <h3>性能对比结果</h3>
        <p>不同执行提供者的性能对比 (${benchmarkResults[0]?.iterations || 5}次推理测试)</p>
      </div>
      <div class="benchmark-table">
        <table>
          <thead>
            <tr>
              <th>执行提供者</th>
              <th>平均推理时间</th>
              <th>标准差</th>
              <th>内存使用</th>
              <th>内存峰值</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            ${benchmarkResults.map(result => `
              <tr class="${result.status === 'success' ? 'success' : 'error'}">
                <td>${result.provider.toUpperCase()}</td>
                <td>${result.avgTime.toFixed(2)}ms</td>
                <td>${result.stdTime.toFixed(2)}ms</td>
                <td>${result.memoryUsage ? result.memoryUsage.toFixed(1) + 'MB' : 'N/A'}</td>
                <td>${result.memoryPeak ? result.memoryPeak.toFixed(1) + 'MB' : 'N/A'}</td>
                <td>
                  <span class="status ${result.status}">
                    ${result.status === 'success' ? '✅ 成功' : '❌ 失败'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="benchmark-charts">
        <div class="chart-container">
          <h4>推理时间对比</h4>
          <canvas id="benchmarkTimeChart" width="400" height="200"></canvas>
        </div>
        <div class="chart-container">
          <h4>内存使用对比</h4>
          <canvas id="benchmarkMemoryChart" width="400" height="200"></canvas>
        </div>
      </div>
    `;
    
    // 创建性能对比容器
    let benchmarkContainer = document.getElementById('benchmarkContainer');
    if (!benchmarkContainer) {
      benchmarkContainer = document.createElement('div');
      benchmarkContainer.id = 'benchmarkContainer';
      benchmarkContainer.className = 'benchmark-container';
      this.elements.resultsContainer.parentNode.insertBefore(benchmarkContainer, this.elements.resultsContainer.nextSibling);
    }
    
    benchmarkContainer.innerHTML = resultsHTML;
    benchmarkContainer.style.display = 'block';
    
    // 绘制图表
    this.drawBenchmarkCharts(benchmarkResults);
  }

  /**
   * 绘制性能对比图表
   * @param {Array} benchmarkResults - 性能对比结果
   */
  drawBenchmarkCharts(benchmarkResults) {
    // 绘制推理时间图表
    this.drawTimeChart(benchmarkResults);
    // 绘制内存使用图表
    this.drawMemoryChart(benchmarkResults);
  }

  /**
   * 绘制推理时间对比图表
   * @param {Array} benchmarkResults - 性能对比结果
   */
  drawTimeChart(benchmarkResults) {
    const canvas = document.getElementById('benchmarkTimeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 找到最大时间用于缩放
    const maxTime = Math.max(...benchmarkResults.map(r => r.avgTime));
    const barWidth = width / benchmarkResults.length * 0.8;
    const barSpacing = width / benchmarkResults.length * 0.2;
    
    // 绘制柱状图
    benchmarkResults.forEach((result, index) => {
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = (result.avgTime / maxTime) * (height - 60);
      const y = height - 40 - barHeight;
      
      // 绘制柱子
      ctx.fillStyle = result.status === 'success' ? '#4CAF50' : '#f44336';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // 绘制标签
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(result.provider.toUpperCase(), x + barWidth / 2, height - 20);
      ctx.fillText(`${result.avgTime.toFixed(1)}ms`, x + barWidth / 2, y - 5);
    });
  }

  /**
   * 绘制内存使用对比图表
   * @param {Array} benchmarkResults - 性能对比结果
   */
  drawMemoryChart(benchmarkResults) {
    const canvas = document.getElementById('benchmarkMemoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 过滤出有内存数据的结果
    const validResults = benchmarkResults.filter(r => r.memoryUsage !== null && r.memoryUsage !== undefined);
    
    if (validResults.length === 0) {
      // 如果没有内存数据，显示提示
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('内存数据不可用', width / 2, height / 2);
      return;
    }
    
    // 找到最大内存使用用于缩放
    const maxMemory = Math.max(...validResults.map(r => r.memoryUsage));
    const barWidth = width / validResults.length * 0.8;
    const barSpacing = width / validResults.length * 0.2;
    
    // 绘制柱状图
    validResults.forEach((result, index) => {
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = (result.memoryUsage / maxMemory) * (height - 60);
      const y = height - 40 - barHeight;
      
      // 绘制柱子
      ctx.fillStyle = result.status === 'success' ? '#2196F3' : '#f44336';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // 绘制标签
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(result.provider.toUpperCase(), x + barWidth / 2, height - 20);
      ctx.fillText(`${result.memoryUsage.toFixed(1)}MB`, x + barWidth / 2, y - 5);
    });
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
    const container = document.querySelector('.model-selector');
    if (container) {
      container.innerHTML = selectHTML;
      this.elements.modelSelect = document.getElementById('modelSelect');
    }
  }

  /**
   * 创建执行提供者选择器
   * @param {Object} providerInfo - 执行提供者信息
   */
  createExecutionProviderSelector(providerInfo) {
    const selectHTML = `
      <div class="execution-provider-section">
        <h3>执行提供者</h3>
        <select id="executionProviderSelect" class="execution-provider-select">
          <option value="auto">自动选择最佳</option>
          ${Object.entries(providerInfo).map(([key, info]) => `
            <option value="${key}" ${!info.supported ? 'disabled' : ''}>
              ${key.toUpperCase()} ${!info.supported ? '(不支持)' : ''}
            </option>
          `).join('')}
        </select>
        <div id="providerInfo" class="provider-info"></div>
      </div>
    `;
    
    // 插入到模型选择器后面
    const container = document.querySelector('.model-selector');
    if (container) {
      container.insertAdjacentHTML('afterend', selectHTML);
      this.elements.executionProviderSelect = document.getElementById('executionProviderSelect');
      this.elements.providerInfo = document.getElementById('providerInfo');
      
      // 绑定事件
      this.elements.executionProviderSelect.addEventListener('change', (e) => {
        this.updateProviderInfo(providerInfo, e.target.value);
      });
      
      // 初始化显示
      this.updateProviderInfo(providerInfo, 'auto');
    }
  }

  /**
   * 更新执行提供者信息显示
   * @param {Object} providerInfo - 执行提供者信息
   * @param {string} selectedProvider - 选中的提供者
   */
  updateProviderInfo(providerInfo, selectedProvider) {
    const infoDiv = this.elements.providerInfo;
    
    if (selectedProvider === 'auto') {
      infoDiv.innerHTML = `
        <div class="provider-details">
          <p><strong>自动选择</strong> - 系统将自动选择最佳的执行提供者</p>
          <div class="available-providers">
            <h4>可用提供者:</h4>
            <ul>
              ${Object.entries(providerInfo).map(([key, info]) => `
                <li class="${info.supported ? 'supported' : 'not-supported'}">
                  ${key.toUpperCase()}: ${info.supported ? '✅ 支持' : '❌ 不支持'}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    } else {
      const info = providerInfo[selectedProvider];
      if (info) {
        infoDiv.innerHTML = `
          <div class="provider-details">
            <h4>${info.description}</h4>
            <div class="provider-attributes">
              <div class="advantages">
                <h5>优势:</h5>
                <ul>
                  ${info.advantages.map(adv => `<li>✅ ${adv}</li>`).join('')}
                </ul>
              </div>
              <div class="disadvantages">
                <h5>劣势:</h5>
                <ul>
                  ${info.disadvantages.map(dis => `<li>⚠️ ${dis}</li>`).join('')}
                </ul>
              </div>
              <div class="use-case">
                <h5>适用场景:</h5>
                <p>${info.useCase}</p>
              </div>
            </div>
          </div>
        `;
      }
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