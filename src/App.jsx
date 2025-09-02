import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Layout from './components/Layout';
import Home from './pages/Home';
import ImageClassification from './pages/ImageClassification';
import StyleTransfer from './pages/StyleTransfer';
import ObjectDetection from './pages/ObjectDetection';
import TextGeneration from './pages/TextGeneration';
import PerformanceDemo from './pages/PerformanceDemo';
import WebGPUDemo from './pages/WebGPUDemo';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/image-classification" element={<ImageClassification />} />
            <Route path="/style-transfer" element={<StyleTransfer />} />
            <Route path="/object-detection" element={<ObjectDetection />} />
            <Route path="/text-generation" element={<TextGeneration />} />
            <Route path="/performance-demo" element={<PerformanceDemo />} />
            <Route path="/webgpu-demo" element={<WebGPUDemo />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </Router>
  );
}

export default App; 