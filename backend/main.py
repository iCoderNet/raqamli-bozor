"""
Raqamli Bozor – Dashboard Backend
FastAPI proxy + AI Agent
"""

import os
import json
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

import httpx
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles

DIST_DIR = Path(__file__).parent.parent / "frontend" / "dist"
from pydantic import BaseModel

# ─── Config ────────────────────────────────────────────────────────────────
BASE_URL = os.getenv("BAZAAR_BASE_URL", "https://raqamli-bozor.uz/api/bazaar-service/v1/government")
AUTH_URL = os.getenv("BAZAAR_AUTH_URL", "https://raqamli-bozor.uz/api/bazaar-service/v1/auth/token/")
USERNAME = os.getenv("BAZAAR_USERNAME", "andijon_it")
PASSWORD = os.getenv("BAZAAR_PASSWORD", "lCt9ybPmAnIlJRg2")

LLM_URL   = os.getenv("LLM_URL", "https://p950-w009-runai-p950.runai-inference.dc.uz/v1/chat/completions")
LLM_KEY   = os.getenv("LLM_KEY", "sk-_RFXXpNRwyAc5ap6XUztNQ")
LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")

# ─── Token cache ───────────────────────────────────────────────────────────
_token_cache: dict = {"access": None, "refresh": None}

async def get_access_token(client: httpx.AsyncClient) -> str:
    """Obtain JWT token (or refresh). Falls back to Basic Auth header."""
    if _token_cache["access"]:
        return _token_cache["access"]
    try:
        resp = await client.post(
            AUTH_URL,
            json={"username": USERNAME, "password": PASSWORD},
            timeout=10,
        )
        if resp.status_code == 200:
            data = resp.json()
            _token_cache["access"]  = data.get("access") or data.get("token")
            _token_cache["refresh"] = data.get("refresh")
            return _token_cache["access"]
    except Exception:
        pass
    # fallback: empty string – downstream will use Basic Auth
    return ""


def make_headers(token: str) -> dict:
    if token:
        return {"Authorization": f"Bearer {token}"}
    import base64
    creds = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {creds}"}


# ─── HTTP client lifespan ─────────────────────────────────────────────────
http_client: httpx.AsyncClient = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global http_client
    http_client = httpx.AsyncClient(timeout=30)
    yield
    await http_client.aclose()


