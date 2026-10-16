import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Embed from './pages/embed';
import Extract from './pages/extract';
import EncryptDecrypt from './pages/encrydecrypt';
import StegDetect from './pages/stegdetect'; 
import './App.css';

function App(){
  return(
    <Router><div className="navbar">
      <Link to="/">Home</Link>
      <Link to="/embed">Embed</Link>
      <Link to="/extract">Extract</Link>
      <Link to="/detect">Detect</Link>
      <Link to="/encrypt">Encrypt/Decrypt</Link></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/embed" element={<Embed />} />
        <Route path="/extract" element={<Extract />} />
        <Route path="/detect" element={<StegDetect />} />
        <Route path="/encrypt" element={<EncryptDecrypt />} /></Routes></Router>
  );
}
export default App;