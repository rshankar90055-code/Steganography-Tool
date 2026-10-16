import React, { useState } from 'react';
import { extractMessage } from '../utils/steganography';

export default function Extract() {
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedMessage, setExtractedMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file || !key) {
      alert('Please upload a stego image and provide the key!');
      return;
    }
    
    setLoading(true);
    try {
      const result = await extractMessage(file, key);
      setExtractedMessage(result.message);
      alert('Message extracted successfully!');
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>🔍 Extract Hidden Message</h2>
        <p>Retrieve secret information from stego-images using your security key</p>
      </div>

      <div className="form-container">
        {/* File Upload Section */}
        <div className="upload-section">
          <h3>Step 1: Upload Stego-Image</h3>
          <div 
            className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">🔍</div>
              <p className="upload-text">
                {file ? file.name : 'Drag & drop your stego-image here or click to browse'}
              </p>
              <input 
                type="file" 
                accept="image/png" 
                onChange={handleFileChange}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-button">
                Choose Stego-Image
              </label>
            </div>
          </div>
        </div>

        {/* Key Input */}
        <div className="input-section">
          <h3>Step 2: Enter Security Key</h3>
          <input 
            type="password" 
            placeholder="Enter the secret key used for embedding" 
            value={key} 
            onChange={(e) => setKey(e.target.value)}
            className="key-input"
          />
          <div className="key-hint">
            🔑 Use the same key that was used to embed the message
          </div>
        </div>

        {/* Extract Button */}
        <button 
          onClick={handleExtract} 
          disabled={loading || !file || !key}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Extracting Message...
            </>
          ) : (
            '🔓 Extract Hidden Message'
          )}
        </button>
      </div>

      {/* Result Display */}
      {extractedMessage && (
        <div className="result-container">
          <h3>✅ Message Successfully Extracted!</h3>
          <div className="message-display">
            <div className="message-header">
              <span className="message-icon">📝</span>
              <span className="message-label">Hidden Message:</span>
            </div>
            <div className="message-content">
              <p>{extractedMessage}</p>
            </div>
            <div className="message-actions">
              <button 
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(extractedMessage);
                  alert('Message copied to clipboard!');
                }}
              >
                📋 Copy Message
              </button>
              <button 
                className="clear-button"
                onClick={() => {
                  setExtractedMessage('');
                  setFile(null);
                  setKey('');
                }}
              >
                🗑️ Clear & Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}