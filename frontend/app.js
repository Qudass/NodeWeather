import {
  addFavorite,
  getFavorites,
  removeFavorite,
  clearFavorites,
  addHistory,
  getHistory,
  clearHistory
} from "./services/storageApi.js";
import { fetchWeatherByCoords } from "./services/weatherService.js";

// Weather condition icons mapping
const weatherIcons = {
  clear: "fas fa-sun",
  sunny: "fas fa-sun",
  "partly-cloudy": "fas fa-cloud-sun",
  cloudy: "fas fa-cloud",
  overcast: "fas fa-cloud",
  rain: "fas fa-cloud-rain",
  showers: "fas fa-cloud-rain",
  snow: "fas fa-snowflake",
  fog: "fas fa-smog",
  wind: "fas fa-wind",
  storm: "fas fa-bolt",
  thunderstorm: "fas fa-bolt",
  default: "fas fa-cloud-sun"
};

function getWeatherIcon(condition) {
  if (!condition) return weatherIcons.default;

  const conditionLower = condition.toLowerCase();
  for (const [key, icon] of Object.entries(weatherIcons)) {
    if (conditionLower.includes(key.replace("-", " "))) {
      return icon;
    }
  }
  return weatherIcons.default;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Сьогодні";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Завтра";
  } else {
    return date.toLocaleDateString("uk-UA", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }
}

