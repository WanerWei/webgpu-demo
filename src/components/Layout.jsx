import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Image, 
  Palette, 
  Target, 
  Type, 
  BarChart3, 
  Cpu, 
  Info,
  Github,
  ExternalLink
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '图像分类', href: '/image-classification', icon: Image },
    { name: '风格迁移', href: '/style-transfer', icon: Palette },
    { name: '目标检测', href: '/object-detection', icon: Target },
    { name: '文本生成', href: '/text-generation', icon: Type },
    { name: '性能测试', href: '/performance-demo', icon: BarChart3 },
    { name: 'WebGPU演示', href: '/webgpu-demo', icon: Cpu },
    { name: '关于项目', href: '/about', icon: Info },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">WebGPU AI</span>
              </Link>
            </div>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.slice(1, 5).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/your-repo/webgpu-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 侧边栏 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* 侧边栏 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 bg-white border-r border-border z-50 md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-lg font-semibold">导航菜单</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="p-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 主内容区域 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-muted/50 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">WebGPU AI 平台</h3>
              <p className="text-muted-foreground text-sm">
                基于 WebGPU 和 ONNX Runtime Web 的现代化 AI 推理平台，
                展示在浏览器中进行高性能 AI 推理的完整解决方案。
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">技术栈</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• WebGPU API</li>
                <li>• ONNX Runtime Web</li>
                <li>• React 18</li>
                <li>• Tailwind CSS</li>
                <li>• Framer Motion</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">快速链接</h3>
              <div className="space-y-2">
                <a
                  href="https://webgpu.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>WebGPU 官方</span>
                </a>
                <a
                  href="https://onnxruntime.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ONNX Runtime</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 WebGPU AI 平台. 基于 WebGPU + ONNX Runtime Web 技术构建.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 