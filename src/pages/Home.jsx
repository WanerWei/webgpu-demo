import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Image, 
  Palette, 
  Target, 
  Type, 
  BarChart3, 
  Cpu, 
  Zap, 
  Globe,
  Shield,
  Code,
  Info,
  Github
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Image,
      title: '图像分类',
      description: '使用预训练的 ResNet 模型进行高精度图像分类',
      href: '/image-classification',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Palette,
      title: '风格迁移',
      description: '将艺术风格应用到您的照片上，创造独特的视觉效果',
      href: '/style-transfer',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: '目标检测',
      description: '实时检测图像中的多个对象，提供边界框和类别信息',
      href: '/object-detection',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Type,
      title: '文本生成',
      description: '基于 AI 模型的智能文本生成和语言处理',
      href: '/text-generation',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: '性能测试',
      description: '对比不同执行提供者的性能表现和资源消耗',
      href: '/performance-demo',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Cpu,
      title: 'WebGPU 演示',
      description: '展示 WebGPU 原生功能的图形渲染和计算能力',
      href: '/webgpu-demo',
      color: 'from-teal-500 to-cyan-500'
    }
  ];

  const stats = [
    { label: 'AI 模型', value: '6+', description: '预训练模型' },
    { label: '推理速度', value: '30ms', description: '平均响应时间' },
    { label: '精度', value: '95%+', description: '分类准确率' },
    { label: '支持格式', value: '10+', description: '图像文件格式' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">WebGPU AI</span> 平台
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              基于 WebGPU 和 ONNX Runtime Web 的现代化 AI 推理平台，
              在浏览器中实现高性能机器学习推理
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/image-classification"
                className="button-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>开始体验</span>
              </Link>
              <Link
                to="/about"
                className="button-secondary text-lg px-8 py-4 inline-flex items-center space-x-2"
              >
                <Info className="w-5 h-5" />
                <span>了解更多</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 特性展示 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              强大的 AI 功能
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              探索我们提供的各种 AI 功能，从图像处理到文本生成，
              体验 WebGPU 带来的性能提升
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group"
              >
                <Link
                  to={feature.href}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              平台性能指标
            </h2>
            <p className="text-xl text-gray-600">
              基于实际测试的性能数据，展示 WebGPU 的强大能力
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-600">
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 技术优势 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              技术优势
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              采用最新的 Web 技术，提供卓越的性能和用户体验
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                高性能
              </h3>
              <p className="text-gray-600">
                利用 WebGPU 的并行计算能力，实现接近原生应用的性能表现
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                跨平台
              </h3>
              <p className="text-gray-600">
                基于 Web 标准，无需安装，在任何支持 WebGPU 的浏览器中运行
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                安全可靠
              </h3>
              <p className="text-gray-600">
                在浏览器沙箱环境中运行，保护用户隐私和数据安全
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              准备好开始 AI 之旅了吗？
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              立即体验 WebGPU 带来的 AI 推理性能提升
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/image-classification"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center space-x-2"
              >
                <Code className="w-5 h-5" />
                <span>开始体验</span>
              </Link>
              <a
                href="https://github.com/your-repo/webgpu-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center space-x-2"
              >
                <Github className="w-5 h-5" />
                <span>查看源码</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 