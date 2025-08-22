from onnxsim import simplify
import onnx

onnx_model = onnx.load("resnet18.onnx")
model_simp, check = simplify(onnx_model)

onnx.save(model_simp, "resnet18_simplified.onnx")
print("✅ 简化后的模型已保存为 resnet18_simplified.onnx")
