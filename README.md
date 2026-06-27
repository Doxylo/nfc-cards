# NFC Визитки

Проект для создания персональных страниц-визиток с NFC-картами.

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
```

### 2. Запустить локально
```bash
npm run dev
# Открыть http://localhost:3000/v/ivan-petrov
```

---

## Добавить нового клиента

Открой файл `data/clients.json` и добавь объект:

```json
{
  "slug": "unikalnoe-imya",        // URL: /v/unikalnoe-imya
  "name": "Имя Фамилия",
  "title": "Должность",            // можно убрать
  "company": "Компания",           // можно убрать
  "phone": "+7 900 000 00 00",     // можно убрать
  "email": "email@example.com",    // можно убрать
  "telegram": "username",          // без @, можно убрать
  "instagram": "username",         // без @, можно убрать
  "website": "https://site.com",   // можно убрать
  "photo": "/photos/slug.jpg",     // или null
  "accent": "#6366f1"              // цвет акцента (HEX)
}
```

Фото кладёшь в папку `public/photos/`.

---

## Деплой на Vercel

1. Залить проект на GitHub (новый репозиторий)
2. Зайти на [vercel.com](https://vercel.com) → New Project
3. Выбрать репозиторий → Deploy
4. Сайт будет на `https://your-project.vercel.app`

Чтобы добавить клиента после деплоя:
- Отредактируй `clients.json` → запушь в GitHub
- Vercel сам задеплоит за ~30 секунд

---

## Что записать на NFC-карту

```
https://your-project.vercel.app/v/slug-клиента
```

Приложение для записи: **NFC Tools** (iOS / Android)

---

## Поля клиента (все кроме slug и name — необязательные)

| Поле | Описание |
|---|---|
| slug | URL-путь, только латиница и дефис |
| name | Полное имя |
| title | Должность |
| company | Компания |
| phone | Телефон (с кодом страны) |
| email | Email |
| telegram | Username без @ |
| instagram | Username без @ |
| website | Полный URL с https:// |
| photo | Путь к фото из папки public/ или null |
| accent | HEX-цвет акцента карточки |
