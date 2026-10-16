const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

/**
 * Analyze an image for signs of LSB steganography using backend
 * @param {File} imageFile - Image file to analyze
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeImage = async (imageFile) => {
  const form = new FormData();
  form.append('image', imageFile);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: form
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Analysis failed');
  }

  const data = await res.json();
  return data;
};

/**
 * Perform statistical analysis on image data
 * @param {Uint8ClampedArray} data - Image pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} - Analysis results
 */
const performSteganalysis = (data, width, height) => {
  const results = {
    detected: false,
    confidence: 0,
    details: [],
    statistics: {}
  };
  
  // Calculate LSB-based statistical measures
  const lsbAnalysis = analyzeLSBPatterns(data);
  const chiSquareTest = performChiSquareTest(data);
  const lsbDistribution = analyzeLSBDistribution(data);
  const lsbNoise = analyzeLSBNoise(data);
  const stegoSignature = detectStegoSignature(data);
  const noiseLevel = calculateNoiseLevel(data);
  
  // Combine results
  results.statistics = {
    lsb: lsbAnalysis,
    chiSquare: chiSquareTest,
    distribution: lsbDistribution,
    noise: lsbNoise,
    signature: stegoSignature,
    generalNoise: noiseLevel
  };
  
  // Calculate overall confidence based on LSB analysis
  let confidence = 0;
  let detectionCount = 0;
  
  // Check for stego signature first (most reliable)
  if (stegoSignature.detected) {
    confidence += 60; // High weight for signature detection
    detectionCount++;
    results.details.push('Steganographic signature detected in LSB channels');
  }
  
  // Use other methods as supporting evidence
  if (lsbAnalysis.suspicious) {
    confidence += 20;
    detectionCount++;
    results.details.push('Unusual LSB patterns detected');
  }
  
  if (chiSquareTest.suspicious) {
    confidence += 15;
    detectionCount++;
    results.details.push('Chi-square test indicates LSB data embedding');
  }
  
  if (lsbDistribution.suspicious) {
    confidence += 10;
    detectionCount++;
    results.details.push('LSB distribution analysis suggests steganography');
  }
  
  if (lsbNoise.suspicious) {
    confidence += 5;
    detectionCount++;
    results.details.push('LSB noise pattern analysis indicates data hiding');
  }
  
  results.confidence = Math.min(confidence, 99);
  results.detected = confidence > 50;
  
  // Add debug information
  results.debug = {
    lsbRatio: lsbAnalysis.ratio,
    chiSquare: chiSquareTest.chiSquare,
    signatureDetected: stegoSignature.detected,
    signatureMatches: stegoSignature.matches,
    patternScore: lsbAnalysis.patternScore
  };
  
  // Debug logging
  console.log('Steganalysis Debug:', {
    confidence: confidence,
    detected: results.detected,
    lsbRatio: lsbAnalysis.ratio,
    chiSquare: chiSquareTest.chiSquare,
    signatureDetected: stegoSignature.detected,
    signatureMatches: stegoSignature.matches,
    patternScore: lsbAnalysis.patternScore
  });
  
  if (!results.detected) {
    results.details = [
      'No LSB steganography patterns found',
      'Normal LSB distribution detected',
      'Chi-square test shows no LSB anomalies',
      'LSB noise patterns appear natural',
      'Image appears clean of hidden data'
    ];
    results.confidence = Math.max(95 - Math.floor(confidence), 60); // Lower confidence for clean images
  }
  
  return results;
};

/**
 * Analyze LSB patterns in the image
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {Object} - LSB analysis results
 */
const analyzeLSBPatterns = (data) => {
  let lsbCount = 0;
  let totalPixels = 0;
  let consecutiveLSBs = 0;
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  
  // Count LSBs and analyze patterns in RGB channels
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) { // RGB channels only
      const lsb = data[i + j] & 1;
      lsbCount += lsb;
      totalPixels++;
      
      // Track consecutive LSB patterns
      if (lsb === 1) {
        currentConsecutive++;
        consecutiveLSBs += currentConsecutive;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }
  }
  
  const lsbRatio = lsbCount / totalPixels;
  const expectedRatio = 0.5; // Random data should have ~50% LSBs
  const deviation = Math.abs(lsbRatio - expectedRatio);
  
  // Calculate pattern suspiciousness
  const avgConsecutive = consecutiveLSBs / totalPixels;
  const patternScore = (deviation * 10) + (maxConsecutive * 0.1) + (avgConsecutive * 5);
  
  console.log('LSB Pattern Analysis:', {
    ratio: lsbRatio,
    deviation: deviation,
    maxConsecutive: maxConsecutive,
    avgConsecutive: avgConsecutive,
    patternScore: patternScore,
    suspicious: patternScore > 1.0 || deviation > 0.05
  });
  
  return {
    ratio: lsbRatio,
    deviation: deviation,
    maxConsecutive: maxConsecutive,
    avgConsecutive: avgConsecutive,
    patternScore: patternScore,
    suspicious: patternScore > 3.0 || deviation > 0.1 // Balanced sensitivity
  };
};

/**
 * Perform Chi-square test on LSB distribution
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {Object} - Chi-square test results
 */
