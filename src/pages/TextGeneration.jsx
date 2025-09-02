import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Send, Download, Loader2, Copy, Check } from 'lucide-react';

const TextGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt2');
  const [copied, setCopied] = useState(false);
  
  const models = [
    { id: 'gpt2', name: 'GPT-2', description: '通用文本生成模型' },
    { id: 'bert', name: 'BERT', description: '双向编码器模型' },
    { id: 't5', name: 'T5', description: '文本到文本转换模型' }
  ];

  const generateText = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // 模拟文本生成
    setTimeout(() => {
      const mockResponse = `基于您的提示"${prompt}"，我生成了以下文本：

这是一个示例生成的文本内容，展示了AI文本生成的能力。文本生成模型可以根据输入的提示词，创造出连贯、有意义的文本内容。

在实际应用中，这里会显示真实的AI生成文本，包括：
- 故事创作
- 文章续写
- 对话生成
- 代码注释
- 等多种应用场景

WebGPU技术可以显著提升文本生成的推理速度，让用户获得更好的交互体验。`;
      
      setGeneratedText(mockResponse);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadText = () => {
    if (!generatedText) return;
    
    const blob = new Blob([generatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-text.txt';
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
            文本生成
          </h1>
          <p className="text-xl text-gray-600">
            基于AI模型的智能文本生成和语言处理
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
                <Type className="w-5 h-5 mr-2" />
                选择模型
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

            {/* 提示词输入 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                输入提示词
              </h3>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入您的提示词，例如：写一个关于春天的故事..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <div className="mt-2 text-sm text-gray-500">
                字符数: {prompt.length}
              </div>
            </motion.div>

            {/* 生成控制 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                开始生成
              </h3>
              
              <button
                onClick={generateText}
                disabled={!prompt.trim() || isGenerating}
                className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{isGenerating ? '生成中...' : '生成文本'}</span>
              </button>
            </motion.div>
          </div>

          {/* 右侧结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 生成结果 */}
            {generatedText ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    生成结果
                  </h3>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      title="复制到剪贴板"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={downloadText}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      title="下载文本"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm leading-relaxed">
                    {generatedText}
                  </pre>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  生成区域
                </h3>
                
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Type className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>输入提示词后开始生成文本</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 生成统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                生成统计
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {prompt.length}
                  </div>
                  <div className="text-sm text-blue-600">提示词长度</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {generatedText ? generatedText.length : 0}
                  </div>
                  <div className="text-sm text-green-600">生成文本长度</div>
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

export default TextGeneration; 