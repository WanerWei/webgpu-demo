import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Target, Download, Loader2, Eye } from 'lucide-react';

const ObjectDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('yolo');
  
  const fileInputRef = useRef(null);

  const models = [
    { id: 'yolo', name: 'YOLO v8', description: '实时目标检测，支持80+类别' },
    { id: 'ssd', name: 'SSD MobileNet', description: '轻量级检测模型，适合移动设备' },
    { id: 'faster-rcnn', name: 'Faster R-CNN', description: '高精度检测，适合复杂场景' }
  ];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setDetectionResults(null);
    };
    reader.readAsDataURL(file);
  };

  const runDetection = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    // 模拟目标检测处理
    setTimeout(() => {
      setDetectionResults([
        { label: '人', confidence: 0.95, bbox: [100, 50, 200, 300] },
        { label: '汽车', confidence: 0.87, bbox: [300, 200, 450, 280] },
        { label: '自行车', confidence: 0.76, bbox: [150, 250, 220, 320] }
      ]);
      setIsProcessing(false);
    }, 2500);
  };

  const downloadResults = () => {
    if (!detectionResults) return;
    
    const resultsText = detectionResults.map(r => 
      `${r.label}: ${(r.confidence * 100).toFixed(1)}%`
    ).join('\n');
    
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'detection-results.txt';
    link.click();
    URL.revokeObjectURL(url);
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
            目标检测
          </h1>
          <p className="text-xl text-gray-600">
            实时检测图像中的多个对象，提供边界框和类别信息
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧控制面板 */}
          <div className="space-y-6">
            {/* 模型选择 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                检测模型
              </h3>
              
              <div className="space-y-3">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-600">{model.description}</div>
                  </div>
                ))}
              </div>
            </motion.div>

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
                  <img
                    src={selectedImage}
                    alt="预览"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="py-8">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">点击选择图像</p>
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
                开始检测
              </h3>
              
              <button
                onClick={runDetection}
                disabled={!selectedImage || isProcessing}
                className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  '开始检测'
                )}
              </button>
              
              {detectionResults && (
                <button
                  onClick={downloadResults}
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
            {/* 检测结果 */}
            {detectionResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  检测结果
                </h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="检测结果"
                      className="w-full h-auto rounded-lg"
                    />
                    {/* 这里应该绘制边界框 */}
                  </div>
                  
                  <div className="space-y-3">
                    {detectionResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{result.label}</span>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
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
                  </div>
                </div>
              </motion.div>
            )}

            {/* 检测统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                检测统计
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {detectionResults ? detectionResults.length : 0}
                  </div>
                  <div className="text-sm text-blue-600">检测对象</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {detectionResults ? 
                      (detectionResults.reduce((sum, r) => sum + r.confidence, 0) / detectionResults.length * 100).toFixed(1) : 
                      0
                    }%
                  </div>
                  <div className="text-sm text-green-600">平均置信度</div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedModel.toUpperCase()}
                  </div>
                  <div className="text-sm text-purple-600">当前模型</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetection; 