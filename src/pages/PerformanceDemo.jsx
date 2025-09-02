import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Play, Download, Loader2, Cpu, HardDrive, Clock } from 'lucide-react';

const PerformanceDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedTests, setSelectedTests] = useState(['webgpu', 'webgl', 'wasm']);
  
  const testProviders = [
    { id: 'webgpu', name: 'WebGPU', description: '新一代Web图形API' },
    { id: 'webgl', name: 'WebGL', description: 'Web图形库' },
    { id: 'wasm', name: 'WebAssembly', description: 'Web汇编语言' }
  ];

  const runPerformanceTest = async () => {
    setIsRunning(true);
    
    // 模拟性能测试
    setTimeout(() => {
      const mockResults = [
        {
          provider: 'webgpu',
          avgTime: 125.6,
          stdTime: 12.3,
          memoryUsage: 45.2,
          memoryPeak: 52.1,
          iterations: 10,
          status: 'success'
        },
        {
          provider: 'webgl',
          avgTime: 189.4,
          stdTime: 18.7,
          memoryUsage: 52.1,
          memoryPeak: 58.3,
          iterations: 10,
          status: 'success'
        },
        {
          provider: 'wasm',
          avgTime: 456.8,
          stdTime: 45.2,
          memoryUsage: 38.9,
          memoryPeak: 42.1,
          iterations: 10,
          status: 'success'
        }
      ];
      
      setResults(mockResults);
      setIsRunning(false);
    }, 5000);
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
                  <span className="font-medium">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">测试模型:</span>
                  <span className="font-medium">ResNet18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">输入尺寸:</span>
                  <span className="font-medium">224×224</span>
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
                            {result.provider.toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.avgTime.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.stdTime.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.memoryUsage.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.memoryPeak.toFixed(1)}
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