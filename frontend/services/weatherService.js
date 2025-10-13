const VC_KEY = "YSJBGSYSQPENB9XUVRGNG37YZ";
const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export async function fetchWeatherByCoords(lat, lon) {
  if (lat == null || lon == null) {
    throw new Error("Latitude and longitude are required");
  }

  const url = `${BASE_URL}/${lat},${lon}?unitGroup=metric&include=days&key=${VC_KEY}&contentType=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  return await response.json();
}
