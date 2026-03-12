import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Palette, Download, Loader2 } from 'lucide-react';
import { ModelManager } from '../models/modelManager';
import { ImageProcessor } from '../utils/imageProcessor';

const StyleTransfer = () => {
  const [contentImage, setContentImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('vangogh');
  const [modelManager, setModelManager] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [executionProvider, setExecutionProvider] = useState('wasm');
  const [error, setError] = useState(null);
  const [performanceInfo, setPerformanceInfo] = useState(null);
  
  const contentInputRef = useRef(null);

  const stylePresets = [
    { id: 'vangogh', name: '梵高风格', description: '后印象派艺术风格' },
    { id: 'monet', name: '莫奈风格', description: '印象派绘画风格' },
    { id: 'picasso', name: '毕加索风格', description: '立体主义艺术风格' },
    { id: 'ukiyo', name: '浮世绘风格', description: '日本传统绘画风格' }
  ];

  // 初始化模型管理器
  useEffect(() => {
    const initModelManager = async () => {
      try {
        if (typeof window.ort === 'undefined') {
          throw new Error('ONNX Runtime Web 未加载，请检查网络连接');
        }
        
        const manager = new ModelManager();
        setModelManager(manager);
        
        // 检查WebGPU支持
        const webgpuSupported = ModelManager.checkWebGPUSupport();
        if (!webgpuSupported) {
          setExecutionProvider('wasm');
        } else {
          setExecutionProvider('webgpu');
        }
      } catch (error) {
        console.error('模型管理器初始化失败:', error);
        setError('模型管理器初始化失败');
      }
    };

    initModelManager();
  }, []);

  // 加载模型
  const loadModel = async () => {
    if (!modelManager) return;
    
    setIsModelLoading(true);
    setError(null);
    
    try {
      const models = ModelManager.getAvailableModels();
      const model = models.find(m => m.type === 'style_transfer');
      
      if (!model) {
        throw new Error('风格迁移模型配置未找到');
      }
      
      await modelManager.loadModel(model.path, model.labelsPath, executionProvider);
      setModelLoaded(true);
      console.log('风格迁移模型加载成功');
    } catch (error) {
      console.error('模型加载失败:', error);
      setError(`模型加载失败: ${error.message}`);
    } finally {
      setIsModelLoading(false);
    }
  };

  // 当模型或执行提供者改变时重新加载模型
  useEffect(() => {
    if (modelManager && executionProvider) {
      loadModel();
    }
  }, [modelManager, executionProvider]);

  const handleContentImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // 验证图像文件
      ImageProcessor.validateImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setContentImage(e.target.result);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError(error.message);
    }
  };


  const runStyleTransfer = async () => {
    if (!contentImage || !modelManager || !modelLoaded) {
      setError('请先加载模型并选择内容图像');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setResultImage(null);
    
    try {
      const startTime = performance.now();
      
      // 获取模型配置
      const models = ModelManager.getAvailableModels();
      const model = models.find(m => m.type === 'style_transfer');
      
      if (!model) {
        throw new Error('风格迁移模型配置未找到');
      }
      
      // 加载内容图像文件
      const contentFile = contentInputRef.current?.files[0];
      
      if (!contentFile) {
        throw new Error('未找到内容图像文件');
      }
      
      const contentImg = await ImageProcessor.loadImageFile(contentFile);
      
      // 预处理内容图像
      const contentData = ImageProcessor.preprocessStyleTransferImage(contentImg, model.inputSize);
      
      // 创建内容张量
      const contentTensor = ImageProcessor.createTensor(contentData, model.inputSize, [1, 3, model.inputSize, model.inputSize]);
      
      // 执行风格迁移推理（使用预设风格）
      const styleTransferResult = await modelManager.runStyleTransferInference(contentTensor, selectedStyle);
      
      const endTime = performance.now();
      const inferenceTime = endTime - startTime;
      
      // 将输出转换为图像
      const resultImageData = ImageProcessor.tensorToImage(styleTransferResult.outputData, styleTransferResult.outputShape);
      setResultImage(resultImageData);
      
      setPerformanceInfo({
        inferenceTime: inferenceTime.toFixed(1),
        modelName: 'StyleTransfer',
        executionProvider: executionProvider,
        inputSize: `${model.inputSize}x${model.inputSize}`,
        selectedStyle: selectedStyle
      });
      
    } catch (error) {
      console.error('风格迁移失败:', error);
      setError(`风格迁移失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'style-transfer-result.jpg';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            风格迁移
          </h1>
          <p className="text-xl text-gray-600">
            将艺术风格应用到您的照片上，创造独特的视觉效果
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧控制面板 */}
          <div className="space-y-6">
            {/* 模型配置 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                模型配置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    执行提供者
                  </label>
                  <select
                    value={executionProvider}
                    onChange={(e) => setExecutionProvider(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="webgpu">WebGPU</option>
                    <option value="webgl">WebGL</option>
                    <option value="wasm">WebAssembly</option>
                    <option value="cpu">CPU</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">模型状态:</span>
                  <span className={`text-sm font-medium ${
                    modelLoaded ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isModelLoading ? '加载中...' : modelLoaded ? '已加载' : '未加载'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 错误显示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">错误</h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 内容图像上传 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                内容图像
              </h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => contentInputRef.current?.click()}
              >
                <input
                  ref={contentInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleContentImageSelect}
                  className="hidden"
                />
                
                {contentImage ? (
                  <img
                    src={contentImage}
                    alt="内容图像"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="py-8">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">点击选择内容图像</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 风格选择 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                风格选择
              </h3>
              
              <div className="space-y-3">
                {stylePresets.map((style) => (
                  <div
                    key={style.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStyle === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="font-medium text-gray-900">{style.name}</div>
                    <div className="text-sm text-gray-600">{style.description}</div>
                  </div>
                ))}
              </div>
            </motion.div>


            {/* 处理控制 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                开始处理
              </h3>
              
              <button
                onClick={runStyleTransfer}
                disabled={!contentImage || isProcessing || !modelLoaded || isModelLoading}
                className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '处理中...' : 
                 isModelLoading ? '模型加载中...' :
                 !modelLoaded ? '模型未加载' :
                 !contentImage ? '请选择内容图像' :
                 '开始风格迁移'}
              </button>
              
              {!modelLoaded && !isModelLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  请等待模型加载完成后再进行风格迁移
                </p>
              )}
              
              {resultImage && (
                <button
                  onClick={downloadResult}
                  className="w-full button-secondary py-3 mt-3 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>下载结果</span>
                </button>
              )}
            </motion.div>
          </div>

          {/* 右侧结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 处理结果 */}
            {resultImage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  风格迁移结果
                </h3>
                
                <div className="flex justify-center">
                  <img
                    src={resultImage}
                    alt="风格迁移结果"
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  预览区域
                </h3>
                
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>上传内容图像并选择风格后开始处理</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 处理信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                处理信息
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">内容图像</div>
                  <div className="text-sm text-gray-600">
                    {contentImage ? '已上传' : '未上传'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">选择风格</div>
                  <div className="text-sm text-gray-600">
                    {stylePresets.find(s => s.id === selectedStyle)?.name || '未选择'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">处理状态</div>
                  <div className="text-sm text-gray-600">
                    {isProcessing ? '处理中...' : '待处理'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">结果状态</div>
                  <div className="text-sm text-gray-600">
                    {resultImage ? '已完成' : '未生成'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 性能信息 */}
            {performanceInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  性能信息
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>WebGPU 支持:</span>
                    <span className={ModelManager.checkWebGPUSupport() ? 'text-green-600' : 'text-red-600'}>
                      {ModelManager.checkWebGPUSupport() ? '是' : '否'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>当前执行提供者:</span>
                    <span className="text-blue-600">{executionProvider.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>模型名称:</span>
                    <span>{performanceInfo.modelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>选择风格:</span>
                    <span className="text-purple-600">
                      {stylePresets.find(s => s.id === performanceInfo.selectedStyle)?.name || performanceInfo.selectedStyle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>输入尺寸:</span>
                    <span>{performanceInfo.inputSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>处理时间:</span>
                    <span className="text-green-600">
                      {performanceInfo.inferenceTime}ms
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleTransfer; 