import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Play, Download, Loader2, Cpu, HardDrive, Clock } from 'lucide-react';
import { ModelManager } from '../models/modelManager';
import { ImageProcessor } from '../utils/imageProcessor';

const PerformanceDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedTests, setSelectedTests] = useState(['webgpu', 'webgl', 'wasm']);
  const [error, setError] = useState(null);
  const [testImage, setTestImage] = useState(null);
  
  const testProviders = [
    { id: 'webgpu', name: 'WebGPU', description: '新一代Web图形API' },
    { id: 'webgl', name: 'WebGL', description: 'Web图形库' },
    { id: 'wasm', name: 'WebAssembly', description: 'Web汇编语言' }
  ];

  // 生成测试图像
  useEffect(() => {
    const generateTestImage = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 224;
      canvas.height = 224;
      
      // 绘制测试图像
      const gradient = ctx.createLinearGradient(0, 0, 224, 224);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(0.5, '#4ecdc4');
      gradient.addColorStop(1, '#45b7d1');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 224, 224);
      
      // 添加一些几何图形
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(112, 112, 50, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(50, 50, 100, 100);
      
      setTestImage(canvas.toDataURL());
    };

    generateTestImage();
  }, []);

  const runPerformanceTest = async () => {
    if (!testImage) {
      setError('测试图像未生成');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);
    
    try {
      const testResults = [];
      const iterations = 5; // 减少迭代次数以加快测试
      
      for (const provider of selectedTests) {
        console.log(`开始测试 ${provider} 执行提供者...`);
        
        try {
          // 创建模型管理器
          const modelManager = new ModelManager();
          
          // 获取模型配置
          const models = ModelManager.getAvailableModels();
          const model = models.find(m => m.type === 'classification');
          
          if (!model) {
            throw new Error('未找到分类模型');
          }
          
          // 加载模型
          await modelManager.loadModel(model.path, model.labelsPath, provider);
          
          // 准备测试数据
          const img = new Image();
          img.src = testImage;
          await new Promise(resolve => {
            img.onload = resolve;
          });
          
          const imageData = ImageProcessor.preprocessImage(img, model.inputSize, 'classification');
          const tensor = ImageProcessor.createTensor(imageData, model.inputSize);
          
          // 执行多次推理测试
          const times = [];
          const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
          
          for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            await modelManager.runInference(tensor);
            const endTime = performance.now();
            times.push(endTime - startTime);
          }
          
          const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
          
          // 计算统计信息
          const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
          const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
          const stdTime = Math.sqrt(variance);
          
          testResults.push({
            provider: provider,
            avgTime: avgTime,
            stdTime: stdTime,
            memoryUsage: (memoryAfter - memoryBefore) / 1024 / 1024, // MB
            memoryPeak: memoryAfter / 1024 / 1024, // MB
            iterations: iterations,
            status: 'success'
          });
          
          console.log(`${provider} 测试完成: ${avgTime.toFixed(1)}ms`);
          
        } catch (error) {
          console.error(`${provider} 测试失败:`, error);
          testResults.push({
            provider: provider,
            avgTime: 0,
            stdTime: 0,
            memoryUsage: 0,
            memoryPeak: 0,
            iterations: 0,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      setResults(testResults);
      
    } catch (error) {
      console.error('性能测试失败:', error);
      setError(`性能测试失败: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    
    const csvContent = [
      ['Provider', 'Avg Time (ms)', 'Std Dev (ms)', 'Memory (MB)', 'Peak Memory (MB)', 'Iterations'],
      ...results.map(r => [
        r.provider.toUpperCase(),
        r.avgTime.toFixed(2),
        r.stdTime.toFixed(2),
        r.memoryUsage.toFixed(1),
        r.memoryPeak.toFixed(1),
        r.iterations
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'performance-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTest = (providerId) => {
    setSelectedTests(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
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
            性能测试
          </h1>
          <p className="text-xl text-gray-600">
            对比不同执行提供者的性能表现和资源消耗
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧控制面板 */}
          <div className="space-y-6">
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

            {/* 测试图像预览 */}
            {testImage && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  测试图像
                </h3>
                <div className="flex justify-center">
                  <img
                    src={testImage}
                    alt="测试图像"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  224×224 像素测试图像
                </p>
              </motion.div>
            )}

            {/* 测试配置 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                测试配置
              </h3>
              
              <div className="space-y-3">
                {testProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTests.includes(provider.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleTest(provider.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-600">{provider.description}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(provider.id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 测试控制 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                开始测试
              </h3>
              
              <button
                onClick={runPerformanceTest}
                disabled={isRunning || selectedTests.length === 0}
                className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isRunning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>{isRunning ? '测试中...' : '开始性能测试'}</span>
              </button>
              
              {results && (
                <button
                  onClick={downloadResults}
                  className="w-full button-secondary py-3 mt-3 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>下载结果</span>
                </button>
              )}
            </motion.div>

            {/* 测试信息 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                测试信息
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">测试次数:</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">测试模型:</span>
                  <span className="font-medium">ResNet18-Simplified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">输入尺寸:</span>
                  <span className="font-medium">224×224</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WebGPU 支持:</span>
                  <span className={ModelManager.checkWebGPUSupport() ? 'text-green-600' : 'text-red-600'}>
                    {ModelManager.checkWebGPUSupport() ? '是' : '否'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 右侧结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 性能对比图表 */}
            {results ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  性能对比结果
                </h3>
                
                <div className="space-y-6">
                  {/* 推理时间对比 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      推理时间对比 (ms)
                    </h4>
                    <div className="space-y-2">
                      {results.map((result, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-20 text-sm font-medium text-gray-600">
                            {result.provider.toUpperCase()}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(result.avgTime / Math.max(...results.map(r => r.avgTime))) * 100}%` 
                              }}
                            />
                          </div>
                          <div className="w-16 text-sm text-gray-900 text-right">
                            {result.avgTime.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 内存使用对比 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                      <HardDrive className="w-4 h-4 mr-2" />
                      内存使用对比 (MB)
                    </h4>
                    <div className="space-y-2">
                      {results.map((result, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-20 text-sm font-medium text-gray-600">
                            {result.provider.toUpperCase()}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-green-500 h-4 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(result.memoryUsage / Math.max(...results.map(r => r.memoryUsage))) * 100}%` 
                              }}
                            />
                          </div>
                          <div className="w-16 text-sm text-gray-900 text-right">
                            {result.memoryUsage.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
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
                  性能图表
                </h3>
                
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>开始性能测试后显示结果图表</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 详细结果表格 */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  详细测试结果
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          执行提供者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          平均时间 (ms)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          标准差 (ms)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          内存使用 (MB)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          峰值内存 (MB)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          测试次数
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              {result.provider.toUpperCase()}
                              {result.status === 'failed' && (
                                <span className="ml-2 text-xs text-red-600">(失败)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.status === 'success' ? result.avgTime.toFixed(1) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.status === 'success' ? result.stdTime.toFixed(1) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.status === 'success' ? result.memoryUsage.toFixed(1) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.status === 'success' ? result.memoryPeak.toFixed(1) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.iterations}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDemo; 