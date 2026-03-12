/**
 * 图像处理工具类
 * 负责图像的预处理、格式转换等功能
 */
export class ImageProcessor {
  /**
   * 预处理图像为模型输入格式
   * @param {HTMLImageElement} image - 输入图像
   * @param {number} targetSize - 目标尺寸
   * @param {string} modelType - 模型类型 ('classification' 或 'detection')
   * @returns {Float32Array} 预处理后的图像数据
   */
  static preprocessImage(image, targetSize = 224, modelType = 'classification') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = targetSize;
    canvas.height = targetSize;
    
    // 绘制并缩放图像
    ctx.drawImage(image, 0, 0, targetSize, targetSize);
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize).data;
    
    // 转换为Float32Array
    const float32Data = new Float32Array(3 * targetSize * targetSize);
    
    if (modelType === 'detection') {
      // YOLO模型需要归一化到[0,1]范围
      for (let i = 0; i < targetSize * targetSize; i++) {
        float32Data[i] = imageData[i * 4] / 255; // R
        float32Data[i + targetSize * targetSize] = imageData[i * 4 + 1] / 255; // G
        float32Data[i + 2 * targetSize * targetSize] = imageData[i * 4 + 2] / 255; // B
      }
    } else {
      // 分类模型使用ImageNet标准化
      const mean = [0.485, 0.456, 0.406];
      const std = [0.229, 0.224, 0.225];
      
      for (let i = 0; i < targetSize * targetSize; i++) {
        float32Data[i] = (imageData[i * 4] / 255 - mean[0]) / std[0]; // R
        float32Data[i + targetSize * targetSize] = (imageData[i * 4 + 1] / 255 - mean[1]) / std[1]; // G
        float32Data[i + 2 * targetSize * targetSize] = (imageData[i * 4 + 2] / 255 - mean[2]) / std[2]; // B
      }
    }
    
    return float32Data;
  }

  /**
   * 创建ONNX Tensor
   * @param {Float32Array} data - 图像数据
   * @param {number} targetSize - 目标尺寸
   * @param {Array} shape - 可选的张量形状，默认为 [1, 3, targetSize, targetSize]
   * @returns {ort.Tensor} ONNX Tensor
   */
  static createTensor(data, targetSize = 224, shape = null) {
    // 如果没有指定形状，使用默认形状
    const tensorShape = shape || [1, 3, targetSize, targetSize];
    
    // 如果第一个维度是 -1 或 undefined，表示批次大小是灵活的
    if (tensorShape[0] === -1 || tensorShape[0] === undefined) {
      tensorShape[0] = 1; // 设置为1
    }
    
    console.log('创建张量，形状:', tensorShape, '数据类型:', typeof data, '数据长度:', data.length);
    
    return new window.ort.Tensor("float32", data, tensorShape);
  }

  /**
   * 验证图像文件
   * @param {File} file - 图像文件
   * @returns {boolean} 是否有效
   */
  static validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('不支持的文件格式，请选择 JPEG、PNG 或 WebP 格式的图片');
    }
    
    if (file.size > maxSize) {
      throw new Error('文件大小不能超过 10MB');
    }
    
    return true;
  }

  /**
   * 加载图像文件
   * @param {File} file - 图像文件
   * @returns {Promise<HTMLImageElement>} 图像元素
   */
  static loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图像加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 在图像上绘制检测结果
   * @param {HTMLImageElement} image - 原始图像
   * @param {Array} detections - 检测结果数组
   * @param {number} modelInputSize - 模型输入尺寸
   * @returns {string} 绘制后的图像数据URL
   */
  static drawDetections(image, detections, modelInputSize = 640) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸为原始图像尺寸
    canvas.width = image.width;
    canvas.height = image.height;
    
    // 绘制原始图像
    ctx.drawImage(image, 0, 0);
    
    // 计算缩放比例
    const scaleX = image.width / modelInputSize;
    const scaleY = image.height / modelInputSize;
    
    // 绘制检测框
    detections.forEach((detection, index) => {
      const [x1, y1, x2, y2] = detection.bbox;
      
      // 缩放坐标到原始图像尺寸
      const scaledX1 = x1 * scaleX;
      const scaledY1 = y1 * scaleY;
      const scaledX2 = x2 * scaleX;
      const scaledY2 = y2 * scaleY;
      
      const width = scaledX2 - scaledX1;
      const height = scaledY2 - scaledY1;
      
      // 绘制边界框
      ctx.strokeStyle = this.getDetectionColor(index);
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX1, scaledY1, width, height);
      
      // 绘制标签背景
      const label = `${detection.label} ${(detection.confidence * 100).toFixed(1)}%`;
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 20;
      
      ctx.fillStyle = this.getDetectionColor(index);
      ctx.fillRect(scaledX1, scaledY1 - textHeight, textWidth + 8, textHeight);
      
      // 绘制标签文字
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText(label, scaledX1 + 4, scaledY1 - 4);
    });
    
    return canvas.toDataURL();
  }

  /**
   * 获取检测框颜色
   * @param {number} index - 检测框索引
   * @returns {string} 颜色值
   */
  static getDetectionColor(index) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[index % colors.length];
  }

  /**
   * 将风格迁移输出转换为图像
   * @param {Float32Array} data - 模型输出数据
   * @param {Array} shape - 输出形状 [batch, channels, height, width]
   * @returns {string} 图像数据URL
   */
  static tensorToImage(data, shape) {
    const [batch, channels, height, width] = shape;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    const imageData = ctx.createImageData(width, height);
    
    // 将张量数据转换为图像数据
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const tensorIndex = y * width + x;
        
        // 假设数据是归一化的 [0,1] 范围，需要转换到 [0,255]
        const r = Math.max(0, Math.min(255, Math.round(data[tensorIndex] * 255)));
        const g = Math.max(0, Math.min(255, Math.round(data[height * width + tensorIndex] * 255)));
        const b = Math.max(0, Math.min(255, Math.round(data[2 * height * width + tensorIndex] * 255)));
        
        imageData.data[pixelIndex] = r;     // R
        imageData.data[pixelIndex + 1] = g; // G
        imageData.data[pixelIndex + 2] = b; // B
        imageData.data[pixelIndex + 3] = 255; // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  /**
   * 预处理风格迁移图像
   * @param {HTMLImageElement} image - 输入图像
   * @param {number} targetSize - 目标尺寸
   * @returns {Float32Array} 预处理后的图像数据
   */
  static preprocessStyleTransferImage(image, targetSize = 512) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = targetSize;
    canvas.height = targetSize;
    
    // 绘制并缩放图像
    ctx.drawImage(image, 0, 0, targetSize, targetSize);
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize).data;
    
    // 转换为Float32Array，归一化到[0,1]
    const float32Data = new Float32Array(3 * targetSize * targetSize);
    
    for (let i = 0; i < targetSize * targetSize; i++) {
      float32Data[i] = imageData[i * 4] / 255; // R
      float32Data[i + targetSize * targetSize] = imageData[i * 4 + 1] / 255; // G
      float32Data[i + 2 * targetSize * targetSize] = imageData[i * 4 + 2] / 255; // B
    }
    
    return float32Data;
  }
} 