import React, { useState } from 'react';
import { getEnhancedPrompt, generateImage, hasKey } from '../utils/apiHelpers';
import CertificateCard from './CertificateCard';

const ERR = {
  NO_COHERE_KEY: '🔑 Cohere key not saved. Go to ⚙️ API Keys tab, paste your key and click Save Keys.',
  NO_HF_KEY:     '🔑 Hugging Face token not saved. Go to ⚙️ API Keys tab, paste your token and click Save Keys.',
};

export default function WorkflowText({ setSpinner, switchToSettings }) {
  const [userPrompt, setUserPrompt] = useState('');
  const [enhancedPrompt, setEnhanced] = useState('');
  const [editedPrompt, setEdited]   = useState('');
  const [imageUrl, setImageUrl]     = useState('');
  const [status, setStatus]         = useState('');
  const [error, setError]           = useState('');

  const fmt = (msg) => ERR[msg] || msg;

  const handleEnhance = async () => {
    if (!userPrompt.trim()) return setError('Please enter a prompt first.');
    setError(''); setImageUrl(''); setEnhanced('');
    setSpinner('Enhancing prompt with Cohere…');
    try {
      const result = await getEnhancedPrompt(userPrompt);
      setEnhanced(result); setEdited(result); setStatus('enhanced');
    } catch (e) { setError(fmt(e.message)); }
    finally { setSpinner(''); }
  };

  const handleGenerate = async () => {
    if (!editedPrompt.trim()) return;
    setError(''); setImageUrl('');
    setSpinner('Generating image with FLUX.1-schnell…');
    try {
      const url = await generateImage(editedPrompt);
      setImageUrl(url); setStatus('done');
    } catch (e) { setError(fmt(e.message)); }
    finally { setSpinner(''); }
  };

  const handleReset = () => {
    setUserPrompt(''); setEnhanced(''); setEdited('');
    setImageUrl(''); setStatus(''); setError('');
  };

  return (
    <div className="workflow">
      <div className="card">
        <h2><span className="step-badge">1</span> Enter Your Prompt</h2>
        {!hasKey.cohere() && (
          <div className="key-warning">
            🔑 Cohere key not set.{' '}
            <button className="link-btn" onClick={switchToSettings}>Go to API Keys →</button>
          </div>
        )}
        <textarea rows={4} placeholder="e.g. A futuristic city at sunset with flying cars…"
          value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} />
        {error && <p className="error-msg">⚠️ {error}</p>}
        <div className="row">
          <button onClick={handleEnhance} disabled={!userPrompt.trim()}>✨ Enhance Prompt</button>
          {status && <button className="secondary" onClick={handleReset}>↺ Reset</button>}
        </div>
      </div>

      {(status === 'enhanced' || status === 'done') && (
        <div className="card">
          <h2><span className="step-badge">2</span> Review & Edit Enhanced Prompt</h2>
          <p className="hint">Edit the prompt below, then approve to generate your image.</p>
          <textarea rows={5} value={editedPrompt} onChange={(e) => setEdited(e.target.value)} />
          <div className="row">
            <button onClick={handleGenerate} disabled={!editedPrompt.trim()}>🎨 Generate Image</button>
            <button className="secondary" onClick={() => setEdited(enhancedPrompt)}>↺ Restore</button>
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="card">
          <h2><span className="step-badge">3</span> Generated Image</h2>
          <CertificateCard src={imageUrl} originalPrompt={userPrompt} enhancedPrompt={editedPrompt} label="Enhanced Prompt" />
        </div>
      )}
    </div>
  );
}
