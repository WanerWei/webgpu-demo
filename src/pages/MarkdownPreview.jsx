import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  Code,
  Maximize2,
  Minimize2,
  X,
  Monitor,
  Edit3
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

const MarkdownPreview = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // 加载默认的Markdown内容
  useEffect(() => {
    const loadDefaultContent = async () => {
      try {
        const response = await fetch('/share.md');
        if (response.ok) {
          const content = await response.text();
          setMarkdownContent(content);
        } else {
          // 如果无法加载文件，使用默认内容
          setMarkdownContent(`# Markdown 预览功能

欢迎使用 Markdown 预览功能！这个页面可以：

- 编辑和预览 Markdown 内容
- 支持语法高亮
- 支持表格、任务列表等 GFM 功能
- 🔗 支持链接和图片
- 📱 响应式设计

## 功能特性

### 代码高亮
\`\`\`javascript
function hello() {
  console.log("Hello, WebGPU!");
}
\`\`\`

### 表格支持
| 功能 | 状态 | 说明 |
|------|------|------|
| 基础 Markdown | ✅ | 支持标题、段落、列表等 |
| 代码高亮 | ✅ | 支持多种编程语言 |
| 表格 | ✅ | 支持 GFM 表格语法 |
| 任务列表 | ✅ | 支持 - [ ] 语法 |

### 任务列表
- [x] 实现基础 Markdown 渲染
- [x] 添加代码语法高亮
- [x] 支持 GFM 扩展语法
- [ ] 添加文件上传功能
- [ ] 支持导出为 PDF

> 这是一个引用块，可以用来突出重要信息。

---

**开始编辑您的 Markdown 内容吧！**`);
        }
      } catch (error) {
        console.error('加载默认内容失败:', error);
      }
    };

    loadDefaultContent();
  }, []);

  // 处理ESC键退出全屏
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isPreviewFullscreen) {
          setIsPreviewFullscreen(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    if (isFullscreen || isPreviewFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, isPreviewFullscreen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      toast({
        title: "复制成功",
        description: "Markdown 内容已复制到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制内容到剪贴板",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-content.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载成功",
      description: "Markdown 文件已下载",
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/markdown') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdownContent(e.target.result);
        toast({
          title: "文件加载成功",
          description: `${file.name} 已加载`,
        });
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "文件格式错误",
        description: "请选择 .md 文件",
        variant: "destructive",
      });
    }
  };

  // Markdown渲染组件
  const MarkdownRenderer = ({ className = "" }) => (
    <div className={`prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-foreground prose-strong:text-foreground prose-strong:font-bold prose-ul:text-foreground prose-li:text-foreground prose-blockquote:text-muted-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                className="rounded-lg"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} bg-muted px-1 py-0.5 rounded text-sm`} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground mb-4 mt-6 first:mt-0 border-b border-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-foreground mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-foreground mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-foreground mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-foreground mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-foreground font-semibold border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-foreground border-b border-border">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-6 border-border" />
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );

  // 全屏预览组件
  const FullscreenPreview = () => (
    <AnimatePresence>
      {isPreviewFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* 全屏预览头部 */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Markdown 全屏预览</h1>
                  <p className="text-sm text-muted-foreground">按 ESC 键退出全屏</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPreviewFullscreen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  title="退出全屏预览"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 全屏预览内容 */}
          <div className="h-[calc(100vh-80px)] overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <MarkdownRenderer />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className={`min-h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题和工具栏 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text">Markdown 预览</h1>
                  <p className="text-muted-foreground">编辑和预览 Markdown 内容</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  title={isFullscreen ? "退出全屏" : "全屏模式"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>上传文件</span>
                  <input
                    type="file"
                    accept=".md,.markdown"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '已复制' : '复制'}</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>下载</span>
                </button>
              </div>
            </div>
          </div>

          {/* 编辑器和预览区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 编辑器 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">编辑器</h2>
              </div>
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="w-full h-96 p-4 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm leading-relaxed"
                placeholder="在这里输入 Markdown 内容..."
              />
            </motion.div>

            {/* 预览区域 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">预览</h2>
                </div>
                <button
                  onClick={() => setIsPreviewFullscreen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  title="全屏预览"
                >
                  <Monitor className="w-4 h-4" />
                  <span>全屏预览</span>
                </button>
              </div>
              <div className="h-96 overflow-auto p-6 border border-border rounded-lg bg-background">
                <MarkdownRenderer />
              </div>
            </motion.div>
          </div>

          {/* 使用说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 p-6 bg-muted/30 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-4">使用说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">支持的功能</h4>
                <ul className="space-y-1">
                  <li>• 基础 Markdown 语法</li>
                  <li>• GitHub 风格 Markdown (GFM)</li>
                  <li>• 代码语法高亮</li>
                  <li>• 表格和任务列表</li>
                  <li>• 链接和图片</li>
                  <li>• 数学公式 (LaTeX)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">快捷键</h4>
                <ul className="space-y-1">
                  <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">ESC</kbd> 退出全屏</li>
                  <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd> 保存内容</li>
                  <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+A</kbd> 全选</li>
                  <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">F11</kbd> 全屏模式</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 全屏预览组件 */}
      <FullscreenPreview />
    </>
  );
};

export default MarkdownPreview;
