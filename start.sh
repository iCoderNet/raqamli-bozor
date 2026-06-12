#!/bin/bash
# ─── Raqamli Bozor Dashboard – Quick Start ───────────────────────────────

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     Raqamli Bozor Dashboard – Start          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Backend ──────────────────────────────────────────────────────────────
echo "▶ Backend o'rnatilmoqda..."
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt -q

# Copy .env if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "  ✓ .env fayli yaratildi (backend/.env)"
fi

echo "▶ Backend ishga tushirilmoqda (port 8000)..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# ── Frontend ─────────────────────────────────────────────────────────────
echo "▶ Frontend o'rnatilmoqda..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  npm install
fi

echo "▶ Frontend ishga tushirilmoqda (port 5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Tayyor!"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "  To'xtatish uchun Ctrl+C bosing"
echo ""

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT INT TERM
wait
