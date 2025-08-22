/**
 * 错误处理工具类
 * 提供统一的错误处理和日志记录功能
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * 错误类型枚举
   */
  static ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    MODEL: 'MODEL_ERROR',
    IMAGE: 'IMAGE_ERROR',
    WEBGPU: 'WEBGPU_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
  };

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} context - 错误上下文
   * @param {string} type - 错误类型
   */
  handleError(error, context = '', type = ErrorHandler.ErrorTypes.UNKNOWN) {
    const errorInfo = {
      type,
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // 记录错误
    this.logError(errorInfo);

    // 控制台输出
    console.error(`[${type}] ${context}:`, error);

    // 返回用户友好的错误消息
    return this.getUserFriendlyMessage(error, type);
  }

  /**
   * 记录错误到日志
   * @param {Object} errorInfo - 错误信息
   */
  logError(errorInfo) {
    this.errorLog.push(errorInfo);
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // 可以在这里添加错误上报逻辑
    this.reportError(errorInfo);
  }

  /**
   * 错误上报（可选）
   * @param {Object} errorInfo - 错误信息
   */
  reportError(errorInfo) {
    // 这里可以集成错误上报服务，如 Sentry
    // 示例：Sentry.captureException(errorInfo);
    
    // 或者发送到自己的服务器
    if (process.env.NODE_ENV === 'production') {
      // 生产环境错误上报
      this.sendErrorToServer(errorInfo);
    }
  }

  /**
   * 发送错误到服务器
   * @param {Object} errorInfo - 错误信息
   */
  async sendErrorToServer(errorInfo) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (error) {
      console.warn('错误上报失败:', error);
    }
  }

  /**
   * 获取用户友好的错误消息
   * @param {Error} error - 错误对象
   * @param {string} type - 错误类型
   * @returns {string} 用户友好的错误消息
   */
  getUserFriendlyMessage(error, type) {
    const messages = {
      [ErrorHandler.ErrorTypes.NETWORK]: {
        'Failed to fetch': '网络连接失败，请检查网络连接',
        'Network Error': '网络错误，请稍后重试',
        'Timeout': '请求超时，请稍后重试'
      },
      [ErrorHandler.ErrorTypes.MODEL]: {
        'Model loading failed': '模型加载失败，请刷新页面重试',
        'Invalid model format': '模型格式无效',
        'Model not found': '模型文件未找到'
      },
      [ErrorHandler.ErrorTypes.IMAGE]: {
        'Invalid image format': '不支持的图像格式',
        'Image too large': '图像文件过大',
        'Image loading failed': '图像加载失败'
      },
      [ErrorHandler.ErrorTypes.WEBGPU]: {
        'WebGPU not supported': '您的浏览器不支持WebGPU，请使用Chrome 113+或Edge 113+',
        'GPU adapter not found': '未找到可用的GPU适配器',
        'WebGPU initialization failed': 'WebGPU初始化失败'
      },
      [ErrorHandler.ErrorTypes.VALIDATION]: {
        'Invalid input': '输入数据无效',
        'Missing required field': '缺少必需字段',
        'File size exceeded': '文件大小超出限制'
      }
    };

    const typeMessages = messages[type] || {};
    
    // 尝试匹配具体的错误消息
    for (const [key, message] of Object.entries(typeMessages)) {
      if (error.message.includes(key)) {
        return message;
      }
    }

    // 默认错误消息
    const defaultMessages = {
      [ErrorHandler.ErrorTypes.NETWORK]: '网络连接出现问题，请稍后重试',
      [ErrorHandler.ErrorTypes.MODEL]: '模型加载出现问题，请刷新页面重试',
      [ErrorHandler.ErrorTypes.IMAGE]: '图像处理出现问题，请检查图像格式',
      [ErrorHandler.ErrorTypes.WEBGPU]: 'WebGPU支持出现问题，请检查浏览器设置',
      [ErrorHandler.ErrorTypes.VALIDATION]: '输入数据验证失败，请检查输入内容',
      [ErrorHandler.ErrorTypes.UNKNOWN]: '发生未知错误，请稍后重试'
    };

    return defaultMessages[type] || '发生错误，请稍后重试';
  }

  /**
   * 验证输入参数
   * @param {Object} params - 参数对象
   * @param {Object} schema - 验证模式
   * @returns {Object} 验证结果
   */
  validateParams(params, schema) {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = params[key];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} 是必需参数`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${key} 类型错误，期望 ${rules.type}，实际 ${typeof value}`);
        }

        if (rules.min && value < rules.min) {
          errors.push(`${key} 值太小，最小值为 ${rules.min}`);
        }

        if (rules.max && value > rules.max) {
          errors.push(`${key} 值太大，最大值为 ${rules.max}`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} 格式不正确`);
        }
      }
    }

    if (errors.length > 0) {
      const error = new Error(errors.join('; '));
      error.type = ErrorHandler.ErrorTypes.VALIDATION;
      throw error;
    }

    return true;
  }

  /**
   * 获取错误日志
   * @returns {Array} 错误日志
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * 清空错误日志
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * 创建自定义错误
   * @param {string} message - 错误消息
   * @param {string} type - 错误类型
   * @param {Object} context - 错误上下文
   * @returns {Error} 自定义错误对象
   */
  static createError(message, type = ErrorHandler.ErrorTypes.UNKNOWN, context = {}) {
    const error = new Error(message);
    error.type = type;
    error.context = context;
    return error;
  }
} 