import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Play, Pause, RotateCcw, Settings, Zap } from 'lucide-react';

const WebGPUDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const [isWebGPUSupported, setIsWebGPUSupported] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);

  useEffect(() => {
    checkWebGPUSupport();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const checkWebGPUSupport = () => {
    const supported = 'gpu' in navigator;
    setIsWebGPUSupported(supported);
    
    if (supported) {
      console.log('WebGPU 支持检测成功');
    } else {
      console.log('WebGPU 不支持');
    }
  };

  const startAnimation = () => {
    if (!isWebGPUSupported || !canvasRef.current) return;
    
    setIsRunning(true);
    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;
    animate();
  };

  const stopAnimation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const animate = (currentTime = performance.now()) => {
    if (!isRunning) return;
    
    frameCountRef.current++;
    const deltaTime = currentTime - lastTimeRef.current;
    
    if (deltaTime >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / deltaTime));
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
    
    // 这里应该实现WebGPU渲染逻辑
    // 目前只是简单的动画循环
    drawFrame();
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const time = Date.now() * 0.001;
    
    // 清空画布
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制一些动态图形
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50 + Math.sin(time * 2) * 20;
    
    // 绘制圆形
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsl(${time * 50 % 360}, 70%, 60%)`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 绘制旋转的矩形
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time);
    ctx.fillStyle = `hsl(${time * 30 % 360}, 80%, 70%)`;
    ctx.fillRect(-25, -25, 50, 50);
    ctx.restore();
    
    // 绘制粒子效果
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + time;
      const x = centerX + Math.cos(angle) * 100;
      const y = centerY + Math.sin(angle) * 100;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${angle * 180 / Math.PI}, 80%, 60%)`;
      ctx.fill();
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFps(0);
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
            WebGPU 演示
          </h1>
          <p className="text-xl text-gray-600">
            展示 WebGPU 原生功能的图形渲染和计算能力
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧控制面板 */}
          <div className="space-y-6">
            {/* WebGPU 状态 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                WebGPU 状态
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">支持状态:</span>
                  <span className={`text-sm font-medium ${
                    isWebGPUSupported ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isWebGPUSupported ? '支持' : '不支持'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">运行状态:</span>
                  <span className={`text-sm font-medium ${
                    isRunning ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {isRunning ? '运行中' : '已停止'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">当前FPS:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {fps}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 动画控制 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                动画控制
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={startAnimation}
                  disabled={!isWebGPUSupported || isRunning}
                  className="w-full button-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>开始动画</span>
                </button>
                
                <button
                  onClick={stopAnimation}
                  disabled={!isRunning}
                  className="w-full button-secondary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>停止动画</span>
                </button>
                
                <button
                  onClick={resetCanvas}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>重置画布</span>
                </button>
              </div>
            </motion.div>

            {/* 性能信息 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                性能信息
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">画布尺寸:</span>
                  <span className="font-medium">800×600</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">渲染模式:</span>
                  <span className="font-medium">2D Canvas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">动画循环:</span>
                  <span className="font-medium">requestAnimationFrame</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 右侧画布区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 主画布 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                渲染画布
              </h3>
              
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="border border-gray-300 rounded-lg bg-black"
                />
              </div>
            </motion.div>

            {/* 技术说明 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                技术说明
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">当前实现</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 2D Canvas 渲染</li>
                    <li>• requestAnimationFrame 循环</li>
                    <li>• 动态图形绘制</li>
                    <li>• FPS 性能监控</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">WebGPU 特性</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• GPU 并行计算</li>
                    <li>• 现代图形管线</li>
                    <li>• 计算着色器</li>
                    <li>• 高性能渲染</li>
                  </ul>
                </div>
              </div>
              
              {!isWebGPUSupported && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>注意:</strong> 当前浏览器不支持 WebGPU。此演示使用 2D Canvas 作为替代方案。
                    要体验真正的 WebGPU 功能，请使用支持 WebGPU 的浏览器（如 Chrome 113+）。
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebGPUDemo; 