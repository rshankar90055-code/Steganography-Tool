// Backend-powered steganography using FastAPI (Pillow, NumPy, PyCryptodome)

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

/**
 * Embed a message into an image by delegating to backend
 * @param {File} imageFile - The image file to embed the message into
 * @param {string} message - The message to embed
 * @param {string} key - The encryption key
 * @returns {Promise<Object>} - Object containing the stego image as base64
 */
export const embedMessage = async (imageFile, message, key) => {
  const form = new FormData();
  form.append('image', imageFile);
  form.append('message', message);
  form.append('key', key);

  const res = await fetch(`${API_BASE}/embed`, {
    method: 'POST',
    body: form
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Embedding failed');
  }

  const data = await res.json();
  return {
    stegoImageBase64: data.stegoImageBase64,
    originalSize: imageFile.size,
    stegoSize: data.stegoImageBase64?.length || 0,
  };
};

/**
 * Extract a message from an image by delegating to backend
 * @param {File} imageFile - The stego image file
 * @param {string} key - The decryption key
 * @returns {Promise<Object>} - Object containing the extracted message
 */
export const extractMessage = async (imageFile, key) => {
  const form = new FormData();
  form.append('image', imageFile);
  form.append('key', key);

  const res = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    body: form
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'No valid message found in image');
  }

  const data = await res.json();
  return {
    message: data.message,
    confidence: data.confidence ?? 95,
  };
};
