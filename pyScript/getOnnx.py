#!/usr/bin/env python3
"""
ResNet18 ONNX 模型导出脚本
将预训练的PyTorch ResNet18模型转换为ONNX格式
"""

import torch
import torch.onnx
import torchvision.models as models
import os
import sys
from pathlib import Path

def export_resnet18_to_onnx(output_path="resnet18.onnx", opset_version=11):
    """
    导出ResNet18模型为ONNX格式
    
    Args:
        output_path (str): 输出文件路径
        opset_version (int): ONNX算子版本
    """
    try:
        print("🔄 开始导出ResNet18模型...")
        
        # 1. 加载预训练 ResNet18
        print("📥 加载预训练模型...")
        model = models.resnet18(pretrained=True)
        model.eval()  # 推理模式
        print("✅ 预训练模型加载完成")
        
        # 2. 创建一个虚拟输入（batch_size=1, 3通道，224x224 图像）
        dummy_input = torch.randn(1, 3, 224, 224)
        print(f"📊 输入形状: {dummy_input.shape}")
        
        # 3. 导出为 ONNX
        print("🔄 正在导出为ONNX格式...")
        torch.onnx.export(
            model,                      # 模型
            dummy_input,                # 模拟输入
            output_path,                # 输出文件名
            export_params=True,         # 保存训练好的权重
            opset_version=opset_version, # ONNX 算子版本
            do_constant_folding=True,   # 常量折叠优化
            input_names=['input'],      # 输入名
            output_names=['output'],    # 输出名
            dynamic_axes={              # 动态维度支持（batch_size 可变）
                'input': {0: 'batch_size'},
                'output': {0: 'batch_size'}
            }
        )
        
        # 检查文件大小
        file_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
        print(f"✅ ResNet18 已成功导出为 {output_path}")
        print(f"📁 文件大小: {file_size:.2f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ 导出失败: {e}")
        return False

def validate_onnx_model(model_path):
    """
    验证ONNX模型
    
    Args:
        model_path (str): 模型文件路径
    """
    try:
        import onnx
        
        print(f"🔍 验证模型: {model_path}")
        model = onnx.load(model_path)
        onnx.checker.check_model(model)
        
        print("✅ ONNX模型验证通过")
        print(f"📊 模型输入: {[input.name for input in model.graph.input]}")
        print(f"📊 模型输出: {[output.name for output in model.graph.output]}")
        print(f"📊 模型操作数: {len(model.graph.node)}")
        
        return True
        
    except ImportError:
        print("⚠️ 未安装onnx库，跳过模型验证")
        return True
    except Exception as e:
        print(f"❌ 模型验证失败: {e}")
        return False

def test_inference(model_path):
    """
    测试模型推理
    
    Args:
        model_path (str): 模型文件路径
    """
    try:
        import onnxruntime as ort
        import numpy as np
        
        print(f"🧪 测试推理: {model_path}")
        
        # 创建推理会话
        ort_session = ort.InferenceSession(model_path)
        
        # 构造输入数据
        dummy_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
        
        # 运行推理
        outputs = ort_session.run(None, {"input": dummy_input})
        
        print("✅ 推理测试成功")
        print(f"📊 输出形状: {outputs[0].shape}")
        print(f"📊 输出范围: [{outputs[0].min():.4f}, {outputs[0].max():.4f}]")
        
        return True
        
    except ImportError:
        print("⚠️ 未安装onnxruntime库，跳过推理测试")
        return True
    except Exception as e:
        print(f"❌ 推理测试失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 ResNet18 ONNX 模型导出工具")
    print("=" * 50)
    
    # 设置输出路径
    output_dir = Path("../public/models")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "resnet18.onnx"
    
    # 导出模型
    if export_resnet18_to_onnx(str(output_path)):
        # 验证模型
        validate_onnx_model(str(output_path))
        
        # 测试推理
        test_inference(str(output_path))
        
        print("\n" + "=" * 50)
        print("🎉 模型导出完成！")
        print(f"📁 模型文件: {output_path}")
        print("=" * 50)
    else:
        print("\n❌ 模型导出失败！")
        sys.exit(1)

if __name__ == "__main__":
    main()
