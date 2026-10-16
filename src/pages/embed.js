import React,{useState} from 'react';
import { embedMessage } from '../utils/steganography';

export default function Embed() {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stegoImage, setStegoImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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

  const handleEmbed = async () => {
    if (!file || !message || !key) {
      alert('Please upload an image, enter a message, and provide the key!');
      return;
    }

    setLoading(true);
    console.log('Sending data to backend for embedding...');
    try {
      const result = await embedMessage(file, message, key);
      setStegoImage(result.stegoImageBase64);
      alert('Message embedded successfully!');
    } catch (error) {
      console.error('Embedding error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>🖼️ Embed Hidden Message</h2>
        <p>Hide secret information inside a PNG image using your security key</p>
      </div>

      <div className="form-container">
        {/* File Upload Section */}
        <div className="upload-section">
          <h3>Step 1: Upload Cover Image</h3>
          <div
            className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">📤</div>
              <p className="upload-text">
                {file ? file.name : 'Drag & drop your PNG here or click to browse'}
              </p>
              <input
                type="file"
                accept="image/png"
                onChange={handleFileChange}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-button">
                Choose Image
              </label>
            </div>
          </div>
        </div>

        {/* Key Input */}
        <div className="input-section">
          <h3>Step 2: Enter Security Key</h3>
          <input
            type="password"
            placeholder="Enter a secure key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="key-input"
          />
          <div className="key-hint">🔑 This key will be required to extract the message</div>
        </div>

        {/* Message Input */}
        <div className="input-section">
          <h3>Step 3: Enter Secret Message</h3>
          <textarea
            placeholder="Type your secret message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="message-textarea"
            rows={5}
          />
        </div>

        {/* Embed Button */}
        <button
          onClick={handleEmbed}
          disabled={loading || !file || !key || !message}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Embedding Message...
            </>
          ) : (
            '🧩 Embed Hidden Message'
          )}
        </button>
      </div>

      {/* Result Display */}
      {stegoImage && (
        <div className="result-container">
          <h3>✅ Message Successfully Embedded!</h3>
          <div className="image-display">
            <img src={stegoImage} alt="Stego-image with hidden message" />
          </div>
          <div className="message-actions">
            <a
              className="download-button"
              href={stegoImage}
              download="stego.png"
            >
              💾 Download Stego-Image
            </a>
            <button
              className="clear-button"
              onClick={() => {
                setStegoImage(null);
                setFile(null);
                setKey('');
                setMessage('');
              }}
            >
              🗑️ Clear & Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}