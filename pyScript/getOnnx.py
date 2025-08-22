import torch
import torchvision.models as models

# 1. 加载预训练的 ResNet18
model = models.resnet18(pretrained=True)
model.eval()  # 评估模式

# 2. 创建一个输入张量 (batch_size=1, 3通道RGB图像, 224x224)
dummy_input = torch.randn(1, 3, 224, 224)

# 3. 导出为 ONNX
torch.onnx.export(
    model,                      # 模型
    dummy_input,                # 示例输入
    "resnet18.onnx",            # 导出文件名
    export_params=True,         # 保存训练权重
    opset_version=11,           # ONNX 的版本（11兼容性好）
    do_constant_folding=True,   # 常量折叠优化
    input_names=['input'],      # 输入层命名
    output_names=['output'],    # 输出层命名
    dynamic_axes=None
    # 当设定为支持动态 batch size导出时，sessionOptions.executionProviders = ["webgl"]、模型输入张量为[1, 3, 224, 224]会有报错！！
    # dynamic_axes={              # 支持动态 batch size
    #     'input': {0: 'batch_size'}, 
    #     'output': {0: 'batch_size'}
    # }
)

print("✅ ResNet18 已成功导出为 resnet18.onnx")
