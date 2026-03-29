import React, { useState, useEffect } from 'react';

const mask = (v) => v.length > 8 ? `${v.slice(0, 4)}${'•'.repeat(v.length - 8)}${v.slice(-4)}` : '•'.repeat(v.length);

export default function Settings() {
  const [cohereInput, setCohereInput] = useState('');
  const [hfInput, setHfInput]         = useState('');
  const [status, setStatus]           = useState('');
  const [stored, setStored]           = useState({ cohere: '', hf: '' });

  const refresh = () => setStored({
    cohere: (localStorage.getItem('cohereKey') || '').trim(),
    hf:     (localStorage.getItem('hfKey')     || '').trim(),
  });

  useEffect(() => { refresh(); }, []);

  const handleSave = () => {
    const ck = cohereInput.trim();
    const hk = hfInput.trim();
    try {
      if (ck) localStorage.setItem('cohereKey', ck);
      if (hk) localStorage.setItem('hfKey', hk);
      refresh();
      setStatus('saved');
    } catch (e) { setStatus('error:' + e.message); }
    setTimeout(() => setStatus(''), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem('cohereKey');
    localStorage.removeItem('hfKey');
    setCohereInput(''); setHfInput('');
    refresh(); setStatus('cleared');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div className="workflow">
      <div className="card">
        <h2>API Keys Configuration</h2>
        <p className="hint">Keys are stored in your browser's localStorage only.</p>

        <div className="stored-status">
          <div className={stored.cohere ? 'status-row ok' : 'status-row missing'}>
            <span>{stored.cohere ? '🟢' : '🔴'} Cohere key:</span>
            <code>{stored.cohere ? mask(stored.cohere) : 'not saved'}</code>
          </div>
          <div className={stored.hf ? 'status-row ok' : 'status-row missing'}>
            <span>{stored.hf ? '🟢' : '🔴'} HF token:</span>
            <code>{stored.hf ? mask(stored.hf) : 'not saved'}</code>
          </div>
        </div>

        <label>Cohere API Key <a href="https://dashboard.cohere.com/api-keys" target="_blank" rel="noreferrer">(get free key ↗)</a></label>
        <input type="text" placeholder="Paste Cohere key here…" value={cohereInput}
          onChange={(e) => setCohereInput(e.target.value)} autoComplete="off" spellCheck={false} />

        <label>Hugging Face Token <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer">(get free token ↗)</a></label>
        <input type="text" placeholder="Paste hf_… token here…" value={hfInput}
          onChange={(e) => setHfInput(e.target.value)} autoComplete="off" spellCheck={false} />

        <div className="row" style={{ marginTop: '4px' }}>
          <button onClick={handleSave} disabled={!cohereInput.trim() && !hfInput.trim()}>💾 Save Keys</button>
          <button className="secondary" onClick={handleClear}>🗑 Clear</button>
        </div>
        {status === 'saved'   && <p className="success-msg">✅ Keys saved! Status above should show 🟢</p>}
        {status === 'cleared' && <p className="success-msg">🗑 Keys cleared.</p>}
        {status.startsWith('error') && <p className="error-msg">❌ {status.slice(6)}</p>}
      </div>

      <div className="card">
        <h2>APIs Used</h2>
        <ul className="api-list">
          <li><strong>Cohere</strong> <span className="badge">Text NLP</span><p>Prompt enhancement via <code>command-r-plus</code></p></li>
          <li><strong>HF BLIP</strong> <span className="badge">Vision</span><p>Image captioning via <code>blip-image-captioning-large</code></p></li>
          <li><strong>HF FLUX.1-schnell</strong> <span className="badge">Image Gen</span><p>Text-to-image via <code>FLUX.1-schnell</code></p></li>
        </ul>
      </div>
    </div>
  );
}
