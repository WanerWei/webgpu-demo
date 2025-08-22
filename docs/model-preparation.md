# ResNet18 ONNX 模型准备指南

本文档详细介绍如何获取、转换和准备ResNet18 ONNX模型文件，用于WebGPU + ONNX Runtime Web项目。

## 📋 目录

- [模型获取方法](#模型获取方法)
- [模型转换步骤](#模型转换步骤)
- [模型优化](#模型优化)
- [模型验证](#模型验证)
- [常见问题](#常见问题)

## 🎯 模型获取方法

### 方法一：使用预训练模型（推荐）

#### 1. 从ONNX Model Zoo获取

ONNX Model Zoo提供了大量预训练的ONNX模型，包括ResNet18：

```bash
# 克隆ONNX Model Zoo仓库
git clone https://github.com/onnx/models.git
cd models/vision/classification/resnet

# 下载ResNet18模型
wget https://github.com/onnx/models/raw/main/vision/classification/resnet/model/resnet18-v1-7.onnx
```

#### 2. 从Hugging Face获取

```python
from transformers import AutoFeatureExtractor, AutoModelForImageClassification
import torch

# 加载预训练的ResNet18模型
model_name = "microsoft/resnet-18"
feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
model = AutoModelForImageClassification.from_pretrained(model_name)

# 转换为ONNX格式
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model,
    dummy_input,
    "resnet18.onnx",
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'},
                  'output': {0: 'batch_size'}}
)
```

### 方法二：从PyTorch转换 （本项目用的此方法）

#### 1. 安装依赖

```bash
pip install torch torchvision onnx onnxruntime
```

#### 2. 转换脚本

创建 `convert_resnet18.py` 文件：

```python
import torch
import torchvision.models as models
import torch.nn as nn

def convert_resnet18_to_onnx():
    """将PyTorch ResNet18模型转换为ONNX格式"""
    
    # 加载预训练的ResNet18模型
    model = models.resnet18(pretrained=True)
    model.eval()
    
    # 创建示例输入
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # 导出为ONNX
    torch.onnx.export(
        model,
        dummy_input,
        "resnet18.onnx",
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'},
                      'output': {0: 'batch_size'}}
    )
    
    print("ResNet18模型已成功转换为ONNX格式")

if __name__ == "__main__":
    convert_resnet18_to_onnx()
```

运行转换脚本：

```bash
python convert_resnet18.py
```

### 方法三：使用TensorFlow/Keras转换

#### 1. 安装依赖

```bash
pip install tensorflow onnx tf2onnx
```

#### 2. 转换脚本

```python
import tensorflow as tf
import tf2onnx

def convert_keras_resnet18_to_onnx():
    """将Keras ResNet18模型转换为ONNX格式"""
    
    # 加载预训练的ResNet18模型
    model = tf.keras.applications.ResNet50(weights='imagenet')
    
    # 转换为ONNX
    onnx_model, _ = tf2onnx.convert.from_keras(model, output_path="resnet18.onnx")
    
    print("ResNet18模型已成功转换为ONNX格式")

if __name__ == "__main__":
    convert_keras_resnet18_to_onnx()
```

## 🔧 模型转换步骤

### 步骤1：环境准备

```bash
# 创建虚拟环境
python -m venv onnx_env
source onnx_env/bin/activate  # Linux/Mac
# 或
onnx_env\Scripts\activate  # Windows

# 安装依赖
pip install torch torchvision onnx onnxruntime pillow numpy
```

### 步骤2：模型转换

使用提供的转换脚本：

```python
# convert_model.py
import torch
import torchvision.models as models
import torch.nn as nn
from torchvision import transforms
import onnx
import onnxruntime
import numpy as np
from PIL import Image

class ResNet18Converter:
    def __init__(self):
        self.model = None
        self.transform = None
        
    def load_pretrained_model(self):
        """加载预训练的ResNet18模型"""
        self.model = models.resnet18(pretrained=True)
        self.model.eval()
        
        # 定义图像预处理
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        print("预训练模型加载完成")
    
    def convert_to_onnx(self, output_path="resnet18.onnx"):
        """转换为ONNX格式"""
        if self.model is None:
            raise ValueError("请先加载模型")
        
        # 创建示例输入
        dummy_input = torch.randn(1, 3, 224, 224)
        
        # 导出为ONNX
        torch.onnx.export(
            self.model,
            dummy_input,
            output_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={'input': {0: 'batch_size'},
                          'output': {0: 'batch_size'}}
        )
        
        print(f"模型已转换为ONNX格式: {output_path}")
    
    def validate_onnx_model(self, onnx_path="resnet18.onnx"):
        """验证ONNX模型"""
        # 检查ONNX模型
        onnx_model = onnx.load(onnx_path)
        onnx.checker.check_model(onnx_model)
        print("ONNX模型验证通过")
        
        # 测试推理
        ort_session = onnxruntime.InferenceSession(onnx_path)
        
        # 创建测试输入
        test_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
        
        # 运行推理
        ort_inputs = {ort_session.get_inputs()[0].name: test_input}
        ort_outputs = ort_session.run(None, ort_inputs)
        
        print(f"推理测试成功，输出形状: {ort_outputs[0].shape}")
        return True

def main():
    converter = ResNet18Converter()
    
    # 加载模型
    converter.load_pretrained_model()
    
    # 转换为ONNX
    converter.convert_to_onnx()
    
    # 验证模型
    converter.validate_onnx_model()
    
    print("模型转换和验证完成！")

if __name__ == "__main__":
    main()
```

### 步骤3：运行转换

```bash
python convert_model.py
```

## ⚡ 模型优化

### 1. 模型量化

```python
import onnx
from onnxruntime.quantization import quantize_dynamic

def quantize_model(input_path, output_path):
    """动态量化模型以减小文件大小"""
    quantize_dynamic(
        model_input=input_path,
        model_output=output_path,
        weight_type=onnx.TensorProto.INT8
    )
    print(f"模型量化完成: {output_path}")

# 使用示例
quantize_model("resnet18.onnx", "resnet18_quantized.onnx")
```

### 2. 模型简化

```python
import onnxsim
import onnx

def simplify_model(input_path, output_path):
    """简化ONNX模型"""
    # 加载模型
    model = onnx.load(input_path)
    
    # 简化模型
    simplified_model, check = onnxsim.simplify(model)
    
    if check:
        onnx.save(simplified_model, output_path)
        print(f"模型简化完成: {output_path}")
    else:
        print("模型简化失败")

# 使用示例
simplify_model("resnet18.onnx", "resnet18_simplified.onnx")
```

### 3. 模型剪枝

```python
def create_optimized_model():
    """创建优化版本的模型"""
    # 这里可以添加模型剪枝、知识蒸馏等优化技术
    pass
```

## ✅ 模型验证

### 1. 基本验证

```python
def validate_model_basic(onnx_path):
    """基本模型验证"""
    import onnx
    
    # 加载模型
    model = onnx.load(onnx_path)
    
    # 检查模型结构
    onnx.checker.check_model(model)
    
    # 打印模型信息
    print(f"模型输入: {[input.name for input in model.graph.input]}")
    print(f"模型输出: {[output.name for input in model.graph.output]}")
    print(f"模型操作数: {len(model.graph.node)}")
    
    return True
```

### 2. 推理验证

```python
def validate_model_inference(onnx_path, test_image_path=None):
    """推理验证"""
    import onnxruntime
    import numpy as np
    from PIL import Image
    
    # 创建推理会话
    session = onnxruntime.InferenceSession(onnx_path)
    
    # 准备测试输入
    if test_image_path:
        # 使用真实图像
        image = Image.open(test_image_path)
        # 预处理图像...
        input_data = preprocess_image(image)
    else:
        # 使用随机数据
        input_data = np.random.randn(1, 3, 224, 224).astype(np.float32)
    
    # 运行推理
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    
    outputs = session.run([output_name], {input_name: input_data})
    
    print(f"推理成功，输出形状: {outputs[0].shape}")
    print(f"输出范围: [{outputs[0].min():.4f}, {outputs[0].max():.4f}]")
    
    return outputs[0]

def preprocess_image(image):
    """图像预处理"""
    # 这里实现与训练时相同的预处理逻辑
    # 包括缩放、归一化等
    pass
```

### 3. 性能测试

```python
def benchmark_model(onnx_path, num_runs=100):
    """模型性能基准测试"""
    import onnxruntime
    import time
    import numpy as np
    
    session = onnxruntime.InferenceSession(onnx_path)
    input_name = session.get_inputs()[0].name
    
    # 预热
    dummy_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
    for _ in range(10):
        session.run(None, {input_name: dummy_input})
    
    # 性能测试
    times = []
    for _ in range(num_runs):
        start_time = time.time()
        session.run(None, {input_name: dummy_input})
        end_time = time.time()
        times.append((end_time - start_time) * 1000)  # 转换为毫秒
    
    avg_time = np.mean(times)
    std_time = np.std(times)
    
    print(f"平均推理时间: {avg_time:.2f}ms ± {std_time:.2f}ms")
    print(f"最小推理时间: {np.min(times):.2f}ms")
    print(f"最大推理时间: {np.max(times):.2f}ms")
    
    return avg_time, std_time
```

## 📁 文件组织

将转换好的模型文件放置在项目的正确位置：

```
webgpu-demo/
├── public/
│   └── models/
│       ├── resnet18.onnx              # 原始模型
│       ├── resnet18_simplified.onnx   # 简化版本
│       ├── resnet18_quantized.onnx    # 量化版本
│       └── imagenet_classes.json      # 类别标签
```

## 🔍 常见问题

### Q1: 模型文件太大怎么办？

**A**: 可以尝试以下方法：
- 使用模型量化减小文件大小
- 使用模型简化去除冗余操作
- 考虑使用更小的模型架构

### Q2: 推理速度慢怎么办？

**A**: 可以尝试以下优化：
- 使用WebGPU执行提供者
- 启用图优化
- 使用量化模型
- 调整批处理大小

### Q3: 模型加载失败怎么办？

**A**: 检查以下几点：
- 模型文件路径是否正确
- 模型格式是否为有效的ONNX格式
- 浏览器是否支持WebGPU
- 网络连接是否正常

### Q4: 如何添加新的模型？

**A**: 按照以下步骤：
1. 将ONNX模型文件放入 `public/models/` 目录
2. 在 `ModelManager.getAvailableModels()` 中添加模型配置
3. 准备对应的类别标签文件
4. 测试模型加载和推理

## 📚 参考资源

- [ONNX官方文档](https://onnx.ai/)
- [ONNX Model Zoo](https://github.com/onnx/models)
- [PyTorch ONNX导出指南](https://pytorch.org/docs/stable/onnx.html)
- [ONNX Runtime Web文档](https://github.com/microsoft/onnxruntime/tree/master/js/web)

## 🛠️ 自动化脚本

项目已经提供了完整的自动化脚本，位于 `pyScript/` 目录中：

### 统一管理脚本（推荐）

```bash
# 执行所有步骤
python pyScript/manage_models.py

# 执行特定步骤
python pyScript/manage_models.py --step export    # 只导出模型
python pyScript/manage_models.py --step simplify  # 只简化模型
python pyScript/manage_models.py --step test      # 只测试模型
python pyScript/manage_models.py --step labels    # 只下载标签
python pyScript/manage_models.py --step config    # 只创建配置

# 跳过测试步骤
python pyScript/manage_models.py --skip-test
```

### 单独脚本

```bash
# 导出模型
python pyScript/getOnnx.py

# 简化模型
python pyScript/getSimplifiedOnnx.py

# 测试模型
python pyScript/testOnnx.py
```

### 快速开始

```bash
# 一键完成所有准备工作
python scripts/quick_start.py
```

这些脚本会自动处理模型导出、简化、测试、标签下载等所有步骤，让您快速开始项目开发！ 