# Архітектура застосунку NodeWeather

## 1. Загальний огляд

NodeWeather — це клієнт–серверний застосунок для перегляду погоди, збереження улюблених міст та історії запитів. Складається з:

- **Frontend (HTML/CSS/JS)** — рендер UI, виклики API, обробка вибору країни/міста, відображення історії та улюблених.
- **Backend (Node.js + Express)** — REST API для роботи з історією, улюбленими містами, аналітикою та проксі-доступом до погодного сервісу.
- **База даних SQLite** — зберігання таблиць `favorites` та `history`.
- **Зовнішній погодний API (VisualCrossing)** — джерело фактичних даних про погоду.

---

## 2. Компонентна діаграма (Mermaid)

```mermaid
flowchart LR
    subgraph Client
        UI[Browser UI<br/>index.html + app.js]
    end

    subgraph Server[Node.js + Express]
        ROUTES[Express Routes]
        SERVICES[Service Layer]
        DAL[Data Access Layer (DAL)]
    end

    subgraph DB[SQLite]
        FAVTBL[(favorites)]
        HISTBL[(history)]
    end

    API[VisualCrossing Weather API]

    UI -->|HTTP /api/*| ROUTES
    ROUTES --> SERVICES
    SERVICES --> DAL
    DAL --> FAVTBL
    DAL --> HISTBL

    SERVICES -->|HTTP| API
```

---

## 3. Архітектура backend

Бекенд реалізовано у вигляді **трирівневої архітектури** з чітким поділом відповідальностей.

### 3.1 Роутери (HTTP-рівень)

Роутери відповідають за:

- прийом HTTP-запитів;
- роботу з `req` / `res`;
- делегування бізнес-логіки сервісному шару.

Основні роутери:

- `backend/src/routes/favorites.route.js` — операції з улюбленими містами:
  - `GET /api/favorites`
  - `POST /api/favorites`
  - `DELETE /api/favorites/:name`
  - `DELETE /api/favorites`
- `backend/src/routes/history.route.js` — робота з історією переглядів:
  - `GET /api/history`
  - `POST /api/history`
  - `DELETE /api/history`
  - `DELETE /api/history/cleanup?days=30` — очищення старих записів (не лише CRUD, а бізнес-операція).
- `backend/src/routes/stats.route.js` — аналітичні ендпоінти:
  - `GET /api/stats/top-cities`
  - `GET /api/stats/overview`
  - `GET /api/stats/today`
- (за потреби) `backend/src/routes/weather.route.js` — проксі до зовнішнього погодного API.

Підключення роутерів виконується у модулі застосунку:

```javascript
// backend/src/app.js
app.use("/api/favorites", favoritesRouter);
app.use("/api/history", historyRouter);
app.use("/api/stats", statsRouter);
// app.use("/api/weather", weatherRouter); // якщо виділяється окремий роутер
```

### 3.2 Сервісний шар (business logic)

Сервісний шар інкапсулює:

- валідацію вхідних даних;
- бізнес-правила (обмеження за кількістю записів, обробку параметрів, логіку очищення);
- координацію кількох викликів DAL.

Основні сервіси:

- `backend/src/services/favorites.service.js`
  - додавання, видалення, очищення улюблених міст;
  - перевірка вхідних даних (`name`, `lat`, `lon`).
- `backend/src/services/history.service.js`
  - створення запису історії запиту;
  - підтримка фіксованої довжини історії;
  - очищення історії старше N днів.
- `backend/src/services/stats.service.js`
  - розрахунок топ-міст за кількістю переглядів;
  - підрахунок загальної кількості записів;
  - кількість запитів за конкретну дату.

У сервісах не використовується `res`/`req` та немає SQL — лише бізнес-логіка.

### 3.3 Шар доступу до даних (DAL)

DAL — єдиний рівень, де безпосередньо виконуються SQL-запити до SQLite.

Основні модулі:

- `backend/src/dal/favorites.dal.js`
  - читання, вставка, видалення записів з таблиці `favorites`.
- `backend/src/dal/history.dal.js`
  - вставка нових записів історії;
  - вибір останніх N записів;
  - очищення історії.
