# Raqamli Bozor — Dashboard

Bozor statistikasi uchun professional dashboard paneli.

## Tuzilma

```
dashboard/
├── backend/          FastAPI proxy + AI Agent
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/         React + Tailwind + DaisyUI
    ├── src/
    │   ├── App.jsx
    │   ├── api/client.js
    │   ├── hooks/useDashboard.js
    │   └── components/
    └── package.json
```

## Ishga tushirish (lokal)

### 1. Script bilan (eng oson)
```bash
chmod +x start.sh
./start.sh
```

### 2. Qo'lda

**Backend:**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker bilan
```bash
cp backend/.env.example backend/.env
docker compose up --build
```

## Manzillar

| Xizmat    | URL                           |
|-----------|-------------------------------|
| Frontend  | http://localhost:5173         |
| Backend   | http://localhost:8000         |
| API Docs  | http://localhost:8000/docs    |

## Imkoniyatlar

- **Umumiy ko'rsatkichlar** — daromad, qarzlar, savdo joylari
- **Magazinlar / Rastalar / Ochiq savdo** — alohida tablar
- **Qarz tahlili** — barchart va kategoriyalar bo'yicha
- **Transport kirishi** — kun bo'yicha statistika
- **Top Qarzdorlar** — saralash va filtr bilan jadval
- **Bozor tanlash** — yuqori o'ng burchakda (select)
- **AI Agent** — pastki o'ng burchakdagi chat (bozorlar haqida savol bering)
- **Dark/Light mode** toggle
