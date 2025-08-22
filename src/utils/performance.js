/**
 * 性能监控工具类
 * 提供性能测量和监控功能
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      modelLoadTime: 0,
      inferenceTime: 0,
      memoryUsage: 0,
      fps: 0
    };
    this.timers = new Map();
  }

  /**
   * 开始计时
   * @param {string} name - 计时器名称
   */
  startTimer(name) {
    this.timers.set(name, performance.now());
  }

  /**
   * 结束计时
   * @param {string} name - 计时器名称
   * @returns {number} 耗时（毫秒）
   */
  endTimer(name) {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' not found`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    return duration;
  }

  /**
   * 获取内存使用情况
   * @returns {Object} 内存信息
   */
  getMemoryInfo() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
        limitMB: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
      };
    }
    return null;
  }

  /**
   * 测量函数执行时间
   * @param {Function} fn - 要测量的函数
   * @param {string} name - 测量名称
   * @returns {Promise<number>} 执行时间
   */
  async measureFunction(fn, name = 'function') {
    this.startTimer(name);
    try {
      const result = await fn();
      const duration = this.endTimer(name);
      console.log(`${name} 执行时间: ${duration.toFixed(2)}ms`);
      return { result, duration };
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  /**
   * 获取系统信息
   * @returns {Object} 系统信息
   */
  getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints
    };
  }

  /**
   * 检查WebGPU支持
   * @returns {Object} WebGPU支持信息
   */
  getWebGPUInfo() {
    const supported = 'gpu' in navigator;
    return {
      supported,
      available: supported ? 'gpu' in navigator : false,
      adapter: null
    };
  }

  /**
   * 获取性能指标摘要
   * @returns {Object} 性能摘要
   */
  getPerformanceSummary() {
    return {
      memory: this.getMemoryInfo(),
      system: this.getSystemInfo(),
      webgpu: this.getWebGPUInfo(),
      metrics: this.metrics
    };
  }

  /**
   * 格式化性能数据
   * @param {Object} data - 性能数据
   * @returns {string} 格式化的字符串
   */
  formatPerformanceData(data) {
    const lines = [];
    
    if (data.memory) {
      lines.push(`内存使用: ${data.memory.usedMB}MB / ${data.memory.totalMB}MB`);
    }
    
    if (data.metrics.inferenceTime > 0) {
      lines.push(`推理时间: ${data.metrics.inferenceTime.toFixed(2)}ms`);
    }
    
    if (data.metrics.modelLoadTime > 0) {
      lines.push(`模型加载: ${data.metrics.modelLoadTime.toFixed(2)}ms`);
    }
    
    return lines.join(' | ');
  }
} 