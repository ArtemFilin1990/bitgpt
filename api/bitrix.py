"""Copyright (c) 2025"""
import os
import json
from openai import OpenAI
import requests

BITRIX_WEBHOOK = os.getenv("BITRIX_WEBHOOK")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class OpenAIError(Exception):
    """Ошибка при работе с OpenAI API."""
    pass


class BitrixError(Exception):
    """Ошибка при работе с Bitrix24 API."""
    pass


def parse_request(request):
    """Parse request body robustly."""
    try:
        if hasattr(request, "get_json"):
            return request.get_json(silent=True) or {}
        elif isinstance(request, dict):
            body = request.get("body")
            if isinstance(body, (str, bytes)):
                return json.loads(body)
            elif isinstance(body, dict):
                return body
            else:
                return request
        else:
            return {}
    except Exception:
        return None


def get_openai_response(message):
    """Get response from OpenAI."""
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[{"role": "user", "content": message}],
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as exc:
        raise OpenAIError(f"AI error: {exc}")


def send_bitrix_message(dialog_id, answer):
    """Send message to Bitrix24."""
    try:
        resp = requests.post(
            f"{BITRIX_WEBHOOK}/imbot.message.add.json",
            json={"DIALOG_ID": dialog_id, "MESSAGE": answer},
            timeout=15,
        )
        resp.raise_for_status()
    except Exception as exc:
        raise BitrixError(f"Bitrix error: {exc}")


def handler(request):
    """Handle Bitrix24 webhook events and respond using OpenAI."""
    if not BITRIX_WEBHOOK or not OPENAI_API_KEY:
        return {"statusCode": 500, "body": "Missing configuration"}

    event = parse_request(request)
    if event is None:
        return {"statusCode": 400, "body": "Invalid request"}

    params = event.get("data", {}).get("PARAMS", {})
    message = params.get("MESSAGE")
    dialog_id = params.get("DIALOG_ID")
    if not message or not dialog_id:
        return {"statusCode": 200, "body": "No message"}

    try:
        answer = get_openai_response(message)
        send_bitrix_message(dialog_id, answer)
        return {"statusCode": 200, "body": "ok"}
    except (OpenAIError, BitrixError) as exc:
        return {"statusCode": 502, "body": str(exc)}
