import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ModelManager } from '../models/modelManager';
import { ImageProcessor } from '../utils/imageProcessor';

const ImageClassification = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [modelManager, setModelManager] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ResNet18-Simplified');
  const [executionProvider, setExecutionProvider] = useState('webgpu');
  const [error, setError] = useState(null);
  const [performanceInfo, setPerformanceInfo] = useState(null);
  const fileInputRef = useRef(null);

  // 初始化模型管理器
  useEffect(() => {
    const initModelManager = async () => {
      try {
        // 初始化 ONNX Runtime Web
        if (typeof window.ort === 'undefined') {
          throw new Error('ONNX Runtime Web 未加载，请检查网络连接');
        }
        console.log('初始化 ONNX Runtime Web');
        
        const manager = new ModelManager();
        setModelManager(manager);
        
        // 检查WebGPU支持
        const webgpuSupported = ModelManager.checkWebGPUSupport();
        if (!webgpuSupported) {
          setExecutionProvider('wasm');
          console.log('WebGPU不支持，切换到WASM');
        } else {
          // 即使支持WebGPU，也先使用WASM确保稳定性
          setExecutionProvider('wasm');
          console.log('为稳定性，先使用WASM后端');
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
      const model = models.find(m => m.name === selectedModel);
      
      if (!model) {
        throw new Error('模型配置未找到');
      }
      
      await modelManager.loadModel(model.path, model.labelsPath, executionProvider);
      setModelLoaded(true);
      console.log('模型加载成功');
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
        setResults(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError(error.message);
    }
  };

  const runInference = async () => {
    if (!selectedImage || !modelManager || !modelLoaded) {
      setError('请先加载模型并选择图像');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const startTime = performance.now();
      
      // 加载图像文件
      const file = fileInputRef.current?.files[0];
      if (!file) {
        throw new Error('未找到图像文件');
      }
      
      const image = await ImageProcessor.loadImageFile(file);
      
      // 预处理图像
      const imageData = ImageProcessor.preprocessImage(image, 224);
      
      // 创建张量
      const tensor = ImageProcessor.createTensor(imageData, 224);
      
      // 执行推理
      const inferenceResult = await modelManager.runInference(tensor);
      
      const endTime = performance.now();
      const inferenceTime = endTime - startTime;
      
      // 格式化结果
      const formattedResults = inferenceResult.predictions.map(pred => ({
        label: pred.label,
        confidence: pred.score
      }));
      
      setResults(formattedResults);
      setPerformanceInfo({
        inferenceTime: inferenceTime.toFixed(1),
        modelName: selectedModel,
        executionProvider: executionProvider,
        inputSize: '224x224'
      });
      
    } catch (error) {
      console.error('推理失败:', error);
      setError(`推理失败: ${error.message}`);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            图像分类
          </h1>
          <p className="text-xl text-gray-600">
            使用预训练的AI模型对图像进行智能分类
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* 模型配置 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                模型配置
              </h3>
              
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
                    <option value="ResNet18-Simplified">ResNet18-Simplified</option>
                    <option value="ResNet18">ResNet18</option>
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
                  <span className={`text-sm font-medium ${
                    modelLoaded ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isModelLoading ? '加载中...' : modelLoaded ? '已加载' : '未加载'}
                  </span>
                </div>
              </div>
            </div>

            {/* 错误显示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">错误</h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                图像上传
              </h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
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
                  <img
                    src={selectedImage}
                    alt="预览"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                ) : (
                  <div>
                    <p className="text-gray-600">点击选择图像</p>
                    <p className="text-sm text-gray-500 mt-1">
                      支持 JPEG、PNG、WebP 格式
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                推理控制
              </h3>
              
              <button
                onClick={runInference}
                disabled={!selectedImage || isLoading || !modelLoaded || isModelLoading}
                className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '推理中...' : 
                 isModelLoading ? '模型加载中...' :
                 !modelLoaded ? '模型未加载' :
                 !selectedImage ? '请选择图像' :
                 '开始推理'}
              </button>
              
              {!modelLoaded && !isModelLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  请等待模型加载完成后再进行推理
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  推理结果
                </h3>
                
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{result.label}</span>
                      <span className="text-blue-600">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  <span>{selectedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span>输入尺寸:</span>
                  <span>{performanceInfo?.inputSize || '224x224'}</span>
                </div>
                <div className="flex justify-between">
                  <span>推理时间:</span>
                  <span className="text-green-600">
                    {performanceInfo?.inferenceTime ? `${performanceInfo.inferenceTime}ms` : '未测试'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageClassification; 