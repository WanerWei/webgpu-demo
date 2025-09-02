import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Palette, Download, Loader2 } from 'lucide-react';

const StyleTransfer = () => {
  const [contentImage, setContentImage] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('vangogh');
  
  const contentInputRef = useRef(null);
  const styleInputRef = useRef(null);

  const stylePresets = [
    { id: 'vangogh', name: '梵高风格', description: '后印象派艺术风格' },
    { id: 'monet', name: '莫奈风格', description: '印象派绘画风格' },
    { id: 'picasso', name: '毕加索风格', description: '立体主义艺术风格' },
    { id: 'ukiyo', name: '浮世绘风格', description: '日本传统绘画风格' }
  ];

  const handleContentImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setContentImage(e.target.result);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStyleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setStyleImage(e.target.result);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const runStyleTransfer = async () => {
    if (!contentImage || !styleImage) return;
    
    setIsProcessing(true);
    
    // 模拟风格迁移处理
    setTimeout(() => {
      setResultImage(contentImage); // 这里应该是处理后的图像
      setIsProcessing(false);
    }, 3000);
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

            {/* 风格图像上传 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                自定义风格图像
              </h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => styleInputRef.current?.click()}
              >
                <input
                  ref={styleInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleStyleImageSelect}
                  className="hidden"
                />
                
                {styleImage ? (
                  <img
                    src={styleImage}
                    alt="风格图像"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="py-8">
                    <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">点击选择风格图像</p>
                  </div>
                )}
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
                disabled={!contentImage || isProcessing}
                className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  '开始风格迁移'
                )}
              </button>
              
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
                    <p>上传图像并选择风格后开始处理</p>
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
                  <div className="text-sm font-medium text-gray-700">风格图像</div>
                  <div className="text-sm text-gray-600">
                    {styleImage ? '已上传' : '未上传'}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleTransfer; 