$(document).ready(function () {
  $.getJSON("current.city.list.json", function (cities) {
    let selectedCity = null;

    // Country selection handler
    $("#country-select").on("change", function () {
      const selectedCountry = $(this).val();
      let out = "";

      // Filter cities by selected country
      const filteredCities = cities.filter((city) => city.country === selectedCountry);

      if (filteredCities.length > 0) {
        for (const city of filteredCities) {
          out += `<p data-lat="${city.coord.lat}" data-lon="${city.coord.lon}">${city.name}</p>`;
        }
        $("#city-list").html(out);
        $("#city-search").prop("disabled", false).focus();

        // Add click handlers to city items
        $("#city-list p").on("click", function () {
          selectCity($(this));
        });
      } else {
        $("#city-list").html('<p class="no-cities">Міста не знайдено</p>');
      }
    });

    // City search functionality
    $("#city-search").on("input", function () {
      const searchTerm = $(this).val().toLowerCase();
      $("#city-list p").each(function () {
        const cityName = $(this).text().toLowerCase();
        if (cityName.includes(searchTerm)) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    });

    // City selection function
    function selectCity($cityElement) {
      selectedCity = {
        lat: $cityElement.data("lat"),
        lon: $cityElement.data("lon"),
        name: $cityElement.text()
      };

      // Add visual feedback
      $("#city-list p").removeClass("selected");
      $cityElement.addClass("selected");

      // Add to history
      addHistory({ city: selectedCity.name });
      renderHistory();

      // Load weather data
      loadWeather(selectedCity.lat, selectedCity.lon, selectedCity.name);

      // Show add to favorites button
      $("#add-fav").prop("disabled", false);
    }

    // Add to favorites
    $("#add-fav").on("click", function () {
      if (selectedCity) {
        addFavorite(selectedCity);
        renderFavorites();

        // Show success feedback
        const $btn = $(this);
        const originalText = $btn.html();
        $btn.html('<i class="fas fa-check"></i> Додано!').prop("disabled", true);

        setTimeout(() => {
          $btn.html(originalText).prop("disabled", false);
        }, 2000);
      }
    });

    // Clear favorites
    $("#clear-fav").on("click", function () {
      if (confirm("Ви впевнені, що хочете очистити всі улюблені міста?")) {
        clearFavorites();
        renderFavorites();
      }
    });

    // Clear history
    $("#clear-history").on("click", function () {
      if (confirm("Ви впевнені, що хочете очистити історію пошуку?")) {
        clearHistory();
        renderHistory();
      }
    });

    // Render favorites with enhanced UI
    function renderFavorites() {
      const favs = getFavorites();
      const $favoritesContainer = $("#favorites");

      if (favs.length === 0) {
        $favoritesContainer.html(`
          <div class="empty-state">
            <i class="fas fa-heart-broken"></i>
            <p>Немає улюблених міст</p>
          </div>
        `);
        return;
      }

      let out = favs
        .map(
          (f) => `
          <li>
            <span class="favorite-city" data-lat="${f.lat}" data-lon="${f.lon}" data-name="${f.name}">
              <i class="fas fa-star"></i>
              ${f.name}
            </span>
            <button data-city="${f.name}" title="Видалити з улюблених">
              <i class="fas fa-times"></i>
            </button>
          </li>
        `
        )
        .join("");

      $favoritesContainer.html(`<ul>${out}</ul>`);

      // Add click handlers
      $favoritesContainer.find(".favorite-city").on("click", function () {
        const cityData = {
          lat: $(this).data("lat"),
          lon: $(this).data("lon"),
          name: $(this).data("name")
        };

        selectedCity = cityData;
        loadWeather(cityData.lat, cityData.lon, cityData.name);
        addHistory({ city: cityData.name });
        renderHistory();
      });

      $favoritesContainer.find("button").on("click", function (e) {
        e.stopPropagation();
        const cityName = $(this).data("city");
        removeFavorite(cityName);
        renderFavorites();
      });
    }

    // Render history with enhanced UI
    function renderHistory() {
      const hist = getHistory();
      const $historyContainer = $("#history");

      if (hist.length === 0) {
        $historyContainer.html(`
          <div class="empty-state">
            <i class="fas fa-clock"></i>
            <p>Історія порожня</p>
          </div>
        `);
        return;
      }

      let out = hist
        .map(
          (h) => `
          <li>
            <div class="history-item">
              <span class="history-city">${h.city}</span>
              <span class="history-date">${h.date}</span>
            </div>
          </li>
        `
        )
        .join("");

      $historyContainer.html(`<ul>${out}</ul>`);
    }

    // Enhanced weather loading function
    function loadWeather(lat, lon, cityName) {
      // Show loading state
      $("#weather").html(`
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin weather-icon-large"></i>
          <h3>Завантаження прогнозу...</h3>
          <p>Отримуємо дані для ${cityName}</p>
        </div>
      `);

      fetchWeatherByCoords(lat, lon)
        .then((data) => {
          const days = data.days || [];
          let out = `
            <div class="weather-header">
              <h2>
                <i class="fas fa-map-marker-alt"></i>
                Прогноз для ${cityName}
              </h2>
              <p class="weather-description">Детальний прогноз погоди на найближчі дні</p>
            </div>
          `;

          days.forEach((d, index) => {
            const iconClass = getWeatherIcon(d.conditions);
            const dateFormatted = formatDate(d.datetime);

            out += `
              <div class="weather-card ${index === 0 ? "today" : ""}">
                <div class="weather-date">
                  <h4>
                    <i class="${iconClass}"></i>
                    ${dateFormatted}
                  </h4>
                  <span class="weather-condition">${d.conditions || "Без опису"}</span>
                </div>
                
                <div class="weather-details">
                  <div class="weather-detail">
                    <div class="weather-detail-label">Температура</div>
                    <div class="weather-detail-value">
                      ${Math.round(d.tempmin)}° / ${Math.round(d.tempmax)}°C
                    </div>
                  </div>
                  
                  <div class="weather-detail">
                    <div class="weather-detail-label">Вологість</div>
                    <div class="weather-detail-value">${d.humidity ?? "—"}%</div>
                  </div>
                  
                  <div class="weather-detail">
                    <div class="weather-detail-label">Вітер</div>
                    <div class="weather-detail-value">${d.windspeed ?? "—"} м/с</div>
                  </div>
                  
                  <div class="weather-detail">
                    <div class="weather-detail-label">Опади</div>
                    <div class="weather-detail-value">${d.precip ?? 0} мм</div>
                  </div>
                  
                  <div class="weather-detail">
                    <div class="weather-detail-label">Хмарність</div>
                    <div class="weather-detail-value">${d.cloudcover ?? "—"}%</div>
                  </div>
                  
                  <div class="weather-detail">
                    <div class="weather-detail-label">Відчувається як</div>
                    <div class="weather-detail-value">${Math.round(d.feelslike ?? d.temp)}°C</div>
                  </div>
                </div>
              </div>
            `;
          });

          $("#weather").html(out);
        })
        .catch((e) => {
          console.error("Weather API Error:", e);
          $("#weather").html(`
            <div class="error-state">
              <i class="fas fa-exclamation-triangle weather-icon-large"></i>
              <h3>Помилка завантаження</h3>
              <p>Не вдалося завантажити прогноз погоди для ${cityName}. Спробуйте пізніше.</p>
              <button id="retry-weather-btn" class="retry-btn">
                <i class="fas fa-redo"></i> Спробувати знову
              </button>
            </div>
          `);

          // Add click handler for retry button
          $("#retry-weather-btn").on("click", function () {
            loadWeather(lat, lon, cityName);
          });
        });
    }

    // Initialize the app
    renderFavorites();
    renderHistory();

    // Disable add to favorites button initially
    $("#add-fav").prop("disabled", true);

    // Disable city search initially
    $("#city-search").prop("disabled", true);
  });
});
