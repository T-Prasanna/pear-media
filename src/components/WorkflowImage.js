import React, { useState, useRef } from 'react';
import { analyzeImage, generateImage, fileToBase64, buildVariationPrompt, hasKey } from '../utils/apiHelpers';
import CertificateCard from './CertificateCard';

const ERR = {
  NO_COHERE_KEY: '🔑 Cohere key not saved. Go to ⚙️ API Keys tab.',
  NO_HF_KEY:     '🔑 Hugging Face token not saved. Go to ⚙️ API Keys tab.',
};

export default function WorkflowImage({ setSpinner, switchToSettings }) {
  const [preview, setPreview]        = useState('');
  const [analysis, setAnalysis]      = useState(null);
  const [variationUrl, setVariation] = useState('');
  const [dragOver, setDragOver]      = useState(false);
  const [error, setError]            = useState('');
  const fileRef = useRef();

  const fmt = (msg) => ERR[msg] || msg;

  const loadFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return setError('Please upload a valid image file.');
    setError(''); setAnalysis(null); setVariation('');
    setPreview(await fileToBase64(file));
  };

  const handleAnalyze = async () => {
    setError('');
    setSpinner('Extracting colors & analyzing with Cohere…');
    try {
      setAnalysis(await analyzeImage(preview));
    } catch (e) { setError(fmt(e.message)); }
    finally { setSpinner(''); }
  };

  const handleVariation = async () => {
    setError(''); setVariation('');
    setSpinner('Generating variation… (may take 20–40s)');
    try {
      setVariation(await generateImage(buildVariationPrompt(analysis)));
    } catch (e) { setError(fmt(e.message)); }
    finally { setSpinner(''); }
  };

  return (
    <div className="workflow">
      <div className="card">
        <h2><span className="step-badge">1</span> Upload an Image</h2>
        {!hasKey.cohere() && (
          <div className="key-warning">
            🔑 Cohere key not set.{' '}
            <button className="link-btn" onClick={switchToSettings}>Go to API Keys →</button>
          </div>
        )}
        <div className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]); }}>
          {preview ? <img src={preview} alt="preview" /> : <span>📁 Click to upload or drag & drop</span>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => loadFile(e.target.files[0])} />
        {error && <p className="error-msg">⚠️ {error}</p>}
        <div className="row">
          {preview && <button onClick={handleAnalyze}>🔍 Analyze Image</button>}
          {preview && <button className="secondary" onClick={() => { setPreview(''); setAnalysis(null); setVariation(''); setError(''); }}>↺ Reset</button>}
        </div>
      </div>

      {analysis && (
        <div className="card">
          <h2><span className="step-badge">2</span> Image Analysis</h2>
          <div className="analysis-grid">
            <div className="analysis-item"><span className="label">Subject</span><span>{analysis.subject}</span></div>
            <div className="analysis-item"><span className="label">Lighting</span><span>{analysis.lighting}</span></div>
            <div className="analysis-item"><span className="label">Style</span><span>{analysis.artisticStyle}</span></div>
            <div className="analysis-item">
              <span className="label">Color Palette</span>
              <div className="color-swatches">
                {analysis.colorPalette.map((c, i) => (
                  <span key={i} className="swatch" style={{ background: c }} title={c} />
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleVariation}>🎨 Generate Variation</button>
        </div>
      )}

      {variationUrl && (
        <div className="card">
          <h2><span className="step-badge">3</span> Generated Variation</h2>
          <CertificateCard src={variationUrl} enhancedPrompt={buildVariationPrompt(analysis)} label="Variation Prompt" />
        </div>
      )}
    </div>
  );
}
