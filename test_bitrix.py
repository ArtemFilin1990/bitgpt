# Copyright (c) 2025

"""
Тестовый файл для проверки функциональности Bitrix handler
"""
import os
import importlib

import api.bitrix


def test_parse_request():
    """Тест функции парсинга запросов."""
    from api.bitrix import parse_request

    request_dict = {"body": '{"data": {"PARAMS": {"MESSAGE": "test", "DIALOG_ID": "123"}}}'}
    result = parse_request(request_dict)
    assert result is not None
    assert result["data"]["PARAMS"]["MESSAGE"] == "test"


def test_handler_missing_config():
    """Тест handler без конфигурации."""
    orig_webhook = os.environ.get("BITRIX_WEBHOOK")
    orig_api_key = os.environ.get("OPENAI_API_KEY")

    os.environ.pop("BITRIX_WEBHOOK", None)
    os.environ.pop("OPENAI_API_KEY", None)

    importlib.reload(api.bitrix)

    result = api.bitrix.handler({})
    assert result["statusCode"] == 500
    assert "Missing configuration" in result["body"]

    if orig_webhook:
        os.environ["BITRIX_WEBHOOK"] = orig_webhook
    if orig_api_key:
        os.environ["OPENAI_API_KEY"] = orig_api_key


def test_handler_valid_config():
    """Тест handler с валидной конфигурацией но без сообщения."""
    os.environ["BITRIX_WEBHOOK"] = "https://test.webhook.url"
    os.environ["OPENAI_API_KEY"] = "test-api-key"

    importlib.reload(api.bitrix)

    request = {"data": {"PARAMS": {}}}
    result = api.bitrix.handler(request)
    assert result["statusCode"] == 200
    assert result["body"] == "No message"


if __name__ == "__main__":
    test_parse_request()
    test_handler_missing_config()
    test_handler_valid_config()
    print("All tests passed!")
