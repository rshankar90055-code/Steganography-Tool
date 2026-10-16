import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Steganography</span> Tool
          </h1>
          <p className="hero-subtitle">
            Advanced dual security solution combining AES-256 encryption with steganography techniques
          </p>
          <p className="hero-description">
            Hide sensitive information within images using cutting-edge steganography methods, 
            protected by military-grade encryption for maximum security.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Embed Messages</h3>
          <p>Hide secret messages inside PNG images using advanced LSB steganography techniques.</p>
          <Link to="/embed" className="feature-link">Start Embedding →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Extract Data</h3>
          <p>Retrieve hidden messages from stego-images using your secure key.</p>
          <Link to="/extract" className="feature-link">Extract Now →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Encrypt/Decrypt</h3>
          <p>Secure your data with AES-256 encryption, the gold standard in cryptography.</p>
          <Link to="/encrypt" className="feature-link">Secure Data →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔬</div>
          <h3>Steganalysis</h3>
          <p>Analyze images to detect hidden steganographic content and security threats.</p>
          <Link to="/detect" className="feature-link">Analyze Image →</Link>
        </div>
      </div>

      {/* Security Info */}
      <div className="security-info">
        <h2>Why Choose Our Tool?</h2>
        <div className="security-features">
          <div className="security-item">
            <div className="security-icon">🔒</div>
            <div>
              <h4>AES-256 Encryption</h4>
              <p>Military-grade encryption ensures your data remains secure</p>
            </div>
          </div>
          <div className="security-item">
            <div className="security-icon">👁️</div>
            <div>
              <h4>Invisible Hiding</h4>
              <p>Messages are completely hidden within image pixels</p>
            </div>
          </div>
          <div className="security-item">
            <div className="security-icon">⚡</div>
            <div>
              <h4>Fast Processing</h4>
              <p>Quick embedding and extraction with minimal image quality loss</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}