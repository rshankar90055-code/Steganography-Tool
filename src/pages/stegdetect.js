import React, { useState } from 'react';
import { analyzeImage } from '../utils/steganalysis';

export default function StegDetect() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
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

  const handleDetect = async () => {
    if (!file) {
      alert('Please upload an image to analyze!');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeImage(file);
      
      setResult(result.detected ? 'DETECTED' : 'CLEAN');
      setAnalysisData({
        status: result.detected ? 'detected' : 'clean',
        confidence: result.confidence,
        message: result.detected ? 
          'Hidden data detected! Statistical anomalies found in the image.' : 
          'No hidden data detected. The image appears clean.',
        details: result.details
      });
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>🔬 LSB Steganalysis: Detect Hidden Data</h2>
        <p>Advanced LSB (Least Significant Bit) analysis to detect steganographic content in images</p>
      </div>

      <div className="form-container">
        {/* File Upload Section */}
        <div className="upload-section">
          <h3>Step 1: Upload Image for Analysis</h3>
          <div 
            className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <div className="upload-icon">🔬</div>
              <p className="upload-text">
                {file ? file.name : 'Drag & drop any image here or click to browse'}
              </p>
              <input 
                type="file" 
                accept="image/*" 
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

        {/* Analysis Button */}
        <button 
          onClick={handleDetect} 
          disabled={loading || !file}
          className={`submit-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Analyzing Image...
            </>
          ) : (
            '🔍 Analyze for Hidden Data'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="result-container">
          <div className={`analysis-header ${analysisData.status}`}>
            <div className="analysis-icon">
              {analysisData.status === 'detected' ? '⚠️' : '✅'}
            </div>
            <div className="analysis-title">
              <h3>
                {analysisData.status === 'detected' ? 'Hidden Data DETECTED!' : 'Image Analysis Complete'}
              </h3>
              <p className="analysis-message">{analysisData.message}</p>
            </div>
          </div>

          <div className="analysis-details">
            <div className="confidence-meter">
              <div className="confidence-label">
                <span>Confidence Level</span>
                <span className="confidence-value">{analysisData.confidence}%</span>
              </div>
              <div className="confidence-bar">
                <div 
                  className={`confidence-fill ${analysisData.status}`}
                  style={{ width: `${analysisData.confidence}%` }}
                ></div>
              </div>
            </div>

            <div className="analysis-findings">
              <h4>Analysis Findings:</h4>
              <ul className="findings-list">
                {analysisData.details.map((detail, index) => (
                  <li key={index} className="finding-item">
                    <span className="finding-icon">
                      {analysisData.status === 'detected' ? '🔍' : '✓'}
                    </span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="analysis-actions">
              <button 
                className="analyze-again-button"
                onClick={() => {
                  setResult('');
                  setAnalysisData(null);
                  setFile(null);
                }}
              >
                🔄 Analyze Another Image
              </button>
              <button 
                className="info-button"
                onClick={() => alert('LSB Steganalysis uses statistical analysis to detect patterns that indicate hidden data in images. Our analysis focuses on LSB (Least Significant Bit) patterns, chi-square tests, distribution analysis, and noise patterns to identify steganographic content.')}
              >
                ℹ️ Learn More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}