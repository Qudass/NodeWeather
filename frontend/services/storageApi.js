const API_BASE = "http://localhost:4000/api";

async function requestJson(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("API error:", response.status, text);
    throw new Error(`API request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

// ---------- Favorites ----------

// { name: string, lat: number, lon: number }
export async function addFavorite(city) {
  return requestJson("/favorites", {
    method: "POST",
    body: JSON.stringify({
      name: city.name,
      lat: city.lat,
      lon: city.lon
    })
  });
}

export async function getFavorites() {
  return requestJson("/favorites", {
    method: "GET"
  });
}

export async function removeFavorite(cityName) {
  const encoded = encodeURIComponent(cityName);
  return requestJson(`/favorites/${encoded}`, {
    method: "DELETE"
  });
}

export async function clearFavorites() {
  return requestJson("/favorites", {
    method: "DELETE"
  });
}

// ---------- History ----------

// record: { city: string, date?: string, temp?: number, conditions?: string }
export async function addHistory(record) {
  const payload = {
    city: record.city,
    date: record.date,
    temp: record.temp,
    conditions: record.conditions
  };

  return requestJson("/history", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getHistory() {
  return requestJson("/history", {
    method: "GET"
  });
}

export async function clearHistory() {
  return requestJson("/history", {
    method: "DELETE"
  });
}
