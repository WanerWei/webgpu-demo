#!/usr/bin/env python3
"""
ResNet18 ONNX 模型管理脚本
统一管理模型的导出、简化、测试等操作
"""

import os
import sys
import argparse
from pathlib import Path

# 导入其他脚本的函数
from getOnnx import export_resnet18_to_onnx, validate_onnx_model, test_inference
from getSimplifiedOnnx import simplify_onnx_model, validate_simplified_model, compare_models
from testOnnx import test_onnx_model as test_model, benchmark_model, compare_models_performance

def setup_environment():
    """设置环境"""
    print("🔧 设置环境...")
    
    # 创建必要的目录
    models_dir = Path("../public/models")
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"✅ 模型目录: {models_dir}")
    return models_dir

def export_model(models_dir):
    """导出模型"""
    print("\n🚀 步骤1: 导出ResNet18模型")
    print("-" * 40)
    
    output_path = models_dir / "resnet18.onnx"
    
    if output_path.exists():
        print(f"⚠️ 模型文件已存在: {output_path}")
        response = input("是否重新导出？(y/n): ").lower().strip()
        if response not in ['y', 'yes', '是']:
            print("跳过模型导出")
            return True
    
    success = export_resnet18_to_onnx(str(output_path))
    
    if success:
        print("✅ 模型导出完成")
        return True
    else:
        print("❌ 模型导出失败")
        return False

def simplify_model(models_dir):
    """简化模型"""
    print("\n🔧 步骤2: 简化模型")
    print("-" * 40)
    
    input_path = models_dir / "resnet18.onnx"
    output_path = models_dir / "resnet18_simplified.onnx"
    
    if not input_path.exists():
        print(f"❌ 原始模型不存在: {input_path}")
        print("请先运行导出步骤")
        return False
    
    if output_path.exists():
        print(f"⚠️ 简化模型已存在: {output_path}")
        response = input("是否重新简化？(y/n): ").lower().strip()
        if response not in ['y', 'yes', '是']:
            print("跳过模型简化")
            return True
    
    success = simplify_onnx_model(str(input_path), str(output_path))
    
    if success:
        print("✅ 模型简化完成")
        return True
    else:
        print("❌ 模型简化失败")
        return False

def test_models(models_dir):
    """测试模型"""
    print("\n🧪 步骤3: 测试模型")
    print("-" * 40)
    
    models = [
        models_dir / "resnet18.onnx",
        models_dir / "resnet18_simplified.onnx"
    ]
    
    available_models = []
    for model_path in models:
        if model_path.exists():
            available_models.append(str(model_path))
            print(f"✅ 找到模型: {model_path.name}")
        else:
            print(f"⚠️ 模型不存在: {model_path.name}")
    
    if not available_models:
        print("❌ 没有可用的模型进行测试")
        return False
    
    # 测试每个模型
    for model_path in available_models:
        print(f"\n🔍 测试模型: {os.path.basename(model_path)}")
        
        # 基本功能测试
        if test_model(model_path):
            # 性能测试
            benchmark_model(model_path)
        else:
            print(f"❌ 模型 {model_path} 测试失败")
    
    # 性能比较
    if len(available_models) > 1:
        print(f"\n📊 模型性能比较")
        compare_models_performance(available_models)
    
    return True

