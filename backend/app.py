from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
import numpy as np
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
import base64

app = Flask(__name__)
CORS(app)

PBKDF2_ITERATIONS = 100_000
SALT_SIZE = 16
IV_SIZE = 16
END_MARKER = "STEG_END"


def derive_key(password: str, salt: bytes) -> bytes:
    return PBKDF2(password, salt, dkLen=32, count=PBKDF2_ITERATIONS)


def aes_encrypt(plaintext: str, password: str) -> str:
    salt = get_random_bytes(SALT_SIZE)
    key = derive_key(password, salt)
    iv = get_random_bytes(IV_SIZE)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    data = plaintext.encode("utf-8")
    pad_len = 16 - (len(data) % 16)
    padded = data + bytes([pad_len]) * pad_len
    ciphertext = cipher.encrypt(padded)
    blob = salt + iv + ciphertext
    return base64.b64encode(blob).decode("utf-8")


def aes_decrypt(blob_b64: str, password: str) -> str:
    blob = base64.b64decode(blob_b64)
    salt = blob[:SALT_SIZE]
    iv = blob[SALT_SIZE:SALT_SIZE+IV_SIZE]
    ciphertext = blob[SALT_SIZE+IV_SIZE:]
    key = derive_key(password, salt)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded = cipher.decrypt(ciphertext)
    pad_len = padded[-1]
    if pad_len < 1 or pad_len > 16:
        raise ValueError("Invalid padding")
    return padded[:-pad_len].decode("utf-8")


def string_to_bits(s: str) -> np.ndarray:
    arr = np.frombuffer(s.encode("latin1"), dtype=np.uint8)
    bits = ((arr[:, None] >> np.arange(7, -1, -1)) & 1).astype(np.uint8)
    return bits.reshape(-1)


def bits_to_string(bits: np.ndarray) -> str:
    if bits.size % 8 != 0:
        bits = bits[: bits.size - (bits.size % 8)]
    bytes_arr = np.packbits(bits.reshape(-1, 8), axis=1).reshape(-1)
    return bytes(bytes_arr).decode("latin1", errors="ignore")


def embed_lsb(image: Image.Image, payload: str) -> Image.Image:
    arr = np.array(image.convert("RGBA"))
    data = arr.reshape(-1, 4)
    rgb = data[:, :3]

    message_bits = string_to_bits(payload)
    end_bits = string_to_bits(END_MARKER)
    full = np.concatenate([message_bits, end_bits], axis=0)

    capacity = rgb.size
    if full.size > capacity:
        raise ValueError("Message too long for this image")

    flat = rgb.reshape(-1)
    flat[:full.size] = (flat[:full.size] & 0xFE) | full
    rgb = flat.reshape(-1, 3)
    data[:, :3] = rgb
    out = Image.fromarray(arr, mode="RGBA")
    return out


def extract_lsb(image: Image.Image) -> str:
    arr = np.array(image.convert("RGBA"))
    data = arr.reshape(-1, 4)
    rgb = data[:, :3].reshape(-1)
    bits = (rgb & 1).astype(np.uint8)
    text = bits_to_string(bits)
    end_idx = text.find(END_MARKER)
    if end_idx == -1:
        raise ValueError("No valid message found in image")
    return text[:end_idx]


@app.post("/embed")
def embed_endpoint():
    if 'image' not in request.files:
        return jsonify({"error": "image file missing"}), 400
    image_file = request.files['image']
    message = request.form.get('message', '')
    key = request.form.get('key', '')
    if not message or not key:
        return jsonify({"error": "message and key are required"}), 400

    img = Image.open(image_file.stream)
    encrypted = aes_encrypt(message, key)
    stego_img = embed_lsb(img, encrypted)
    buf = BytesIO()
    stego_img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return jsonify({"stegoImageBase64": f"data:image/png;base64,{b64}"})


@app.post("/extract")
def extract_endpoint():
    if 'image' not in request.files:
        return jsonify({"error": "image file missing"}), 400
    key = request.form.get('key', '')
    if not key:
        return jsonify({"error": "key is required"}), 400

    image_file = request.files['image']
    img = Image.open(image_file.stream)
    encrypted = extract_lsb(img)
    try:
        message = aes_decrypt(encrypted, key)
    except Exception:
        return jsonify({"error": "Failed to decrypt message. Wrong key?"}), 400
    return jsonify({"message": message, "confidence": 95})


@app.post("/encrypt")
def encrypt_endpoint():
    data = request.get_json(silent=True) or {}
    text = data.get('text', '')
    key = data.get('key', '')
    if not text or not key:
        return jsonify({"error": "text and key are required"}), 400
    encrypted = aes_encrypt(text, key)
    return jsonify({"encrypted": encrypted})


@app.post("/decrypt")
def decrypt_endpoint():
    data = request.get_json(silent=True) or {}
    encrypted = data.get('encrypted', '')
    key = data.get('key', '')
    if not encrypted or not key:
        return jsonify({"error": "encrypted and key are required"}), 400
    try:
        text = aes_decrypt(encrypted, key)
    except Exception:
        return jsonify({"error": "Decryption failed"}), 400
    return jsonify({"text": text})


def analyze_image(image: Image.Image) -> dict:
    """Analyze image for steganography using NumPy statistical analysis"""
    arr = np.array(image.convert("RGBA"))
    data = arr.reshape(-1, 4)
    rgb = data[:, :3].reshape(-1)
    
    # LSB analysis
    lsb_bits = (rgb & 1).astype(np.uint8)
    lsb_ratio = np.mean(lsb_bits)
    
    # Chi-square test
    lsb_counts = np.bincount(lsb_bits, minlength=2)
    total = len(lsb_bits)
    expected = total / 2
    chi_square = ((lsb_counts[0] - expected) ** 2 + (lsb_counts[1] - expected) ** 2) / expected
    
    # Look for STEG_END marker
    bits = lsb_bits
    if bits.size % 8 != 0:
        bits = bits[: bits.size - (bits.size % 8)]
    bytes_arr = np.packbits(bits.reshape(-1, 8), axis=1).reshape(-1)
    text = bytes(bytes_arr).decode("latin1", errors="ignore")
    signature_detected = "STEG_END" in text
    
    # Calculate confidence
    confidence = 0
    details = []
    
    if signature_detected:
        confidence += 60
        details.append("Steganographic signature detected in LSB channels")
    
    if chi_square > 2.0:
        confidence += 20
        details.append("Chi-square test indicates LSB data embedding")
    
    if abs(lsb_ratio - 0.5) > 0.05:
        confidence += 15
        details.append("Unusual LSB distribution detected")
    
    if not details:
        details = [
            "No LSB steganography patterns found",
            "Normal LSB distribution detected",
            "Chi-square test shows no LSB anomalies",
            "Image appears clean of hidden data"
        ]
        confidence = max(95 - confidence, 60)
    
    return {
        "detected": confidence > 50,
        "confidence": min(confidence, 99),
        "details": details,
        "statistics": {
            "lsb_ratio": float(lsb_ratio),
            "chi_square": float(chi_square),
            "signature_detected": signature_detected
        }
    }


@app.post("/analyze")
def analyze_endpoint():
    if 'image' not in request.files:
        return jsonify({"error": "image file missing"}), 400
    
    image_file = request.files['image']
    img = Image.open(image_file.stream)
    analysis = analyze_image(img)
    return jsonify(analysis)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
