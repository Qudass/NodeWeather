# Архітектура застосунку NodeWeather

## 1. Загальний огляд
NodeWeather — це клієнт–серверний застосунок для перегляду погоди, збереження улюблених міст та історії запитів. Складається з:

- **Frontend (HTML/CSS/JS)** — рендер UI, виклики API, обробка вибору країни/міста.
- **Backend (Node.js + Express)** — API для погоди, фаворитів, історії.
- **База даних SQLite** — зберігання favorites та history.
- **Інтеграція з VisualCrossing API** — прогноз погоди за координатами.

---

## 2. Компонентна діаграма (Mermaid)

```mermaid
graph TD

UI[Frontend UI<br>HTML/CSS/JS] --> AppJS[app.js логіка]
AppJS --> StorageAPI[storageApi.js]
AppJS --> WeatherService[weatherService.js]

StorageAPI --> Backend[(Express API)]
WeatherService --> VisualCrossing[VisualCrossing API]

Backend --> DB[(SQLite Database)]
```

---

## 3. Основні модулі

### 3.1 Frontend
- `app.js` — головна логіка UI
- `storageApi.js` — робота з `/api/favorites` і `/api/history`
- `weatherService.js` — отримання погоди з VisualCrossing
- `current.city.list.json` — великий файл міст (17+ МБ)

### 3.2 Backend
- `routes/favorites.route.js`
- `routes/history.route.js`
- `routes/weather.route.js`
- `db/db.js` — ініціалізація SQLite

---

## 4. Потоки даних (Data Flow)

### 4.1 Отримання прогнозу погоди

```mermaid
sequenceDiagram
    participant User as Користувач
    participant UI as UI
    participant App as app.js
    participant WS as weatherService.js
    participant VC as VisualCrossing API

    User->>UI: Обирає місто
    UI->>App: Подія "місто обрано"
    App->>WS: fetchWeatherByCoords(lat, lon)
    WS->>VC: GET /timeline/{lat},{lon}?unitGroup=metric
    VC-->>WS: JSON прогнозу
    WS-->>App: Дані погоди
    App-->>UI: Рендер прогнозу
```

---

### 4.2 Додавання улюблених міст

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant App as app.js
    participant SA as storageApi.js
    participant BE as Backend
    participant DB as SQLite

    User->>UI: "Додати до улюблених"
    UI->>App: addFavorite(city)
    App->>SA: addFavorite({ name, lat, lon })
    SA->>BE: POST /api/favorites
    BE->>DB: INSERT favorites
    DB-->>BE: OK
    BE-->>SA: OK
    SA-->>App: OK
    App-->>UI: Оновити список улюблених
```

---

### 4.3 Збереження історії

```mermaid
sequenceDiagram
    participant App as app.js
    participant SA as storageApi.js
    participant BE as Backend
    participant DB as SQLite
    participant UI as UI

    App->>SA: addHistory({ city, date, temp, conditions })
    SA->>BE: POST /api/history
    BE->>DB: INSERT history
    DB-->>BE: OK
    BE-->>SA: Історія додана
    SA-->>App: OK
    App-->>UI: Оновити історію
```

---

## 5. API

### 5.1 Favorites
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`

### 5.2 History
- `GET /api/history`
- `POST /api/history`
- `DELETE /api/history/:id`

### 5.3 Weather
- `GET /api/weather?lat=&lon=`

---

## 6. CI/CD
- GitHub Actions:
  - Встановлення залежностей
  - Запуск backend + frontend
  - Unit-тести (Jest)
  - E2E (Playwright)
  - Мутаційні тести (Stryker)

