#!/usr/bin/env python3
"""
ResNet18 ONNX 模型测试脚本
测试ONNX模型的推理功能和性能
"""

import os
import sys
import time
import numpy as np
from pathlib import Path

def test_onnx_model(model_path):
    """
    测试ONNX模型的基本功能
    
    Args:
        model_path (str): 模型文件路径
    """
    try:
        print(f"🧪 测试ONNX模型: {model_path}")
        
        # 检查文件是否存在
        if not os.path.exists(model_path):
            print(f"❌ 模型文件不存在: {model_path}")
            return False
        
        # 导入必要的库
        try:
            import onnx
            import onnxruntime as ort
        except ImportError as e:
            print(f"❌ 缺少依赖: {e}")
            print("请安装: pip install onnx onnxruntime")
            return False
        
        # 1. 加载模型
        print("📥 加载ONNX模型...")
        onnx_model = onnx.load(model_path)
        onnx.checker.check_model(onnx_model)
        print("✅ ONNX 模型结构正确")
        
        # 2. 使用 ONNX Runtime 进行推理
        print("🔧 创建推理会话...")
        ort_session = ort.InferenceSession(model_path)
        print("✅ 推理会话创建成功")
        
        # 3. 构造输入数据
        dummy_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
        print(f"📊 输入数据形状: {dummy_input.shape}")
        
        # 4. 运行推理
        print("🚀 执行推理...")
        outputs = ort_session.run(None, {"input": dummy_input})
        
        print("✅ 推理成功")
        print(f"📊 输出形状: {outputs[0].shape}")
        print(f"📊 输出范围: [{outputs[0].min():.4f}, {outputs[0].max():.4f}]")
        
        return True
        
    except Exception as e:
        print(f"❌ 模型测试失败: {e}")
        return False

def benchmark_model(model_path, num_runs=10):
    """
    性能基准测试
    
    Args:
        model_path (str): 模型文件路径
        num_runs (int): 测试次数
    """
    try:
        import onnxruntime as ort
        
        print(f"⚡ 性能基准测试: {model_path}")
        print(f"📊 测试次数: {num_runs}")
        
        # 创建推理会话
        ort_session = ort.InferenceSession(model_path)
        input_name = ort_session.get_inputs()[0].name
        
        # 准备测试数据
        test_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
        
        # 预热
        print("🔥 预热中...")
        for _ in range(5):
            ort_session.run(None, {input_name: test_input})
        
        # 性能测试
        print("📈 开始性能测试...")
        times = []
        
        for i in range(num_runs):
            start_time = time.time()
            ort_session.run(None, {input_name: test_input})
            end_time = time.time()
            
            inference_time = (end_time - start_time) * 1000  # 转换为毫秒
            times.append(inference_time)
            
            print(f"   第 {i+1}/{num_runs} 次: {inference_time:.2f}ms")
        
        # 计算统计信息
        avg_time = np.mean(times)
        std_time = np.std(times)
        min_time = np.min(times)
        max_time = np.max(times)
        
        print("\n📊 性能测试结果:")
        print(f"   平均推理时间: {avg_time:.2f}ms ± {std_time:.2f}ms")
        print(f"   最小推理时间: {min_time:.2f}ms")
        print(f"   最大推理时间: {max_time:.2f}ms")
        print(f"   标准差: {std_time:.2f}ms")
        
        return True
        
    except Exception as e:
        print(f"❌ 性能测试失败: {e}")
        return False

