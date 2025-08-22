/**
 * 图像处理工具类
 * 负责图像的预处理、格式转换等功能
 */
export class ImageProcessor {
  /**
   * 预处理图像为模型输入格式
   * @param {HTMLImageElement} image - 输入图像
   * @param {number} targetSize - 目标尺寸
   * @returns {Float32Array} 预处理后的图像数据
   */
  static preprocessImage(image, targetSize = 224) {
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
    
    return new ort.Tensor("float32", data, tensorShape);
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
} 