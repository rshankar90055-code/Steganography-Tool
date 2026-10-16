const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

/**
 * Encrypt text using backend (PyCryptodome AES-256-CBC)
 * @param {string} text
 * @param {string} key
 * @returns {Promise<string>} Base64 payload (salt+iv+ciphertext)
 */
export const encryptText = async (text, key) => {
  const res = await fetch(`${API_BASE}/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Encryption failed');
  }
  const data = await res.json();
  return data.encrypted;
};

/**
 * Decrypt text using backend (PyCryptodome AES-256-CBC)
 * @param {string} encryptedText Base64 payload (salt+iv+ciphertext)
 * @param {string} key
 * @returns {Promise<string>} Decrypted text
 */
export const decryptText = async (encryptedText, key) => {
  const res = await fetch(`${API_BASE}/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encrypted: encryptedText, key })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Decryption failed');
  }
  const data = await res.json();
  return data.text;
};

export const generateKey = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const validateKey = (key) => {
  const result = {
    isValid: true,
    score: 0,
    suggestions: []
  };
  if (key.length < 8) {
    result.isValid = false;
    result.suggestions.push('Key should be at least 8 characters long');
  } else {
    result.score += 20;
  }
  if (key.length >= 16) {
    result.score += 20;
  }
  if (/[a-z]/.test(key)) {
    result.score += 10;
  } else {
    result.suggestions.push('Include lowercase letters');
  }
  if (/[A-Z]/.test(key)) {
    result.score += 10;
  } else {
    result.suggestions.push('Include uppercase letters');
  }
  if (/[0-9]/.test(key)) {
    result.score += 10;
  } else {
    result.suggestions.push('Include numbers');
  }
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(key)) {
    result.score += 20;
  } else {
    result.suggestions.push('Include special characters');
  }
  if (result.score < 50) {
    result.isValid = false;
  }
  return result;
};
