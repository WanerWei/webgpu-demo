import onnxruntime as ort
import numpy as np

# 创建 ONNX Runtime 会话
ort_session = ort.InferenceSession("resnet18.onnx")

# 输入一个随机图像 (1, 3, 224, 224)
inputs = np.random.randn(1, 3, 224, 224).astype(np.float32)

# 推理
outputs = ort_session.run(None, {"input": inputs})

print("✅ 推理输出 shape:", outputs[0].shape)  # (1, 1000) 对应 ImageNet 1000 类
