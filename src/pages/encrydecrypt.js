import React, { useState, useEffect } from 'react';
import { encryptText, decryptText, validateKey } from '../utils/encryption';

export default function EncryptDecrypt() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [loading, setLoading] = useState(false);
  const [processedText, setProcessedText] = useState('');

  // Clear fields on page mount
  useEffect(() => {
    setText('');
    setKey('');
    setProcessedText('');
  }, []);

  const handleChangeMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'decrypt') {
      setText('');
      setKey('');
      setProcessedText('');
    }
  };

  const handleProcess = async () => {
    if (!text || !key) {
      alert('Please enter both text and a key!');
      return;
    }
    
    // Validate key strength
    const keyValidation = validateKey(key);
    if (!keyValidation.isValid) {
      alert('Weak key! Suggestions: ' + keyValidation.suggestions.join(', '));
      return;
    }
    
    setLoading(true);
    try {
      let result;
      if (mode === 'encrypt') {
        result = await encryptText(text, key);
        setProcessedText(result);
        alert('Encryption successful!');
      } else {
        result = await decryptText(text, key);
        setProcessedText(result);
        alert('Decryption successful!');
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>🛡️ AES-256 Encrypt/Decrypt Utility</h2>
        <p>Secure your data with military-grade AES-256 encryption</p>
      </div>

      <div className="form-container">
        {/* Mode Toggle */}
        <div className="mode-toggle-section">
          <h3>Step 1: Select Operation</h3>
          <div className="mode-toggle">
            <button 
              className={`toggle-button ${mode === 'encrypt' ? 'active' : ''}`}
              onClick={() => handleChangeMode('encrypt')}
            >
              <span className="toggle-icon">🔒</span>
              <span className="toggle-text">Encrypt</span>
            </button>
            <button 
              className={`toggle-button ${mode === 'decrypt' ? 'active' : ''}`}
              onClick={() => handleChangeMode('decrypt')}
            >
              <span className="toggle-icon">🔓</span>
              <span className="toggle-text">Decrypt</span>
            </button>
          </div>
          <div className="mode-description">
            {mode === 'encrypt' ? (
              <p>🔐 Convert your plaintext into secure encrypted data</p>
            ) : (
              <p>🔓 Convert encrypted data back to readable plaintext</p>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="input-section">
          <h3>Step 2: Enter Text</h3>
          <textarea 
            placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter encrypted text to decrypt...'} 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="message-input"
          />
          <div className="char-count">
            {text.length} characters
          </div>
        </div>

        {/* Key Input */}
        <div className="input-section">
          <h3>Step 3: Security Key</h3>
          <input 
            type="password" 
            placeholder="Enter your AES-256 encryption key" 
            value={key} 
            onChange={(e) => setKey(e.target.value)}
            className="key-input"
          />
          <div className="key-hint">
            🔑 Use a strong, unique key for maximum security
          </div>
        </div>

        {/* Process Button */}
        <button 
          onClick={handleProcess} 
          disabled={loading || !text || !key}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              {mode === 'encrypt' ? 'Encrypting...' : 'Decrypting...'}
            </>
          ) : (
            <>
              {mode === 'encrypt' ? '🔒 Encrypt Data' : '🔓 Decrypt Data'}
            </>
          )}
        </button>
      </div>

      {/* Result Display */}
      {processedText && (
        <div className="result-container">
          <h3>
            {mode === 'encrypt' ? '✅ Data Successfully Encrypted!' : '✅ Data Successfully Decrypted!'}
          </h3>
          <div className="crypto-display">
            <div className="crypto-header">
              <span className="crypto-icon">
                {mode === 'encrypt' ? '🔐' : '🔓'}
              </span>
              <span className="crypto-label">
                {mode === 'encrypt' ? 'Encrypted Data:' : 'Decrypted Text:'}
              </span>
            </div>
            <div className="crypto-content">
              <div className="crypto-text">
                <code>{processedText}</code>
              </div>
              <div className="crypto-actions">
                <button 
                  className="copy-button"
                  onClick={() => {
                    navigator.clipboard.writeText(processedText);
                    alert('Text copied to clipboard!');
                  }}
                >
                  📋 Copy {mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'}
                </button>
                <button 
                  className="clear-button"
                  onClick={() => {
                    setProcessedText('');
                    setText('');
                    setKey('');
                  }}
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}