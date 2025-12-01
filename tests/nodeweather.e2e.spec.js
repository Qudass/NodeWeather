import { test, expect } from "@playwright/test";

const backendUrl = "http://localhost:4000";

test.describe("NodeWeather E2E", () => {
  test.beforeAll(async ({ request }) => {
    await request.delete(`${backendUrl}/api/favorites`);
    await request.delete(`${backendUrl}/api/history`);
  });

  test("Full flow: select country → city → weather → favorites → history", async ({
    page,
  }) => {
    await page.goto("/");

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await page.selectOption("#country-select", { label: "🇺🇦 Україна" });

    const firstCity = page.locator("#city-list p").first();
    await expect(firstCity).toBeVisible({ timeout: 15000 });

    const cityName = (await firstCity.textContent())?.trim();
    await firstCity.click();

    const forecastHeading = page.getByRole("heading", {
      level: 2,
      name: new RegExp(`Прогноз для\\s+${cityName}`),
    });
    await expect(forecastHeading).toBeVisible();

    await page.locator("#add-fav").click();

    await expect(page.locator("#favorites")).toContainText(cityName);
    await expect(page.locator("#history")).toContainText(cityName);
  });
});
