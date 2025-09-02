import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Code, Zap, Globe, Shield } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Code,
      title: '现代化技术栈',
      description: '基于 React 18、Tailwind CSS 和 Framer Motion 构建',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: '高性能AI推理',
      description: '利用 WebGPU 和 ONNX Runtime Web 实现GPU加速',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: '跨平台兼容',
      description: '基于Web标准，无需安装，支持所有现代浏览器',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '在浏览器沙箱环境中运行，保护用户隐私',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const techStack = [
    { name: 'React 18', description: '现代化前端框架' },
    { name: 'Tailwind CSS', description: '实用优先的CSS框架' },
    { name: 'Framer Motion', description: '强大的动画库' },
    { name: 'WebGPU', description: '新一代Web图形API' },
    { name: 'ONNX Runtime Web', description: 'Web端AI推理运行时' },
    { name: 'Vite', description: '快速构建工具' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            关于项目
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            WebGPU AI 平台是一个基于 WebGPU 和 ONNX Runtime Web 的现代化 AI 推理平台，
            展示在浏览器中进行高性能机器学习推理的完整解决方案
          </p>
        </motion.div>

        {/* 项目特性 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            核心特性
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 技术栈 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            技术栈
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tech.name}
                </h3>
                <p className="text-gray-600">
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 项目结构 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            项目结构
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">前端架构</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• React 18 + Hooks</div>
                  <div>• React Router 6 路由管理</div>
                  <div>• Tailwind CSS 样式系统</div>
                  <div>• Framer Motion 动画效果</div>
                  <div>• 响应式设计</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 功能</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 图像分类 (ResNet)</div>
                  <div>• 风格迁移</div>
                  <div>• 目标检测</div>
                  <div>• 文本生成</div>
                  <div>• 性能测试</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 快速开始 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            快速开始
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">克隆项目</h4>
                  <code className="block bg-gray-100 px-3 py-2 rounded text-sm mt-1">
                    git clone https://github.com/your-repo/webgpu-demo.git
                  </code>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">安装依赖</h4>
                  <code className="block bg-gray-100 px-3 py-2 rounded text-sm mt-1">
                    npm install
                  </code>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">启动开发服务器</h4>
                  <code className="block bg-gray-100 px-3 py-2 rounded text-sm mt-1">
                    npm run dev
                  </code>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 贡献指南 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            贡献指南
          </h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">如何贡献</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>1. Fork 项目</div>
                  <div>2. 创建功能分支</div>
                  <div>3. 提交更改</div>
                  <div>4. 推送到分支</div>
                  <div>5. 创建 Pull Request</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">贡献类型</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 新功能开发</div>
                  <div>• Bug 修复</div>
                  <div>• 文档改进</div>
                  <div>• 性能优化</div>
                  <div>• 测试用例</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 链接和资源 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            相关链接
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/your-repo/webgpu-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub 仓库</span>
            </a>
            
            <a
              href="https://webgpu.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <span>WebGPU 官方</span>
            </a>
            
            <a
              href="https://onnxruntime.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <span>ONNX Runtime</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 