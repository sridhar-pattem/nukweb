import logging
from typing import List, Sequence

import numpy as np
from sentence_transformers import SentenceTransformer

from app.utils.database import get_db_cursor

_MODEL = None
_MODEL_NAME = "all-MiniLM-L6-v2"
_EMBED_DIM = 384


def get_model() -> SentenceTransformer:
    global _MODEL
    if _MODEL is None:
        _MODEL = SentenceTransformer(_MODEL_NAME)
    return _MODEL


def embed_texts(texts: Sequence[str]) -> List[List[float]]:
    model = get_model()
    embeddings = model.encode(list(texts), normalize_embeddings=True)
    if isinstance(embeddings, list):
        return [list(map(float, emb)) for emb in embeddings]
    return [vec.astype(float).tolist() for vec in np.atleast_2d(embeddings)]


def build_book_text(book: dict) -> str:
    parts = [book.get("title", ""), book.get("subtitle", ""), book.get("collection_name", ""), book.get("age_rating", "")]
    authors = book.get("authors") or ""
    if authors:
        parts.append(f"Authors: {authors}")
    summary = book.get("description") or ""
    if summary:
        parts.append(summary)
    return ". ".join([p for p in parts if p]).strip()


def backfill_missing_embeddings(batch_size: int = 200) -> None:
    """Create embeddings for active books missing vectors."""
    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT b.book_id, b.title, b.subtitle, c.collection_name, b.age_rating,
                   COALESCE((
                       SELECT string_agg(contrib.name, ', ' ORDER BY contrib.name)
                       FROM book_contributors bc
                       JOIN contributors contrib ON bc.contributor_id = contrib.contributor_id
                       WHERE bc.book_id = b.book_id AND bc.role = 'author'
                   ), '') AS authors,
                   b.description
            FROM books b
            LEFT JOIN collections c ON b.collection_id = c.collection_id
            WHERE b.is_active = TRUE
              AND NOT EXISTS (SELECT 1 FROM book_embeddings be WHERE be.book_id = b.book_id)
            LIMIT %s
            """,
            (batch_size,),
        )
        rows = cur.fetchall() or []

        if not rows:
            return

        texts = [build_book_text(dict(row)) for row in rows]
        embeddings = embed_texts(texts)
        payload = [
            (
                row["book_id"],
                embedding,
            )
            for row, embedding in zip(rows, embeddings)
        ]

        cur.executemany(
            """
            INSERT INTO book_embeddings (book_id, embedding, updated_at)
            VALUES (%s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (book_id) DO UPDATE
            SET embedding = EXCLUDED.embedding,
                updated_at = EXCLUDED.updated_at
            """,
            payload,
        )


def semantic_search(query: str, limit: int = 6) -> List[dict]:
    if not query:
        return []

    # Ensure embeddings exist before searching
    try:
        backfill_missing_embeddings()
    except Exception as exc:  # pragma: no cover - best-effort warmup
        logging.warning("Failed to backfill embeddings: %s", exc)

    query_embedding = embed_texts([query])[0]

    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT b.book_id, b.isbn, b.title, b.subtitle,
                   b.publisher, b.publication_year,
                   b.collection_id, c.collection_name,
                   b.age_rating, b.cover_image_url,
                   ba.available_items, ba.total_items,
                   COALESCE((SELECT json_agg(
                       json_build_object('name', contrib.name, 'role', bc.role)
                       ORDER BY bc.role, bc.sequence_number
                   )
                    FROM book_contributors bc
                    JOIN contributors contrib ON bc.contributor_id = contrib.contributor_id
                    WHERE bc.book_id = b.book_id
                   ), '[]'::json) as contributors,
                   (SELECT AVG(rating) FROM reviews WHERE book_id = b.book_id) as avg_rating,
                   (SELECT COUNT(*) FROM reviews WHERE book_id = b.book_id) as review_count,
                   be.embedding <-> %s::vector(384) AS distance
            FROM book_embeddings be
            JOIN books b ON be.book_id = b.book_id
            LEFT JOIN collections c ON b.collection_id = c.collection_id
            LEFT JOIN mv_book_availability ba ON b.book_id = ba.book_id
            WHERE b.is_active = TRUE
            ORDER BY be.embedding <-> %s::vector(384)
            LIMIT %s
            """,
            (query_embedding, query_embedding, limit),
        )
        rows = cur.fetchall() or []

    return [dict(r) for r in rows]