- `backend/src/dal/stats.dal.js`
  - агрегуючі запити по таблиці `history`;
  - підрахунок кількості записів;
  - вибір топ-міст за кількістю звернень.

Такий поділ дозволяє:

- ізолювати SQL у DAL;
- перевикористовувати бізнес-логіку в сервісах;
- спростити тестування та подальший рефакторинг.

---

## 4. Архітектура frontend

Фронтенд побудовано як **односторінковий застосунок** без складного фреймворку, але з логічним поділом коду:

- `frontend/index.html` — HTML-розмітка інтерфейсу:
  - форма пошуку міста/координат;
  - блок відображення поточної погоди;
  - списки “Історія” та “Улюблені міста”.
- `frontend/style.css` — стилі оформлення.
- `frontend/app.js` — головний файл з UI-логікою:
  - обробка подій користувача;
  - оновлення DOM після отримання даних;
  - виклики сервісів `weatherService` та `storageApi`.
- `frontend/services/weatherService.js` — окремий модуль для роботи з погодним API:
  - формування URL до VisualCrossing;
  - обробка відповіді та повернення нормалізованих даних.
- `frontend/services/storageApi.js` — модуль для взаємодії з бекендом:
  - робота з `/api/favorites`, `/api/history`, `/api/stats`;
  - інкапсуляція всіх HTTP-запитів до сервера.

Frontend **не працює напряму** з базою даних і не знає про структуру таблиць — вся робота йде через HTTP-API бекенду.

---

## 5. REST API

### 5.1 Favorites API (`/api/favorites`)

- `GET /api/favorites`  
  Повертає список усіх улюблених міст користувача.

- `POST /api/favorites`  
  Додає нове місто до списку улюблених.

  **Тіло запиту (JSON):**

  ```json
  {
    "name": "Kyiv",
    "lat": 50.4501,
    "lon": 30.5234
  }
  ```

- `DELETE /api/favorites/:name`  
  Видаляє одне улюблене місто за його назвою.

- `DELETE /api/favorites`  
  Очищує список усіх улюблених міст.

---

### 5.2 History API (`/api/history`)

- `GET /api/history?limit=10`  
  Повертає останні N записів історії.

- `POST /api/history`  
  Додає новий запис історії перегляду погоди.

  **Тіло запиту (JSON):**

  ```json
  {
    "date": "2025-11-30",
    "city": "Kyiv",
    "temp": 3.5,
    "conditions": "Light rain"
  }
  ```

  Дата може бути згенерована на бекенді, якщо не передана явно.

- `DELETE /api/history`  
  Повне очищення історії.

- `DELETE /api/history/cleanup?days=30`  
  Видаляє записи старше ніж N днів.  
  Це окрема бізнес-операція, яка використовує логіку сервісного шару та DAL.

---

### 5.3 Stats API (`/api/stats`)

- `GET /api/stats/top-cities?limit=5`  
  Повертає топ міст за кількістю переглядів погоди.

- `GET /api/stats/overview`  
  Повертає загальні лічильники:
  - кількість записів у `history`;
  - кількість улюблених міст у `favorites`.

- `GET /api/stats/today?date=YYYY-MM-DD`  
  Повертає кількість запитів за вказану дату (або за поточний день, якщо параметр не передано).

---

### 5.4 Weather API (`/api/weather`)

(За наявності окремого роутера або проксі)  
Ендпоінт(и) для отримання поточної погоди через бекенд на основі координат:

- `GET /api/weather?lat=..&lon=..` — отримання погоди із зовнішнього API VisualCrossing.

---

## 6. CI/CD

Для автоматизації перевірок та збірки застосунку використовується **GitHub Actions**. Основні етапи пайплайна:

- Встановлення залежностей для frontend та backend.
- Запуск лінтерів та форматера (ESLint, Prettier).
- Запуск unit-тестів (Jest).
- Запуск end-to-end тестів (Playwright).
- Запуск мутаційних тестів (Stryker) для оцінки якості покриття тестами.

Це забезпечує автоматичну перевірку якості коду при кожному пуші та pull request.
