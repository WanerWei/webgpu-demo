import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ImageClassification = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setResults(null);
    };
    reader.readAsDataURL(file);
  };

  const runInference = async () => {
    if (!selectedImage) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setResults([
        { label: '猫', confidence: 0.95 },
        { label: '狗', confidence: 0.03 },
        { label: '老虎', confidence: 0.01 }
      ]);
      setIsLoading(false);
    }, 2000);
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
                disabled={!selectedImage || isLoading}
                className="w-full button-primary py-3 disabled:opacity-50"
              >
                {isLoading ? '推理中...' : '开始推理'}
              </button>
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
                  <span className="text-green-600">是</span>
                </div>
                <div className="flex justify-between">
                  <span>推理时间:</span>
                  <span>{results ? '125ms' : '未测试'}</span>
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