# BitGPT - Bitrix24 ChatBot

Интеграция ChatGPT с Bitrix24 для автоматических ответов на сообщения.

## 🚀 Возможности

- ✅ Обработка веб-хуков от Bitrix24
- ✅ Интеграция с OpenAI GPT-3.5/GPT-4
- ✅ Автоматические ответы в чатах Bitrix24
- ✅ Надежная обработка ошибок
- ✅ Модульная архитектура
- ✅ Полное покрытие тестами

## 📁 Структура проекта

```text
bitgpt/
├── api/
│   ├── __init__.py        # Пакет (пустой)
│   └── bitrix.py          # Основной обработчик API (handler, parse_request, get_openai_response, send_bitrix_message)
├── bitrix_handler.py      # Точка входа — реэкспортирует handler из api.bitrix
├── test_bitrix.py         # Тесты
├── requirements.txt       # Зависимости
└── README.md             # Документация
```

## 🔧 Установка

1. Установите зависимости:

```bash
pip install -r requirements.txt
```

2. Настройте переменные окружения:

```bash
export BITRIX_WEBHOOK="https://your-bitrix24.com/rest/your/webhook/"
export OPENAI_API_KEY="your-openai-api-key"
export OPENAI_MODEL="gpt-3.5-turbo"  # Опционально
```

## 🧪 Тестирование

```bash
pytest
```

## 📡 API

### handler(request)

Главная функция для обработки веб-хуков Bitrix24.

**Параметры:**

- `request`: объект запроса с данными от Bitrix24

**Возврат:**

- `{"statusCode": 200, "body": "ok"}` - успешная обработка
- `{"statusCode": 400, "body": "Invalid request"}` - некорректный запрос  
- `{"statusCode": 500, "body": "Missing configuration"}` - отсутствует конфигурация
- `{"statusCode": 502, "body": "error details"}` - ошибки API

## 🔍 Принцип работы

1. Получение веб-хука от Bitrix24 с сообщением пользователя
2. Извлечение текста сообщения и ID диалога
3. Отправка запроса к OpenAI для генерации ответа
4. Отправка ответа обратно в чат Bitrix24

## ⚡ Особенности

- **Специфичные исключения:** `OpenAIError`, `BitrixError`
- **Низкая когнитивная сложность:** код разбит на мелкие функции
- **Надежная обработка:** все возможные ошибки перехвачены
- **Таймаут запросов:** 15 секунд для HTTP-запросов
- **Robust парсинг:** поддержка различных форматов запросов

## 🛠️ Разработка

Файлы проверены на:

- ✅ Синтаксические ошибки
- ✅ Когнитивная сложность  
- ✅ Специфичность исключений
- ✅ Покрытие тестами

---

## Copyright

Copyright (c) 2025
