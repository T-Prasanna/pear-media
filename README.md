# 🍐 Pear Media – AI Creative Studio

A React + Vite web app that integrates multiple free AI APIs for text prompt enhancement and image generation/variation.

**Live Demo:** _[your-vercel-url]_  
**GitHub:** _[your-repo-url]_

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Custom CSS (indigo/violet dark theme) |
| Text NLP | Cohere `command-r-plus` |
| Image Analysis | Hugging Face BLIP (`blip-image-captioning-large`) |
| Image Generation | Hugging Face FLUX.1-schnell |

---

## Features

- **Workflow A – Creative Studio (Text → Image)**
  1. Enter a simple text prompt
  2. Cohere NLP enhances it into a vivid, detailed prompt
  3. Edit/approve the enhanced prompt
  4. FLUX.1-schnell generates the final image

- **Workflow B – Style Lab (Image → Variation)**
  1. Upload an image (click or drag & drop)
  2. BLIP analyzes subject, lighting, style, and color palette
  3. FLUX.1-schnell generates a stylistic variation

- API keys stored in `localStorage` — never sent to any server other than the respective API
- Download button on every generated image
- Responsive design (mobile-friendly)
- Spinner with status messages during API calls

---

## Project Structure

```
pearmedia-ai-prototype/
├── .env                        # Secret API keys (never commit)
├── .gitignore
├── README.md
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # State management & tab layout
    ├── index.css               # Global styles
    ├── components/
    │   ├── Navbar.jsx          # Logo & header
    │   ├── WorkflowText.jsx    # Text workflow (input → enhance → approve → generate)
    │   ├── WorkflowImage.jsx   # Image workflow (upload → analyze → variation)
    │   ├── ImageCard.jsx       # Reusable image result display
    │   └── Spinner.jsx         # Loading overlay
    └── utils/
        ├── apiHelpers.js       # All fetch() logic organized by API
        └── constants.js        # System prompts and tab config
```

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- npm

### Steps

```bash
git clone https://github.com/<your-username>/pearmedia-ai-prototype.git
cd pearmedia-ai-prototype
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### API Key Setup

**Option A – In the app UI (recommended):**
1. Click **⚙️ API Keys** tab
2. Paste your Cohere key and Hugging Face token
3. Click **Save Keys** — stored in `localStorage`

**Option B – Via `.env` file:**
```
VITE_COHEREKEY=your_cohere_key
VITE_HFKEY=your_hf_token
```

### Getting Free API Keys

| Service | URL | Free Tier |
|---------|-----|-----------|
| Cohere | [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys) | 1,000 calls/month |
| Hugging Face | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Free inference API |

---

## Deployment (Vercel)

```bash
npm run build
```

1. Push repo to GitHub (ensure `.env` is in `.gitignore`)
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in **Vercel Dashboard → Settings → Environment Variables**:
   - `VITE_COHEREKEY`
   - `VITE_HFKEY`
4. Deploy — Vercel auto-detects Vite

---

## Screenshots

> _(Add screenshots here)_

---

## Submission

1. **GitHub Repository:** https://github.com/your-username/pearmedia-ai-prototype
2. **Deployed App:** https://your-app.vercel.app
3. **Screen Recording:** https://drive.google.com/file/d/your-link/view