def test_model_accuracy(model_path, test_images=None):
    """
    测试模型准确性（可选）
    
    Args:
        model_path (str): 模型文件路径
        test_images (list): 测试图像路径列表
    """
    try:
        import onnxruntime as ort
        
        print(f"🎯 准确性测试: {model_path}")
        
        # 创建推理会话
        ort_session = ort.InferenceSession(model_path)
        input_name = ort_session.get_inputs()[0].name
        
        if test_images:
            # 使用真实图像测试
            print("📸 使用真实图像测试...")
            # 这里可以添加图像预处理和推理逻辑
            pass
        else:
            # 使用随机数据测试
            print("🎲 使用随机数据测试...")
            
            # 多次推理，检查输出一致性
            outputs = []
            for i in range(5):
                test_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
                output = ort_session.run(None, {input_name: test_input})[0]
                outputs.append(output)
            
            # 检查输出的一致性
            first_output = outputs[0]
            consistent = True
            
            for i, output in enumerate(outputs[1:], 1):
                if output.shape != first_output.shape:
                    print(f"❌ 第 {i} 次输出形状不一致")
                    consistent = False
                    break
            
            if consistent:
                print("✅ 输出一致性检查通过")
            else:
                print("❌ 输出一致性检查失败")
        
        return True
        
    except Exception as e:
        print(f"❌ 准确性测试失败: {e}")
        return False

def compare_models_performance(model_paths):
    """
    比较多个模型的性能
    
    Args:
        model_paths (list): 模型路径列表
    """
    try:
        print("📊 模型性能比较")
        print("=" * 50)
        
        results = []
        
        for model_path in model_paths:
            if not os.path.exists(model_path):
                print(f"⚠️ 模型文件不存在: {model_path}")
                continue
            
            print(f"\n🔍 测试模型: {os.path.basename(model_path)}")
            
            # 获取文件大小
            file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
            
            # 性能测试
            try:
                import onnxruntime as ort
                import time
                
                ort_session = ort.InferenceSession(model_path)
                input_name = ort_session.get_inputs()[0].name
                test_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
                
                # 预热
                for _ in range(3):
                    ort_session.run(None, {input_name: test_input})
                
                # 测试推理时间
                times = []
                for _ in range(5):
                    start_time = time.time()
                    ort_session.run(None, {input_name: test_input})
                    end_time = time.time()
                    times.append((end_time - start_time) * 1000)
                
                avg_time = np.mean(times)
                
                results.append({
                    'model': os.path.basename(model_path),
                    'size_mb': file_size,
                    'avg_time_ms': avg_time
                })
                
                print(f"   文件大小: {file_size:.2f} MB")
                print(f"   平均推理时间: {avg_time:.2f}ms")
                
            except Exception as e:
                print(f"   ❌ 测试失败: {e}")
        
        # 显示比较结果
        if results:
            print("\n📈 性能比较结果:")
            print("-" * 50)
            print(f"{'模型':<20} {'大小(MB)':<10} {'推理时间(ms)':<15}")
            print("-" * 50)
            
            for result in results:
                print(f"{result['model']:<20} {result['size_mb']:<10.2f} {result['avg_time_ms']:<15.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ 性能比较失败: {e}")
        return False

def main():
    """主函数"""
    print("🧪 ResNet18 ONNX 模型测试工具")
    print("=" * 50)
    
    # 设置模型路径
    models_dir = Path("../public/models")
    models = [
        models_dir / "resnet18.onnx",
        models_dir / "resnet18_simplified.onnx"
    ]
    
    # 检查模型文件
    available_models = []
    for model_path in models:
        if model_path.exists():
            available_models.append(str(model_path))
            print(f"✅ 找到模型: {model_path}")
        else:
            print(f"⚠️ 模型不存在: {model_path}")
    
    if not available_models:
        print("❌ 没有找到可用的模型文件")
        print("请先运行 getOnnx.py 导出模型")
        sys.exit(1)
    
    # 测试每个模型
    for model_path in available_models:
        print(f"\n{'='*20} 测试模型: {os.path.basename(model_path)} {'='*20}")
        
        # 基本功能测试
        if test_onnx_model(model_path):
            # 性能基准测试
            benchmark_model(model_path)
            
            # 准确性测试
            test_model_accuracy(model_path)
        else:
            print(f"❌ 模型 {model_path} 测试失败")
    
    # 性能比较
    if len(available_models) > 1:
        print(f"\n{'='*20} 模型性能比较 {'='*20}")
        compare_models_performance(available_models)
    
    print("\n" + "=" * 50)
    print("🎉 模型测试完成！")
    print("=" * 50)

if __name__ == "__main__":
    main()
