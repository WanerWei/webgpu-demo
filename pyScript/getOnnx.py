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
    # 当设定为支持动态 batch size导出时，sessionOptions.executionProviders = ["webgl"]、模型输入张量为[1, 3, 224, 224]会有报错！！
    dynamic_axes=None
    # 这个现象其实跟 ONNX Runtime WebGL 后端的限制 有关，不是模型的问题。
    # 1. 现象复现
    # 你导出的 ResNet18 是 动态 batch size ([N, 3, 224, 224])。
    # onnxruntime-web 在 WebGPU、CPU、WASM 后端都支持动态维度推理，所以上 [1,3,224,224] 是合法的输入。
    # 但在 WebGL 后端，动态维度解析有 bug/限制：
    # WebGL 里的 shader 编译通常需要 固定 tensor shape，否则无法提前分配 buffer。
    # ONNX Runtime WebGL 后端尝试校验时，会拿 [,3,224,224] 和 [1,3,224,224] 做 strict 比较，结果报错。
    # 所以，WebGL 不支持动态 batch size，而其他 backend 可以。
    # dynamic_axes={              # 支持动态 batch size
    #     'input': {0: 'batch_size'}, 
    #     'output': {0: 'batch_size'}
    # }
)

print("✅ ResNet18 已成功导出为 resnet18.onnx")
