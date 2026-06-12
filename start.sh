#!/bin/bash
# ─── Raqamli Bozor Dashboard – Quick Start ───────────────────────────────
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     Raqamli Bozor Dashboard – Start          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Build Frontend ─────────────────────────────────────────────────────
echo "▶ Frontend build boshlandi..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run build
echo "  ✓ Frontend build tayyor → frontend/dist/"

# ── 2. Start Backend (serves frontend + API) ──────────────────────────────
echo "▶ Backend ishga tushirilmoqda (port 8000)..."
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt -q

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "  ✓ .env fayli yaratildi (backend/.env)"
fi

echo ""
echo "✅ Tayyor!"
echo "   Dashboard:  http://localhost:8000"
echo "   API Docs:   http://localhost:8000/docs"
echo ""
echo "  To'xtatish uchun Ctrl+C bosing"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
