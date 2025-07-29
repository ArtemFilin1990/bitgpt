/* Copyright (c) 2025 */

# bitgpt

## Hi there 👋
## Привет 👋

### Bitrix24 GPT Bot

Файл `api/bitrix.py` содержит обработчик webhook для облачной версии Bitrix24.
Функция размещена в каталоге `api` для деплоя на Vercel.
Он принимает входящие события, отправляет текст запроса в OpenAI и
отправляет ответ обратно в чат Bitrix24.

#### Переменные окружения:

- `BITRIX_WEBHOOK` – адрес webhook, например
  `https://tdroks.bitrix24.ru/rest/1/2bcd7uxhgphx8v14`
- `OPENAI_API_KEY` – ключ доступа к OpenAI.

#### Запуск

Запускайте функцию в совместимом сервере (Flask/Vercel/AWS Lambda),
чтобы принимать POST‑запросы от Bitrix24.

#### Пример структуры запроса

```json
{
  "data": {
    "PARAMS": {
      "MESSAGE": "Привет, бот!",
      "DIALOG_ID": "chat123"
    }
  }
}
```

---

<!--
**EvaCoreBot/evacorebot** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->