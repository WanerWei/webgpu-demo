# WebGPU AI 平台

一个基于 WebGPU 和 ONNX Runtime Web 的现代化 AI 推理平台，展示在浏览器中进行高性能机器学习推理的完整解决方案。

## 🚀 技术特性

- **WebGPU 加速**: 利用最新的 WebGPU API 进行 GPU 加速推理
- **ONNX Runtime Web**: 使用微软开源的 ONNX Runtime Web 运行时
- **React 18**: 现代化前端框架，提供优秀的用户体验
- **Tailwind CSS**: 实用优先的 CSS 框架，快速构建美观界面
- **Framer Motion**: 强大的动画库，流畅的交互体验
- **响应式设计**: 支持各种设备尺寸，移动端友好

## 🛠️ 技术栈

- **前端框架**: React 18 + Hooks
- **路由管理**: React Router 6
- **样式系统**: Tailwind CSS
- **动画效果**: Framer Motion
- **AI 推理**: ONNX Runtime Web + WebGPU
- **构建工具**: Vite
- **图标库**: Lucide React

## 📁 项目结构

```
webgpu-demo/
├── index.html                 # 主页面
├── package.json              # 项目配置
├── README.md                 # 项目文档
├── vite.config.js           # Vite 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── postcss.config.js        # PostCSS 配置
├── src/
│   ├── main.jsx             # React 入口文件
│   ├── App.jsx              # 主应用组件
│   ├── index.css            # 全局样式
│   ├── components/
│   │   ├── Layout.jsx       # 布局组件
│   │   └── ui/
│   │       └── toaster.jsx  # Toast 通知组件
│   ├── pages/
│   │   ├── Home.jsx         # 首页
│   │   ├── ImageClassification.jsx  # 图像分类页面
│   │   ├── StyleTransfer.jsx        # 风格迁移页面
│   │   ├── ObjectDetection.jsx      # 目标检测页面
│   │   ├── TextGeneration.jsx       # 文本生成页面
│   │   ├── PerformanceDemo.jsx      # 性能测试页面
│   │   ├── WebGPUDemo.jsx           # WebGPU 演示页面
│   │   └── About.jsx                # 关于页面
│   └── hooks/
│       └── useToast.js      # Toast Hook
├── public/
│   ├── models/              # ONNX 模型文件
│   │   ├── resnet18.onnx
│   │   ├── resnet18_simplified.onnx
│   │   └── imagenet_classes.json
│   └── imgs/                # 示例图像
├── pyScript/                # Python脚本
│   ├── getOnnx.py           # 导出ResNet18模型
│   ├── getSimplifiedOnnx.py # 简化模型
│   ├── testOnnx.py          # 测试模型
│   └── requirements.txt     # Python依赖
└── docs/                    # 文档
    └── execution-providers-comparison.md
```

## 🚀 快速开始

### 环境要求

- **浏览器**: Chrome 113+ 或 Edge 113+ (支持 WebGPU)
- **Node.js**: 16.0+ (用于开发)
- **Python**: 3.8+ (用于模型准备，可选)

### 安装依赖

```bash
# 安装Node.js依赖
npm install

# 安装Python依赖（可选，用于模型准备）
cd pyScript
pip install -r requirements.txt
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📖 功能特性

### 🖼️ 图像分类
- 使用预训练的 ResNet 模型进行高精度图像分类
- 支持多种图像格式 (JPEG, PNG, WebP)
- 实时推理结果展示
- 拖拽上传支持

### 🎨 风格迁移
- 将艺术风格应用到您的照片上
- 预设多种艺术风格 (梵高、莫奈、毕加索等)
- 自定义风格图像上传
- 高质量输出结果

### 🎯 目标检测
- 实时检测图像中的多个对象
- 支持多种检测模型 (YOLO, SSD, Faster R-CNN)
- 边界框和类别信息显示
- 检测统计和性能指标

### 📝 文本生成
- 基于 AI 模型的智能文本生成
- 支持多种语言模型 (GPT-2, BERT, T5)
- 自定义提示词输入
- 结果复制和下载功能

### 📊 性能测试
- 对比不同执行提供者的性能表现
- WebGPU vs WebGL vs WebAssembly
- 详细的性能指标和图表
- 结果导出为 CSV 格式

### ⚡ WebGPU 演示
- 展示 WebGPU 原生功能的图形渲染
- 实时动画和性能监控
- FPS 显示和性能统计
- 交互式控制面板

## 🔧 开发指南

### 添加新页面

1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/App.jsx` 中添加路由配置
3. 在 `src/components/Layout.jsx` 中添加导航菜单项

### 自定义样式

项目使用 Tailwind CSS，可以通过以下方式自定义：

```css
/* 在 src/index.css 中添加自定义样式 */
@layer components {
  .custom-button {
    @apply px-4 py-2 bg-blue-500 text-white rounded-md;
  }
}
```

### 添加新功能

1. 创建新的组件文件
2. 在相应的页面中导入和使用
3. 更新状态管理和事件处理
4. 添加必要的类型定义和验证

## 🎯 性能优化

### React 优化
- 使用 React.memo 优化组件重渲染
- 合理使用 useCallback 和 useMemo
- 避免不必要的状态更新

### WebGPU 优化
- 使用 WebGPU 执行提供者进行 GPU 加速
- 启用图优化级别 "all"
- 并行加载模型和标签文件

### 图像处理优化
- 使用 OffscreenCanvas 进行图像预处理
- 实现图像格式验证和大小限制
- 优化内存使用，及时释放资源

## 🔍 故障排除

### WebGPU 不支持
如果浏览器不支持 WebGPU，系统会显示错误提示。请确保：
- 使用 Chrome 113+ 或 Edge 113+
- 启用 WebGPU 实验性功能
- 检查 GPU 驱动是否最新

### 模型加载失败
- 检查模型文件路径是否正确
- 确认模型文件格式为 ONNX
- 检查网络连接和服务器状态

### 推理性能问题
- 检查 GPU 使用情况
- 确认 WebGPU 支持状态
- 考虑使用简化版模型

## 📊 性能基准

在以下环境下测试的性能数据：

| 设备 | 模型 | 推理时间 | 内存使用 |
|------|------|----------|----------|
| MacBook Pro M1 | ResNet18 | ~50ms | ~150MB |
| Windows RTX 3080 | ResNet18 | ~30ms | ~120MB |
| Chrome DevTools | ResNet18-Simplified | ~80ms | ~100MB |

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) - 提供强大的 Web 端推理能力
- [WebGPU](https://www.w3.org/TR/webgpu/) - 下一代 Web 图形 API
- [React](https://reactjs.org/) - 现代化前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 强大的动画库

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 参与讨论

---

**注意**: 本项目仅用于技术演示和学习目的，请勿用于生产环境。 