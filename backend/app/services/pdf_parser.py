"""
PDF text extraction using PyMuPDF (fitz).
"""

import logging
import re

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


def _clean_text(raw: str) -> str:
    """Normalise whitespace and strip common encoding artefacts."""
    # Replace NULL bytes and common garbled chars
    text = raw.replace("\x00", "")
    # Collapse multiple whitespace (but keep newlines)
    text = re.sub(r"[^\S\n]+", " ", text)
    # Collapse 3+ consecutive blank lines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_pdf(file_bytes: bytes) -> dict:
    """
    Extract text from a PDF supplied as raw bytes.

    Returns
    -------
    dict
        {
            "text": str,          # full document text
            "page_count": int,
            "pages": list[str],   # per-page text
        }
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        logger.error("Failed to open PDF: %s", exc)
        raise ValueError(f"Cannot open the file as a valid PDF: {exc}") from exc

    pages: list[str] = []
    for page_num in range(len(doc)):
        try:
            page = doc[page_num]
            raw = page.get_text("text")
            pages.append(_clean_text(raw))
        except Exception as exc:
            logger.warning("Error reading page %d: %s", page_num + 1, exc)
            pages.append("")

    full_text = "\n\n".join(pages)
    page_count = len(doc)
    doc.close()

    if not full_text.strip():
        logger.warning("PDF produced empty text (%d pages)", page_count)

    return {
        "text": full_text,
        "page_count": page_count,
        "pages": pages,
    }
