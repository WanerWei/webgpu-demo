#!/usr/bin/env python3
"""
WebGPU + ONNX Runtime Web 项目快速开始脚本
一键完成模型准备和项目启动
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_requirements():
    """检查系统要求"""
    print("🔍 检查系统要求...")
    
    # 检查Python版本
    if sys.version_info < (3, 8):
        print("❌ Python版本过低，需要Python 3.8+")
        return False
    
    print(f"✅ Python版本: {sys.version}")
    
    # 检查Node.js
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js版本: {result.stdout.strip()}")
        else:
            print("❌ Node.js未安装或版本过低")
            return False
    except FileNotFoundError:
        print("❌ Node.js未安装")
        return False
    
    # 检查npm
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm版本: {result.stdout.strip()}")
        else:
            print("❌ npm未安装")
            return False
    except FileNotFoundError:
        print("❌ npm未安装")
        return False
    
    return True

def install_dependencies():
    """安装项目依赖"""
    print("\n📦 安装项目依赖...")
    
    # 安装Node.js依赖
    try:
        print("安装Node.js依赖...")
        result = subprocess.run(['npm', 'install'], check=True)
        print("✅ Node.js依赖安装完成")
    except subprocess.CalledProcessError as e:
        print(f"❌ Node.js依赖安装失败: {e}")
        return False
    
    # 安装Python依赖
    try:
        print("安装Python依赖...")
        script_dir = Path(__file__).parent
        requirements_file = script_dir / "requirements.txt"
        
        if requirements_file.exists():
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
            ], check=True)
            print("✅ Python依赖安装完成")
        else:
            print("⚠️  requirements.txt文件不存在，跳过Python依赖安装")
    except subprocess.CalledProcessError as e:
        print(f"❌ Python依赖安装失败: {e}")
        return False
    
    return True

def prepare_models():
    """准备模型文件"""
    print("\n🤖 准备模型文件...")
    
    try:
        # 切换到pyScript目录
        pyScript_dir = Path(__file__).parent.parent / "pyScript"
        
        if not pyScript_dir.exists():
            print(f"❌ pyScript目录不存在: {pyScript_dir}")
            return False
        
        # 运行模型管理脚本
        print("运行模型管理脚本...")
        result = subprocess.run([
            sys.executable, "manage_models.py", "--step", "all", "--skip-test"
        ], cwd=pyScript_dir, check=True)
        
        print("✅ 模型文件准备完成")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ 模型准备失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 模型准备过程中出现错误: {e}")
        return False

def start_development_server():
    """启动开发服务器"""
    print("\n🚀 启动开发服务器...")
    
    try:
        print("正在启动Vite开发服务器...")
        print("服务器启动后，请在浏览器中访问显示的地址")
        print("按 Ctrl+C 停止服务器")
        
        # 启动开发服务器
        result = subprocess.run(['npm', 'run', 'dev'], check=True)
        
    except KeyboardInterrupt:
        print("\n\n👋 开发服务器已停止")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 启动开发服务器失败: {e}")
        return False

def show_next_steps():
    """显示后续步骤"""
    print("\n" + "=" * 60)
    print("🎉 项目准备完成！")
    print("=" * 60)
    print("\n📋 后续步骤:")
    print("1. 在浏览器中打开显示的开发服务器地址")
    print("2. 上传一张图像进行测试")
    print("3. 查看推理结果和性能指标")
    print("\n📚 更多信息:")
    print("- 项目文档: README.md")
    print("- 模型准备指南: docs/model-preparation.md")
    print("- 技术分享: 查看代码注释和文档")
    print("\n🔧 开发命令:")
    print("- 启动开发服务器: npm run dev")
    print("- 构建生产版本: npm run build")
    print("- 预览生产版本: npm run preview")
    print("\n🐍 Python脚本:")
    print("- 模型管理: python pyScript/manage_models.py")
    print("- 导出模型: python pyScript/getOnnx.py")
    print("- 简化模型: python pyScript/getSimplifiedOnnx.py")
    print("- 测试模型: python pyScript/testOnnx.py")
    print("\n💡 提示:")
    print("- 确保浏览器支持WebGPU (Chrome 113+ 或 Edge 113+)")
    print("- 如果遇到问题，请查看浏览器控制台的错误信息")
    print("=" * 60)

def main():
    """主函数"""
    print("🚀 WebGPU + ONNX Runtime Web 项目快速开始")
    print("=" * 60)
    
    # 检查系统要求
    if not check_requirements():
        print("\n❌ 系统要求检查失败，请安装必要的依赖")
        sys.exit(1)
    
    # 安装依赖
    if not install_dependencies():
        print("\n❌ 依赖安装失败")
        sys.exit(1)
    
    # 准备模型
    if not prepare_models():
        print("\n❌ 模型准备失败")
        print("请手动运行: python pyScript/manage_models.py")
        sys.exit(1)
    
    # 显示后续步骤
    show_next_steps()
    
    # 询问是否启动开发服务器
    try:
        response = input("\n是否现在启动开发服务器？(y/n): ").lower().strip()
        if response in ['y', 'yes', '是']:
            start_development_server()
        else:
            print("您可以选择稍后手动运行 'npm run dev' 来启动服务器")
    except KeyboardInterrupt:
        print("\n\n👋 再见！")

if __name__ == "__main__":
    main() 