def download_labels(models_dir):
    """下载标签文件"""
    print("\n🏷️ 步骤4: 下载标签文件")
    print("-" * 40)
    
    labels_path = models_dir / "imagenet_classes.json"
    
    if labels_path.exists():
        print(f"✅ 标签文件已存在: {labels_path}")
        return True
    
    try:
        import requests
        import json
        
        # ImageNet类别标签URL
        labels_url = "https://raw.githubusercontent.com/onnx/models/main/vision/classification/synset.txt"
        
        print("📥 下载ImageNet类别标签...")
        response = requests.get(labels_url)
        response.raise_for_status()
        
        # 解析标签文件
        labels = []
        for line in response.text.strip().split('\n'):
            if line.strip():
                # 移除synset前缀，只保留类别名称
                label = line.strip()
                if label.startswith('n'):
                    # 提取类别名称
                    parts = label.split(' ', 1)
                    if len(parts) > 1:
                        label = parts[1]
                labels.append(label)
        
        # 保存为JSON格式
        with open(labels_path, 'w', encoding='utf-8') as f:
            json.dump(labels, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 标签下载完成: {labels_path}")
        print(f"📊 共 {len(labels)} 个类别")
        
        return True
        
    except ImportError:
        print("❌ 未安装requests库，请运行: pip install requests")
        return False
    except Exception as e:
        print(f"❌ 标签下载失败: {e}")
        return False

def create_model_config(models_dir):
    """创建模型配置文件"""
    print("\n⚙️ 步骤5: 创建配置文件")
    print("-" * 40)
    
    config_path = models_dir / "model_config.json"
    
    config = {
        "models": [
            {
                "name": "ResNet18",
                "path": "/models/resnet18.onnx",
                "description": "ResNet18 图像分类模型",
                "inputSize": 224,
                "labelsPath": "/models/imagenet_classes.json"
            },
            {
                "name": "ResNet18-Simplified",
                "path": "/models/resnet18_simplified.onnx",
                "description": "简化版 ResNet18 模型",
                "inputSize": 224,
                "labelsPath": "/models/imagenet_classes.json"
            }
        ],
        "version": "1.0.0",
        "lastUpdated": "2024-01-01"
    }
    
    try:
        import json
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 配置文件创建完成: {config_path}")
        return True
        
    except Exception as e:
        print(f"❌ 配置文件创建失败: {e}")
        return False

def show_summary(models_dir):
    """显示总结"""
    print("\n📋 模型准备总结")
    print("=" * 50)
    
    files = [
        "resnet18.onnx",
        "resnet18_simplified.onnx",
        "imagenet_classes.json",
        "model_config.json"
    ]
    
    total_size = 0
    for file_name in files:
        file_path = models_dir / file_name
        if file_path.exists():
            size = file_path.stat().st_size / (1024 * 1024)  # MB
            total_size += size
            print(f"✅ {file_name} ({size:.2f} MB)")
        else:
            print(f"❌ {file_name} (缺失)")
    
    print(f"\n📊 总大小: {total_size:.2f} MB")
    print(f"📁 模型目录: {models_dir}")
    
    print("\n🎉 模型准备完成！")
    print("现在可以运行 'npm run dev' 启动项目了")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="ResNet18 ONNX 模型管理工具")
    parser.add_argument("--step", choices=["export", "simplify", "test", "labels", "config", "all"], 
                       default="all", help="执行特定步骤")
    parser.add_argument("--skip-test", action="store_true", help="跳过测试步骤")
    
    args = parser.parse_args()
    
    print("🚀 ResNet18 ONNX 模型管理工具")
    print("=" * 50)
    
    # 设置环境
    models_dir = setup_environment()
    
    success = True
    
    if args.step == "all":
        # 执行所有步骤
        if not export_model(models_dir):
            success = False
        
        if success and not simplify_model(models_dir):
            success = False
        
        if success and not args.skip_test and not test_models(models_dir):
            success = False
        
        if success and not download_labels(models_dir):
            success = False
        
        if success and not create_model_config(models_dir):
            success = False
        
        if success:
            show_summary(models_dir)
    
    elif args.step == "export":
        success = export_model(models_dir)
    
    elif args.step == "simplify":
        success = simplify_model(models_dir)
    
    elif args.step == "test":
        success = test_models(models_dir)
    
    elif args.step == "labels":
        success = download_labels(models_dir)
    
    elif args.step == "config":
        success = create_model_config(models_dir)
    
    if not success:
        print("\n❌ 操作失败！")
        sys.exit(1)
    else:
        print("\n✅ 操作完成！")

if __name__ == "__main__":
    main() 