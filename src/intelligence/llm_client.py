"""LLM provider clients and mock client for AnswerEvaluator."""

import json
import logging
import os
import time
from typing import Any, Callable, Dict, List, Optional

import httpx

from src.intelligence.interfaces import ILLMClient

logger = logging.getLogger(__name__)


class LLMProviderError(Exception):
    """Raised when an LLM provider request fails or times out."""
    pass


class MockLLMClient:
    """Mock LLM client returning programmed JSON strings for fast, deterministic testing."""

    def __init__(
        self,
        default_response: Optional[str] = None,
        response_factory: Optional[Callable[[str, str], str]] = None,
    ):
        self.default_response = default_response or "{}"
        self.response_factory = response_factory
        self.call_history: List[Dict[str, Any]] = []

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        json_schema: Optional[Dict[str, Any]] = None,
    ) -> str:
        self.call_history.append(
            {
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "json_schema": json_schema,
            }
        )
        if self.response_factory:
            return self.response_factory(system_prompt, user_prompt)
        return self.default_response


class HTTPLLMClient:
    """OpenAI-compatible HTTP client for chat completions with structured JSON output."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = 15.0,
        max_retries: int = 1,
    ):
        self.api_key = (
            api_key
            or os.getenv("ECHOSPHERE_LLM_API_KEY")
            or os.getenv("OPENAI_API_KEY")
            or ""
        )
        self.base_url = (
            base_url
            or os.getenv("ECHOSPHERE_LLM_BASE_URL")
            or os.getenv("OPENAI_BASE_URL")
            or "https://api.openai.com/v1"
        ).rstrip("/")
        self.model = (
            model
            or os.getenv("ECHOSPHERE_LLM_MODEL")
            or os.getenv("OPENAI_MODEL")
            or "gpt-4o"
        )
        self.timeout = timeout
        self.max_retries = max_retries

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        json_schema: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Call chat completion endpoint with bounded retries and sanitized error handling."""
        if not self.api_key:
            raise LLMProviderError(
                "LLM API key not configured. Set ECHOSPHERE_LLM_API_KEY or OPENAI_API_KEY."
            )

        endpoint = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
        }

        last_err: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(endpoint, headers=headers, json=payload)
                    response.raise_for_status()
                    data = response.json()
                    choices = data.get("choices")
                    if not choices or not isinstance(choices, list):
                        raise LLMProviderError("LLM response missing 'choices' array.")
                    content = choices[0].get("message", {}).get("content")
                    if not content or not content.strip():
                        raise LLMProviderError("LLM returned empty message content.")
                    return content.strip()

            except httpx.TimeoutException as exc:
                last_err = exc
                logger.warning("LLM request attempt %d timed out after %.1fs", attempt + 1, self.timeout)
                if attempt < self.max_retries:
                    time.sleep(0.3)
            except httpx.HTTPStatusError as exc:
                # Do not retry on 4xx client errors (e.g. 401 Unauthorized, 400 Bad Request)
                status_code = exc.response.status_code
                if 400 <= status_code < 500:
                    raise LLMProviderError(f"LLM provider client error (HTTP {status_code})") from exc
                last_err = exc
                logger.warning("LLM request attempt %d failed with HTTP %d", attempt + 1, status_code)
                if attempt < self.max_retries:
                    time.sleep(0.3)
            except Exception as exc:
                last_err = exc
                logger.warning("LLM request attempt %d encountered error: %s", attempt + 1, str(exc))
                if attempt < self.max_retries:
                    time.sleep(0.3)

        raise LLMProviderError(f"LLM provider request failed after {self.max_retries + 1} attempts: {str(last_err)}")