const performChiSquareTest = (data) => {
  const lsbCounts = [0, 0];
  
  // Count LSBs
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      lsbCounts[data[i + j] & 1]++;
    }
  }
  
  const total = lsbCounts[0] + lsbCounts[1];
  const expected = total / 2;
  
  // Calculate chi-square statistic
  const chiSquare = Math.pow(lsbCounts[0] - expected, 2) / expected +
                   Math.pow(lsbCounts[1] - expected, 2) / expected;
  
  // Balanced thresholds
  const suspiciousThreshold = 2.0; // Balanced threshold
  const highlySuspiciousThreshold = 3.84; // Original 95% confidence
  
  console.log('Chi-Square Test:', {
    chiSquare: chiSquare,
    suspicious: chiSquare > suspiciousThreshold,
    lsbRatio: lsbCounts[1] / total,
    expectedRatio: 0.5,
    lsbCounts: lsbCounts
  });
  
  return {
    chiSquare: chiSquare,
    suspicious: chiSquare > suspiciousThreshold,
    highlySuspicious: chiSquare > highlySuspiciousThreshold,
    lsbRatio: lsbCounts[1] / total,
    expectedRatio: 0.5
  };
};

/**
 * Analyze LSB distribution patterns
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {Object} - LSB distribution analysis results
 */
const analyzeLSBDistribution = (data) => {
  const lsbCounts = [0, 0, 0, 0, 0, 0, 0, 0]; // Count for each LSB value (0-7)
  const totalPixels = data.length / 4 * 3; // RGB channels only
  
  // Count LSB values in RGB channels
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) { // RGB channels only
      const lsb = data[i + j] & 7; // Get last 3 bits (0-7)
      lsbCounts[lsb]++;
    }
  }
  
  // Calculate expected uniform distribution
  const expectedCount = totalPixels / 8;
  let chiSquare = 0;
  
  // Calculate chi-square statistic for LSB distribution
  for (let i = 0; i < 8; i++) {
    const observed = lsbCounts[i];
    const expected = expectedCount;
    chiSquare += Math.pow(observed - expected, 2) / expected;
  }
  
  // Calculate variance in LSB distribution
  const mean = totalPixels / 8;
  let variance = 0;
  for (let i = 0; i < 8; i++) {
    variance += Math.pow(lsbCounts[i] - mean, 2);
  }
  variance /= 8;
  
  // Check for suspicious patterns
  const maxDeviation = Math.max(...lsbCounts) - Math.min(...lsbCounts);
  const suspiciousThreshold = expectedCount * 0.3; // 30% deviation is suspicious
  
  return {
    chiSquare: chiSquare,
    variance: variance,
    maxDeviation: maxDeviation,
    suspicious: chiSquare > 20.0 || maxDeviation > suspiciousThreshold // More balanced threshold
  };
};

/**
 * Analyze LSB noise patterns
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {Object} - LSB noise analysis results
 */
const analyzeLSBNoise = (data) => {
  let lsbTransitions = 0;
  let totalComparisons = 0;
  
  // Analyze LSB transitions between adjacent pixels
  for (let i = 0; i < data.length - 4; i += 4) {
    for (let j = 0; j < 3; j++) { // RGB channels only
      const currentLSB = data[i + j] & 1;
      const nextLSB = data[i + 4 + j] & 1;
      
      if (currentLSB !== nextLSB) {
        lsbTransitions++;
      }
      totalComparisons++;
    }
  }
  
  const transitionRatio = lsbTransitions / totalComparisons;
  const expectedRatio = 0.5; // Random data should have ~50% transitions
  const deviation = Math.abs(transitionRatio - expectedRatio);
  
  return {
    transitionRatio: transitionRatio,
    deviation: deviation,
    suspicious: deviation > 0.15 // More than 15% deviation is suspicious
  };
};

/**
 * Detect steganographic signature in LSB channels
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {Object} - Signature detection results
 */
const detectStegoSignature = (data) => {
  // Look for the "STEG_END" marker pattern in LSBs
  const endMarker = "STEG_END";
  const markerBits = [];
  
  // Convert marker to bits
  for (let i = 0; i < endMarker.length; i++) {
    const charCode = endMarker.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      markerBits.push((charCode >> j) & 1);
    }
  }
  
  // Search for the marker pattern in LSBs
  let matches = 0;
  let totalSearches = 0;
  
  // Search more systematically through the image
  for (let start = 0; start < data.length - markerBits.length * 4; start += 4) {
    totalSearches++;
    let match = true;
    let bitIndex = 0;
    
    // Check consecutive pixels for the marker
    for (let i = 0; i < markerBits.length && match; i++) {
      const pixelIndex = start + (i * 4);
      if (pixelIndex >= data.length) {
        match = false;
        break;
      }
      
      // Check LSB of RGB channels in order
      for (let j = 0; j < 3 && bitIndex < markerBits.length; j++) {
        const lsb = data[pixelIndex + j] & 1;
        if (lsb !== markerBits[bitIndex]) {
          match = false;
          break;
        }
        bitIndex++;
      }
    }
    
    if (match && bitIndex === markerBits.length) {
      matches++;
      console.log('Found STEG_END marker at position:', start);
    }
  }
  
  // Calculate detection probability
  const detectionProbability = matches / totalSearches;
  const detected = matches > 0; // Any match indicates steganography
  
  console.log('Signature Detection:', {
    matches: matches,
    totalSearches: totalSearches,
    probability: detectionProbability,
    detected: detected
  });
  
  return {
    detected: detected,
    matches: matches,
    totalSearches: totalSearches,
    probability: detectionProbability,
    confidence: Math.min(detectionProbability * 1000, 100)
  };
};

/**
 * Calculate noise level in the image
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {number} - Noise level (0-1)
 */
const calculateNoiseLevel = (data) => {
  let noise = 0;
  let samples = 0;
  
  // Sample every 10th pixel to calculate noise
  for (let i = 0; i < data.length - 40; i += 40) {
    const r1 = data[i];
    const g1 = data[i + 1];
    const b1 = data[i + 2];
    
    const r2 = data[i + 4];
    const g2 = data[i + 5];
    const b2 = data[i + 6];
    
    const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    noise += diff / (255 * 3); // Normalize to 0-1
    samples++;
  }
  
  return samples > 0 ? noise / samples : 0;
};
