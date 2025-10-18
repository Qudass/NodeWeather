# Архітектура застосунку NodeWeather

Цей документ описує загальну архітектуру застосунку, основні компоненти системи, технології, що використовуються, та потоки даних між фронтендом, бекендом і зовнішніми сервісами.

---

## 1. Загальна структура репозиторію

Проєкт організовано у форматі монорепозиторію:

```
NodeWeather/
  frontend/   – UI, клієнтська логіка, сервіси, тести
  backend/    – Express-сервер, API-маршрути, робота з БД
  docs/       – документація (архітектура, модель даних тощо)
```

---

## 2. Стек технологій

### Frontend

- **HTML5, CSS3**
- **JavaScript (ES6+)**
- **jQuery**
- **Fetch API**
- **LocalStorage**
- **Jest**

### Backend

- **Node.js**
- **Express**
- **SQLite**
- **Міграції**
- **Jest / Supertest (опційно)**

### Зовнішні API

- **VisualCrossing Weather API**

---

## 3. Компонентна діаграма системи

```mermaid
flowchart LR
    classDef frontend fill:#E3F2FD,stroke:#2196F3,color:#0D47A1,stroke-width:2;
    classDef backend fill:#E8F5E9,stroke:#43A047,color:#1B5E20,stroke-width:2;
    classDef external fill:#FFF3E0,stroke:#FB8C00,color:#E65100,stroke-width:2;

    subgraph FRONTEND["Frontend<br/>(HTML/CSS, JS, jQuery, Jest)"]
        UI["UI Layer<br/>(index.html, style.css)"]:::frontend
        APP["App Logic<br/>(app.js)"]:::frontend
        WeatherService["Weather Service<br/>(weatherService.js)<br/>Fetch + VisualCrossing"]:::frontend
        StorageApi["Storage API<br/>(storageApi.js)<br/>Fetch → Backend REST"]:::frontend
    end

    subgraph BACKEND["Backend<br/>(Node.js, Express,<br/>SQLite, Jest/Supertest)"]
        API["Express Server<br/>(index.js)"]:::backend
        Routes["Routes Layer<br/>(/favorites, /history)<br/>Express Router"]:::backend
        ServiceLayer["Service Layer<br/>(DB access, validation)"]:::backend
        DB["SQLite Database<br/>(migrations, tables)"]:::backend
    end

    ExternalAPI["VisualCrossing<br/>Weather API<br/>(External REST)"]:::external

    UI --> APP
    APP --> WeatherService
    APP --> StorageApi

    StorageApi -->|HTTP REST| API
    API --> Routes
    Routes --> ServiceLayer
    ServiceLayer --> DB

    WeatherService -->|HTTP GET| ExternalAPI
```

---

## 4. Потоки даних (Data Flows)

### 4.1 Отримання прогнозу погоди

```mermaid
sequenceDiagram
    participant User as 👤 Користувач
    participant UI as UI (HTML/CSS)
    participant App as app.js
    participant WS as WeatherService.js
    participant VC as VisualCrossing API

    User->>UI: Обирає країну та місто
    UI->>App: Подія "місто обрано"
    App->>WS: getWeather(lat, lon)
    WS->>VC: HTTP GET /timeline?lat,lon
    VC-->>WS: JSON з прогнозом погоди
    WS-->>App: Дані погоди
    App-->>UI: Рендер прогнозу
```

---

### 4.2 Додавання міста до улюблених

```mermaid
sequenceDiagram
    participant User as 👤 Користувач
    participant UI as UI (HTML/CSS)
    participant App as app.js
    participant SA as storageApi.js
    participant BE as Backend (Express)
    participant DB as SQLite

    User->>UI: Натискає "Додати до улюблених"
    UI->>App: addFavorite(city)
    App->>SA: storageApi.addFavorite(cityObj)
    SA->>BE: POST /favorites
    BE->>DB: INSERT INTO favorites
    DB-->>BE: OK
    BE-->>SA: OK
    SA-->>App: OK
    App-->>UI: Оновлення UI
```

---

### 4.3 Додавання запису в історію

```mermaid
sequenceDiagram
    participant App as app.js
    participant UI as UI (HTML/CSS)
    participant SA as storageApi.js
    participant BE as Backend (Express)
    participant DB as SQLite

    App->>SA: storageApi.addHistory(city)
    SA->>BE: POST /history
    BE->>DB: INSERT INTO history
    DB-->>BE: OK
    BE-->>SA: { id, city, date }
    SA-->>App: OK
    App-->>UI: Оновлення історії
```

---

## 5. Висновок

Архітектура NodeWeather побудована за принципом розділення відповідальностей —  
фронтенд відповідає за UI, бекенд — за API та роботу з БД,  
а зовнішній сервіс постачає дані прогнозу погоди.
