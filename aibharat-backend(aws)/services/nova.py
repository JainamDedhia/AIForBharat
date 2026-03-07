import base64, json, io
from PIL import Image
from core.config import bedrock_client

MODEL_ID = "amazon.nova-pro-v1:0"

def _pil_to_base64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def call_nova(prompt: str, images: list = None) -> str:
    content = []
    if images:
        for img in images:
            content.append({
                "image": {
                    "format": "jpeg",
                    "source": {
                        "bytes": _pil_to_base64(img)
                    }
                }
            })
    content.append({"text": prompt})

    body = json.dumps({
        "messages": [{"role": "user", "content": content}],
        "inferenceConfig": {"maxTokens": 4096, "temperature": 0.3}
    })

    response = bedrock_client.invoke_model(
        modelId=MODEL_ID,
        body=body,
        contentType="application/json",
        accept="application/json"
    )
    result = json.loads(response['body'].read())
    return result['output']['message']['content'][0]['text'].strip()

def call_nova_text(prompt: str) -> str:
    return call_nova(prompt, images=None)
