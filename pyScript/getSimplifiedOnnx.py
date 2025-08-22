#!/usr/bin/env python3
"""
ResNet18 ONNX 模型简化脚本
使用onnxsim简化ONNX模型，减少模型大小和推理时间
"""

import os
import sys
from pathlib import Path

def simplify_onnx_model(input_path, output_path):
    """
    简化ONNX模型
    
    Args:
        input_path (str): 输入模型路径
        output_path (str): 输出模型路径
    """
    try:
        print("🔄 开始简化ONNX模型...")
        
        # 检查输入文件是否存在
        if not os.path.exists(input_path):
            print(f"❌ 输入文件不存在: {input_path}")
            return False
        
        # 导入onnxsim
        try:
            from onnxsim import simplify
            import onnx
        except ImportError:
            print("❌ 未安装onnxsim库，请运行: pip install onnxsim")
            return False
        
        print(f"📥 加载模型: {input_path}")
        onnx_model = onnx.load(input_path)
        
        print("🔄 正在简化模型...")
        model_simp, check = simplify(onnx_model)
        
        if check:
            onnx.save(model_simp, output_path)
            
            # 比较文件大小
            original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
            simplified_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            reduction = ((original_size - simplified_size) / original_size) * 100
            
            print(f"✅ 简化后的模型已保存为 {output_path}")
            print(f"📊 原始大小: {original_size:.2f} MB")
            print(f"📊 简化后大小: {simplified_size:.2f} MB")
            print(f"📊 减少: {reduction:.1f}%")
            
            return True
        else:
            print("❌ 模型简化失败")
            return False
            
    except Exception as e:
        print(f"❌ 简化过程出错: {e}")
        return False

def validate_simplified_model(model_path):
    """
    验证简化后的模型
    
    Args:
        model_path (str): 模型文件路径
    """
    try:
        import onnx
        
        print(f"🔍 验证简化模型: {model_path}")
        model = onnx.load(model_path)
        onnx.checker.check_model(model)
        
        print("✅ 简化模型验证通过")
        print(f"📊 模型操作数: {len(model.graph.node)}")
        
        return True
        
    except ImportError:
        print("⚠️ 未安装onnx库，跳过模型验证")
        return True
    except Exception as e:
        print(f"❌ 简化模型验证失败: {e}")
        return False

def compare_models(original_path, simplified_path):
    """
    比较原始模型和简化模型
    
    Args:
        original_path (str): 原始模型路径
        simplified_path (str): 简化模型路径
    """
    try:
        import onnx
        
        print("📊 模型比较:")
        
        # 加载模型
        original_model = onnx.load(original_path)
        simplified_model = onnx.load(simplified_path)
        
        # 比较操作数
        original_nodes = len(original_model.graph.node)
        simplified_nodes = len(simplified_model.graph.node)
        node_reduction = ((original_nodes - simplified_nodes) / original_nodes) * 100
        
        print(f"   原始模型操作数: {original_nodes}")
        print(f"   简化模型操作数: {simplified_nodes}")
        print(f"   操作数减少: {node_reduction:.1f}%")
        
        # 比较文件大小
        original_size = os.path.getsize(original_path) / (1024 * 1024)
        simplified_size = os.path.getsize(simplified_path) / (1024 * 1024)
        size_reduction = ((original_size - simplified_size) / original_size) * 100
        
        print(f"   原始模型大小: {original_size:.2f} MB")
        print(f"   简化模型大小: {simplified_size:.2f} MB")
        print(f"   大小减少: {size_reduction:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ 模型比较失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 ResNet18 ONNX 模型简化工具")
    print("=" * 50)
    
    # 设置路径
    models_dir = Path("../public/models")
    input_path = models_dir / "resnet18.onnx"
    output_path = models_dir / "resnet18_simplified.onnx"
    
    # 检查输入文件
    if not input_path.exists():
        print(f"❌ 原始模型文件不存在: {input_path}")
        print("请先运行 getOnnx.py 导出模型")
        sys.exit(1)
    
    # 简化模型
    if simplify_onnx_model(str(input_path), str(output_path)):
        # 验证简化模型
        validate_simplified_model(str(output_path))
        
        # 比较模型
        compare_models(str(input_path), str(output_path))
        
        print("\n" + "=" * 50)
        print("🎉 模型简化完成！")
        print(f"📁 简化模型: {output_path}")
        print("=" * 50)
    else:
        print("\n❌ 模型简化失败！")
        sys.exit(1)

if __name__ == "__main__":
    main()
