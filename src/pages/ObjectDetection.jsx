import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Target, 
  Download, 
  Loader2, 
  Eye, 
  BarChart3, 
  Settings, 
  Info, 
  Filter,
  Maximize2,
  RotateCcw,
  Share2,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { ModelManager } from '../models/modelManager';
import { ImageProcessor } from '../utils/imageProcessor';

const ObjectDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('YOLOv8n');
  const [modelManager, setModelManager] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [executionProvider, setExecutionProvider] = useState('webgpu');
  const [error, setError] = useState(null);
  const [performanceInfo, setPerformanceInfo] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [nmsThreshold, setNmsThreshold] = useState(0.4);
  const [detectionStats, setDetectionStats] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [selectedDetection, setSelectedDetection] = useState(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

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
      const model = models.find(m => m.name === selectedModel && m.type === 'detection');
      
      if (!model) {
        throw new Error('检测模型配置未找到');
      }
      
      await modelManager.loadModel(model.path, model.labelsPath, executionProvider);
      setModelLoaded(true);
      console.log('检测模型加载成功');
    } catch (error) {
      console.error('模型加载失败:', error);
      setError(`模型加载失败: ${error.message}`);
    } finally {
      setIsModelLoading(false);
    }
  };

  // 当模型或执行提供者改变时重新加载模型
  useEffect(() => {
    if (modelManager && selectedModel && executionProvider) {
      loadModel();
    }
  }, [modelManager, selectedModel, executionProvider]);

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // 验证图像文件
      ImageProcessor.validateImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setDetectionResults(null);
        setResultImage(null);
        setError(null);
        setSelectedDetection(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError(error.message);
    }
  };

  const runDetection = async () => {
    if (!selectedImage || !modelManager || !modelLoaded) {
      setError('请先加载模型并选择图像');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setDetectionResults(null);
    setResultImage(null);
    setSelectedDetection(null);
    
    try {
      const startTime = performance.now();
      
      // 加载图像文件
      const file = fileInputRef.current?.files[0];
      if (!file) {
        throw new Error('未找到图像文件');
      }
      
      const image = await ImageProcessor.loadImageFile(file);
      
      // 获取模型配置
      const models = ModelManager.getAvailableModels();
      const model = models.find(m => m.name === selectedModel && m.type === 'detection');
      
      if (!model) {
        throw new Error('模型配置未找到');
      }
      
      // 预处理图像
      const imageData = ImageProcessor.preprocessImage(image, model.inputSize, 'detection');
      
      // 创建张量
      const tensor = ImageProcessor.createTensor(imageData, model.inputSize, [1, 3, model.inputSize, model.inputSize]);
      
      // 执行检测推理
      const detectionResult = await modelManager.runDetectionInference(tensor);
      
      const endTime = performance.now();
      const inferenceTime = endTime - startTime;
      
      // 应用置信度阈值过滤
      const filteredDetections = detectionResult.detections.filter(
        detection => detection.confidence >= confidenceThreshold
      );
      
      setDetectionResults(filteredDetections);
      setPerformanceInfo({
        inferenceTime: inferenceTime.toFixed(1),
        modelName: selectedModel,
        executionProvider: executionProvider,
        inputSize: `${model.inputSize}x${model.inputSize}`,
        detectionCount: filteredDetections.length,
        totalDetections: detectionResult.detections.length
      });
      
      // 计算检测统计
      const stats = calculateDetectionStats(filteredDetections);
      setDetectionStats(stats);
      
      // 绘制检测结果
      const resultImageData = ImageProcessor.drawDetections(image, filteredDetections, model.inputSize);
      setResultImage(resultImageData);
      
      // 添加到历史记录
      const historyItem = {
        id: Date.now(),
        timestamp: new Date(),
        image: selectedImage,
        detections: filteredDetections,
        stats: stats,
        performance: {
          inferenceTime: inferenceTime.toFixed(1),
          modelName: selectedModel,
          executionProvider: executionProvider
        }
      };
      setDetectionHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 保留最近10次检测
      
    } catch (error) {
      console.error('检测失败:', error);
      setError(`检测失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateDetectionStats = (detections) => {
    if (!detections || detections.length === 0) {
      return {
        totalObjects: 0,
        averageConfidence: 0,
        confidenceDistribution: {},
        classDistribution: {},
        topClasses: [],
        confidenceRange: { min: 0, max: 0 }
      };
    }

    const confidences = detections.map(d => d.confidence);
    const classes = detections.map(d => d.label);
    
    // 计算置信度分布
    const confidenceDistribution = {
      high: detections.filter(d => d.confidence >= 0.8).length,
      medium: detections.filter(d => d.confidence >= 0.5 && d.confidence < 0.8).length,
      low: detections.filter(d => d.confidence < 0.5).length
    };
    
    // 计算类别分布
    const classDistribution = classes.reduce((acc, className) => {
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {});
    
    // 获取最常见的类别
    const topClasses = Object.entries(classDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([className, count]) => ({ className, count }));
    
    return {
      totalObjects: detections.length,
      averageConfidence: (confidences.reduce((a, b) => a + b, 0) / confidences.length * 100).toFixed(1),
      confidenceDistribution,
      classDistribution,
      topClasses,
      confidenceRange: {
        min: Math.min(...confidences),
        max: Math.max(...confidences)
      }
    };
  };

  const downloadResults = () => {
    if (!detectionResults) return;
    
    const resultsText = detectionResults.map(r => 
      `${r.label}: ${(r.confidence * 100).toFixed(1)}% (${r.bbox.map(b => b.toFixed(2)).join(', ')})`
    ).join('\n');
    
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'detection-results.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'detection-result.png';
    link.click();
  };

  const resetDetection = () => {
    setSelectedImage(null);
    setDetectionResults(null);
    setResultImage(null);
    setError(null);
    setSelectedDetection(null);
    setDetectionStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const shareResults = async () => {
    if (!detectionResults || !resultImage) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: '目标检测结果',
          text: `检测到 ${detectionResults.length} 个对象`,
          url: window.location.href
        });
      } else {
        // 降级到复制到剪贴板
        const text = `检测到 ${detectionResults.length} 个对象:\n${detectionResults.map(r => `${r.label}: ${(r.confidence * 100).toFixed(1)}%`).join('\n')}`;
        await navigator.clipboard.writeText(text);
        alert('结果已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Target className="w-10 h-10 text-blue-600" />
            智能目标检测
          </h1>
          <p className="text-xl text-gray-600">
            基于YOLOv8的实时目标检测，支持80种COCO类别识别
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 模型配置 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  模型配置
                </h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择模型
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="YOLOv8n">YOLOv8n</option>
                  </select>
                </div>
                
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
                  <span className={`text-sm font-medium flex items-center ${
                    modelLoaded ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isModelLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        加载中...
                      </>
                    ) : modelLoaded ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        已加载
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        未加载
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* 高级设置 */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        置信度阈值: {confidenceThreshold}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NMS阈值: {nmsThreshold}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={nmsThreshold}
                        onChange={(e) => setNmsThreshold(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 错误显示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">错误</h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 图像上传 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                图像上传
              </h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {selectedImage ? (
                  <div className="space-y-2">
                    <img
                      src={selectedImage}
                      alt="预览"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-600">点击重新选择</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">点击选择图像</p>
                    <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, WebP 格式</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 检测控制 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                检测控制
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={runDetection}
                  disabled={!selectedImage || isProcessing || !modelLoaded || isModelLoading}
                  className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      检测中...
                    </>
                  ) : isModelLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      模型加载中...
                    </>
                  ) : !modelLoaded ? (
                    '模型未加载'
                  ) : !selectedImage ? (
                    '请选择图像'
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      开始检测
                    </>
                  )}
                </button>
                
                {detectionResults && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={downloadResults}
                      className="button-secondary py-2 flex items-center justify-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      结果
                    </button>
                    <button
                      onClick={downloadImage}
                      className="button-secondary py-2 flex items-center justify-center gap-2 text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      图像
                    </button>
                  </div>
                )}
                
                <button
                  onClick={resetDetection}
                  className="w-full button-secondary py-2 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
              </div>
            </motion.div>

            {/* 检测历史 */}
            {detectionHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  检测历史
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {detectionHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setSelectedImage(item.image);
                        setDetectionResults(item.detections);
                        setDetectionStats(item.stats);
                        setPerformanceInfo(item.performance);
                      }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {item.detections.length} 个对象
                        </span>
                        <span className="text-gray-500">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {item.performance.modelName} • {item.performance.inferenceTime}ms
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* 右侧结果展示 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 检测结果 */}
            {resultImage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    检测结果
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={shareResults}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={resultImage}
                      alt="检测结果"
                      className={`w-full h-auto rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 object-contain bg-black' : ''}`}
                    />
                    {isFullscreen && (
                      <button
                        onClick={toggleFullscreen}
                        className="fixed top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70"
                      >
                        <Maximize2 className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                  
                  {/* 检测对象列表 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">检测到的对象:</h4>
                    {detectionResults.map((result, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedDetection === index ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedDetection(selectedDetection === index ? null : index)}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ImageProcessor.getDetectionColor(index) }}
                          ></div>
                          <span className="font-medium">{result.label}</span>
                          <span className="text-sm text-gray-500">
                            ({result.bbox.map(b => b.toFixed(1)).join(', ')})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>上传图像后开始目标检测</p>
                    <p className="text-sm mt-2">支持检测80种常见对象类别</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 检测统计 */}
            {detectionStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  检测统计
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {detectionStats.totalObjects}
                    </div>
                    <div className="text-sm text-blue-600">检测对象</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {detectionStats.averageConfidence}%
                    </div>
                    <div className="text-sm text-green-600">平均置信度</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(detectionStats.classDistribution).length}
                    </div>
                    <div className="text-sm text-purple-600">对象类别</div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedModel.toUpperCase()}
                    </div>
                    <div className="text-sm text-orange-600">当前模型</div>
                  </div>
                </div>

                {/* 置信度分布 */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">置信度分布</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {detectionStats.confidenceDistribution.high}
                      </div>
                      <div className="text-sm text-gray-600">高 (≥80%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {detectionStats.confidenceDistribution.medium}
                      </div>
                      <div className="text-sm text-gray-600">中 (50-80%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {detectionStats.confidenceDistribution.low}
                      </div>
                      <div className="text-sm text-gray-600">低 (50%)</div>
                    </div>
                  </div>
                </div>

                {/* 常见类别 */}
                {detectionStats.topClasses.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">常见类别</h4>
                    <div className="space-y-2">
                      {detectionStats.topClasses.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.className}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${(item.count / detectionStats.totalObjects) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 性能信息 */}
            {performanceInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  性能信息
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">WebGPU 支持:</span>
                      <span className={ModelManager.checkWebGPUSupport() ? 'text-green-600' : 'text-red-600'}>
                        {ModelManager.checkWebGPUSupport() ? '是' : '否'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">执行提供者:</span>
                      <span className="text-blue-600 font-medium">{performanceInfo.executionProvider.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">模型名称:</span>
                      <span className="font-medium">{performanceInfo.modelName}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">输入尺寸:</span>
                      <span className="font-medium">{performanceInfo.inputSize}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">推理时间:</span>
                      <span className="text-green-600 font-medium">
                        {performanceInfo.inferenceTime}ms
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">检测数量:</span>
                      <span className="font-medium">
                        {performanceInfo.detectionCount} / {performanceInfo.totalDetections}
                      </span>
                    </div>
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

export default ObjectDetection;