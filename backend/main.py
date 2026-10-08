import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import Client, create_client

# .env lives at the project root, one level above backend/
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Server-side only: the secret key bypasses RLS, so it must never reach the browser.
supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SECRET_KEY"],
)

app = FastAPI(title="FDEHW4 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

Status = Literal["todo", "doing", "done"]


class CardCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    status: Status = "todo"


class CardUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    status: Status | None = None


def _run(query):
    try:
        return query.execute().data
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Supabase error: {exc}")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/cards")
def get_cards():
    return _run(supabase.table("cards").select("*").order("created_at"))


@app.post("/cards", status_code=201)
def create_card(card: CardCreate):
    rows = _run(supabase.table("cards").insert(card.model_dump()))
    if not rows:
        raise HTTPException(status_code=502, detail="Insert returned no row (check RLS policies)")
    return rows[0]


@app.patch("/cards/{card_id}")
def update_card(card_id: int, card: CardUpdate):
    changes = card.model_dump(exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No fields to update")
    rows = _run(supabase.table("cards").update(changes).eq("id", card_id))
    if not rows:
        raise HTTPException(status_code=404, detail="Card not found")
    return rows[0]


@app.delete("/cards/{card_id}", status_code=204)
def delete_card(card_id: int):
    rows = _run(supabase.table("cards").delete().eq("id", card_id))
    if not rows:
        raise HTTPException(status_code=404, detail="Card not found")
