// ── Key helpers ──────────────────────────────────────────────────────────────
const getKey = id => localStorage.getItem(id) || '';

function saveKeys() {
  localStorage.setItem('cohereKey', document.getElementById('cohereKey').value.trim());
  localStorage.setItem('hfKey', document.getElementById('hfKey').value.trim());
  const msg = document.getElementById('saveMsg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 2500);
}

function loadKeys() {
  document.getElementById('cohereKey').value = getKey('cohereKey');
  document.getElementById('hfKey').value = getKey('hfKey');
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  event.currentTarget.classList.add('active');
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function showSpinner(msg) {
  document.getElementById('spinnerMsg').textContent = msg || 'Processing…';
  document.getElementById('spinner').style.display = 'flex';
}
function hideSpinner() { document.getElementById('spinner').style.display = 'none'; }

// ── TEXT WORKFLOW ─────────────────────────────────────────────────────────────
let approvedPrompt = '';

async function enhancePrompt() {
  const raw = document.getElementById('userPrompt').value.trim();
  if (!raw) return alert('Please enter a prompt first.');
  const key = getKey('cohereKey');
  if (!key) return alert('Add your Cohere API key in ⚙️ Settings first.');

  showSpinner('Enhancing prompt with Cohere…');
  document.getElementById('btnEnhance').disabled = true;

  try {
    const res = await fetch('https://api.cohere.com/v1/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'command',
        prompt: `You are a creative prompt engineer. Rewrite the following image generation prompt to be more vivid, detailed, and visually descriptive. Return ONLY the improved prompt, no explanation.\n\nOriginal: ${raw}\n\nImproved:`,
        max_tokens: 200,
        temperature: 0.8
      })
    });
    if (!res.ok) throw new Error(`Cohere error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const enhanced = data.generations[0].text.trim();
    approvedPrompt = enhanced;
    document.getElementById('enhancedPromptBox').textContent = enhanced;
    document.getElementById('enhanceCard').style.display = 'block';
    document.getElementById('textImageCard').style.display = 'none';
  } catch (e) {
    alert('Cohere API error: ' + e.message);
  } finally {
    hideSpinner();
    document.getElementById('btnEnhance').disabled = false;
  }
}

function rejectPrompt() {
  document.getElementById('enhanceCard').style.display = 'none';
  document.getElementById('userPrompt').focus();
}

async function approvePrompt() {
  await generateImageFromPrompt(approvedPrompt, 'textImageResult', 'textImageCard');
}

// ── IMAGE WORKFLOW ────────────────────────────────────────────────────────────
let uploadedImageBase64 = '';

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    uploadedImageBase64 = ev.target.result; // full data URL
    const img = document.getElementById('previewImg');
    img.src = uploadedImageBase64;
    img.style.display = 'block';
    document.getElementById('uploadLabel').style.display = 'none';
    document.getElementById('btnAnalyze').style.display = 'inline-block';
    document.getElementById('analysisCard').style.display = 'none';
    document.getElementById('variationCard').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function analyzeImage() {
  if (!uploadedImageBase64) return alert('Upload an image first.');
  const key = getKey('hfKey');
  if (!key) return alert('Add your Hugging Face token in ⚙️ Settings first.');

  showSpinner('Analyzing image with BLIP…');
  document.getElementById('btnAnalyze').disabled = true;

  try {
    // Convert data URL to blob
    const blob = dataURLtoBlob(uploadedImageBase64);
    const res = await fetch(
      'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
      { method: 'POST', headers: { 'Authorization': `Bearer ${key}` }, body: blob }
    );
    if (!res.ok) throw new Error(`HF BLIP error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const caption = Array.isArray(data) ? data[0].generated_text : data.generated_text || JSON.stringify(data);
    document.getElementById('analysisResult').textContent = caption;
    document.getElementById('analysisCard').style.display = 'block';
    document.getElementById('variationCard').style.display = 'none';
    // Store caption for variation generation
    window._imageCaption = caption;
  } catch (e) {
    alert('HF BLIP error: ' + e.message);
  } finally {
    hideSpinner();
    document.getElementById('btnAnalyze').disabled = false;
  }
}

async function generateVariation() {
  const caption = window._imageCaption;
  if (!caption) return;
  const variationPrompt = `${caption}, high quality, detailed, artistic variation, 4k`;
  await generateImageFromPrompt(variationPrompt, 'variationResult', 'variationCard');
}

// ── Shared: HF text-to-image ──────────────────────────────────────────────────
async function generateImageFromPrompt(prompt, resultDivId, cardId) {
  const key = getKey('hfKey');
  if (!key) return alert('Add your Hugging Face token in ⚙️ Settings first.');

  showSpinner('Generating image with FLUX…');

  try {
    const res = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt })
      }
    );
    if (!res.ok) throw new Error(`HF FLUX error ${res.status}: ${await res.text()}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const div = document.getElementById(resultDivId);
    div.innerHTML = `<img src="${url}" alt="Generated image"/>`;
    document.getElementById(cardId).style.display = 'block';
    document.getElementById(cardId).scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    alert('Image generation error: ' + e.message);
  } finally {
    hideSpinner();
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────
function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// Drag & drop support
const uploadArea = document.getElementById('uploadArea');
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--accent)'; });
uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById('fileInput').files = dt.files;
    handleImageUpload({ target: { files: [file] } });
  }
});

// Init
loadKeys();