# ─── App ──────────────────────────────────────────────────────────────────
app = FastAPI(title="Raqamli Bozor Dashboard API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helper ───────────────────────────────────────────────────────────────
async def proxy_get(path: str, params: dict) -> dict:
    """Proxy a GET request to the upstream API."""
    token = await get_access_token(http_client)
    headers = make_headers(token)
    url = f"{BASE_URL}{path}"
    # Remove None values
    clean_params = {k: v for k, v in params.items() if v is not None}
    # Try both common param names for market filter
    if "market_id" in clean_params:
        val = clean_params.pop("market_id")
        clean_params["tin"] = val        # upstream likely uses tin
    try:
        resp = await http_client.get(url, headers=headers, params=clean_params)
        print(f"Proxy GET {url} with params {clean_params} -> {resp.status_code} \n\n Response: {resp.text}")
        if resp.status_code == 401:
            # Try token refresh
            _token_cache["access"] = None
            token = await get_access_token(http_client)
            headers = make_headers(token)
            resp = await http_client.get(url, headers=headers, params=clean_params)
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        # Handle empty body (204 No Content or empty 200)
        if not resp.content or resp.status_code == 204:
            return {}
        try:
            result = resp.json()
        except Exception:
            return {}
        # Unwrap API envelope: {"data": {...}, "response": {}, ...}
        if isinstance(result, dict) and "data" in result:
            inner = result["data"]
            return inner if inner is not None else {}
        return result
    except httpx.RequestError as exc:
        print(f"Upstream error: {exc}")
        raise HTTPException(status_code=502, detail=f"Upstream error: {exc}")


# ─── Dashboard Endpoints ──────────────────────────────────────────────────

@app.get("/api/dashboard/overview")
async def overview(
    market_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    section_id: Optional[int] = None,
):
    return await proxy_get("/dashboard/overview", {
        "market_id": market_id, "year": year, "month": month, "section_id": section_id
    })


@app.get("/api/dashboard/shops")
async def shops(
    market_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
):
    data = await proxy_get("/dashboard/shops", {
        "market_id": market_id, "year": year, "month": month
    })
    # API returns list of per-market breakdowns → aggregate into totals
    if isinstance(data, list):
        def _s(key): return sum((d.get(key) or 0) for d in data)
        return {
            "total_shops":        _s("total_shops"),
            "active_shops":       _s("active_shops"),
            "inactive_shops":     _s("inactive_shops"),
            "shop_revenue":       _s("shop_revenue"),
            "shop_debt_amount":   _s("shop_debt_amount"),
            "shop_debtors_count": _s("shop_debtors_count"),
            "by_market": data,
        }
    return data


@app.get("/api/dashboard/stalls")
async def stalls(
    market_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
):
    return await proxy_get("/dashboard/stalls", {
        "market_id": market_id, "year": year, "month": month
    })


@app.get("/api/dashboard/open-trade")
async def open_trade(
    market_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
):
    return await proxy_get("/dashboard/open-trade", {
        "market_id": market_id, "year": year, "month": month
    })


@app.get("/api/dashboard/debts")
async def debts(
    market_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
):
    return await proxy_get("/dashboard/debts", {
        "market_id": market_id, "year": year, "month": month
    })


@app.get("/api/dashboard/top-debtors")
async def top_debtors(
    market_id: Optional[int] = None,
    limit: int = 10,
):
    data = await proxy_get("/dashboard/top-debtors", {
        "market_id": market_id, "limit": limit
    })
    # API returns list directly → wrap into {count, results}
    if isinstance(data, list):
        return {"count": len(data), "results": data}
    return data


@app.get("/api/dashboard/vehicle-entries")
async def vehicle_entries(
    market_id: Optional[int] = None,
    date: Optional[str] = None,
):
    return await proxy_get("/dashboard/vehicle-entries", {
        "market_id": market_id, "date": date
    })


@app.get("/api/dashboard/filters")
async def filters():
    data = await proxy_get("/dashboard/filters", {})
    # Markets don't have `id` field — add it using `tin` so select works
    markets = data.get("markets", [])
    for m in markets:
        if "id" not in m:
            m["id"] = m.get("tin")
    return data


# ─── AI Agent ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Siz Raqamli Bozor tizimining AI yordamchisisiz.
Siz Andijon viloyatidagi bozorlar haqida ma'lumot berasiz.
Bozor statistikasi, savdo joylari, qarzlar, transport kirish statistikasi
va boshqa bozor ma'lumotlari haqida aniq va foydali javoblar berasiz.
Uzbek tilida, professional va do'stona muloqot qiling.
Agar real ma'lumot kerak bo'lsa, foydalanuvchiga dashboard'dan ko'rish mumkinligini ayting."""

class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class AgentRequest(BaseModel):
    messages: List[Message]
    context: Optional[Dict[str, Any]] = None   # dashboard data to include
    stream: bool = False


@app.post("/api/agent/chat")
async def agent_chat(req: AgentRequest):
    """AI agent – answers questions about markets."""
    # Build system message with optional context
    system_content = SYSTEM_PROMPT
    if req.context:
        system_content += f"\n\nJoriy dashboard ma'lumotlari:\n{json.dumps(req.context, ensure_ascii=False, indent=2)}"

    messages = [{"role": "system", "content": system_content}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024,
        "stream": req.stream,
    }

    if req.stream:
        async def generate():
            async with httpx.AsyncClient(timeout=60) as client:
                async with client.stream(
                    "POST", LLM_URL,
                    headers={
                        "Authorization": f"Bearer {LLM_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                ) as response:
                    async for chunk in response.aiter_text():
                        yield chunk

        return StreamingResponse(generate(), media_type="text/event-stream")
    else:
        try:
            resp = await http_client.post(
                LLM_URL,
                headers={
                    "Authorization": f"Bearer {LLM_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "message": data["choices"][0]["message"]["content"],
                "model": data.get("model", LLM_MODEL),
            }
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"LLM error: {exc}")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Raqamli Bozor Dashboard API"}


# ─── Frontend Static Files ────────────────────────────────────────────────
# Must be AFTER all /api/* routes so they take priority.

if DIST_DIR.exists():
    # Serve /assets, /favicon.svg, etc. directly
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        # Specific file in dist (e.g. favicon.svg)?
        candidate = DIST_DIR / full_path
        if candidate.is_file():
            return FileResponse(str(candidate))
        # Anything else → React index.html (client-side routing)
        return FileResponse(str(DIST_DIR / "index.html"))
else:
    @app.get("/", include_in_schema=False)
    async def no_build():
        return {"detail": "Frontend not built. Run: cd frontend && npm run build"}
