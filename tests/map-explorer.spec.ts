import { test, expect } from "@playwright/test";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3002";

test.beforeEach(async ({ page }) => {
  await page.goto(baseURL);
  await page.getByRole("button", { name: "Find", exact: true }).click();
});

test("L1 uses the curved map with searchable stores and adjacent-floor connections", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Show Level 1", exact: true }).click();
  await expect(page.locator(".reference-floor")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View Apple", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View Mobile Snap", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "View lift connections on Level 1",
      exact: true,
    })
    .click();
  const connections = page.getByRole("region", { name: "Floor connections" });
  await expect(
    connections.getByRole("button", { name: /Ground Floor/ }),
  ).toBeVisible();
  await expect(
    connections.getByRole("button", { name: /Level 2/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close floor connections" }).click();
  await page
    .getByRole("textbox", { name: "Search stores and amenities" })
    .fill("Apple");
  await page
    .getByRole("button", { name: "Apple Level 1 · Electronics", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Apple", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Directions", exact: true }).click();
  await page.getByRole("checkbox", { name: "Accessible" }).check();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const qrDialog = page.getByRole("dialog", {
    name: "Scan directions QR code",
  });
  await expect(qrDialog).toBeVisible();
  await expect(
    qrDialog.getByRole("img", { name: /directions to Apple/ }),
  ).toBeVisible();
  const mobileLink = await qrDialog.locator("code").getAttribute("title");
  expect(mobileLink).toContain("destination=ref-l1-apple");
  expect(mobileLink).toContain("origin=n-g-start");
  expect(mobileLink).toContain("accessible=1");
  expect(mobileLink).not.toContain("localhost");
  await qrDialog.getByRole("button", { name: "Continue on kiosk" }).click();
  await expect(
    page
      .locator(".explorer-step")
      .filter({ hasText: "Take the lift to Level 1." }),
  ).toHaveCount(1);
});

test("upper-floor brands and working vertical connector controls", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Show Level 2", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "View Mobile Snap", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View Samsung", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "View escalator connections on Level 2",
      exact: true,
    })
    .click();
  const connections = page.getByRole("region", { name: "Floor connections" });
  await connections.getByRole("button", { name: /Level 3/ }).click();
  await expect(
    page.getByRole("button", { name: "Show Level 3", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "View Samsung", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "View stairs connections on Level 3",
      exact: true,
    })
    .click();
  await expect(
    connections.getByRole("button", { name: /Level 2/ }),
  ).toBeVisible();
  await expect(
    connections.getByRole("button", { name: /Level 4/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Close floor connections" }).click();
  await page
    .getByRole("button", {
      name: "View lift connections on Level 3",
      exact: true,
    })
    .click();
  await expect(
    connections.getByRole("button", { name: /Step-free/ }),
  ).toBeVisible();
});

test("directory stays open by default, on repeated search clicks and after closing details", async ({
  page,
}) => {
  const directory = page.getByRole("region", { name: "Search the mall" });
  const input = page.getByRole("textbox", {
    name: "Search stores and amenities",
  });
  await expect(directory).toBeVisible();
  await expect(page.getByRole("button", { name: "Close search" })).toHaveCount(
    0,
  );
  for (let i = 0; i < 2; i++) {
    await page
      .getByRole("button", { name: "Search the mall", exact: true })
      .click();
    await expect(directory).toBeVisible();
    await expect(input).toBeFocused();
  }
  await page.keyboard.press("Escape");
  await expect(directory).toBeVisible();
  await input.fill("Perfumes");
  await page.locator(".explorer-search-result").click();
  await page.getByRole("button", { name: "Close place details" }).click();
  await expect(directory).toBeVisible();
  await expect(input).toHaveValue("Perfumes");
});

test("reference map store selection, highlight and directions", async ({
  page,
}) => {
  await expect(page.locator(".reference-floor")).toBeVisible();
  const pin = page.getByRole("button", {
    name: "View Perfumes 4 U",
    exact: true,
  });
  await pin.click();
  await expect(pin).toHaveClass(/selected/);
  await expect(
    page.getByRole("heading", { name: "Perfumes 4 U", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Directions", exact: true }).click();
  await expect(page.locator(".explorer-route-line").first()).toBeVisible();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Continue on kiosk" }).click();
  await expect(
    page.locator('.explorer-step[aria-current="step"]'),
  ).toBeVisible();
});

test("header search, filtering, details and accessible guided route", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await expect(
    page.getByRole("textbox", { name: "Search stores and amenities" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Search the mall", exact: true })
    .click();
  const search = page.getByRole("textbox", {
    name: "Search stores and amenities",
  });
  await expect(search).toBeFocused();
  await search.fill("not-a-real-place");
  await expect(page.getByText("No places found")).toBeVisible();
  await search.fill("Atelier");
  await page.locator(".explorer-search-result").click();
  await expect(
    page.getByRole("heading", { name: "Atelier Home", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Directions", exact: true }).click();
  await page.getByRole("checkbox", { name: "Accessible" }).check();
  await expect(page.locator(".explorer-route-line").first()).toBeVisible();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Continue on kiosk" }).click();
  await expect(
    page.getByRole("button", { name: "Previous direction" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next direction" }).click();
  await page
    .locator(".explorer-step")
    .filter({ hasText: "Take the lift to Level 1." })
    .click();
  await expect(
    page.getByRole("button", { name: "Show Level 1" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Next direction" }).click();
  await expect(
    page.getByRole("button", { name: "Show Level 2" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Next direction" }).click();
  await page.getByRole("button", { name: "Next direction" }).click();
  await page.locator(".explorer-step").last().click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.getByLabel("Step-by-step directions")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Search the mall" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile search, amenities, floor filter, map controls and Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Search the mall", exact: true })
    .click();
  await page.getByRole("tab", { name: "Amenities" }).click();
  await page
    .locator(".explorer-search-result")
    .filter({ hasText: "ATM" })
    .click();
  await expect(
    page.getByRole("heading", { name: "ATM", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Search the mall", exact: true })
    .click();
  await page.getByRole("tab", { name: "Popular" }).click();
  await page.getByRole("button", { name: "Search filters" }).click();
  await page.getByLabel("Filter by floor").selectOption("l2");
  await expect(
    page.locator(".explorer-search-result").filter({ hasText: "Atelier Home" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Show Level 2" }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Fit map", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("phone handoff uses the current kiosk map and compact guidance", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `${baseURL}/go?destination=apple&origin=n-g-start&accessible=1`,
  );
  await expect(page.getByText("Mobile directions")).toBeVisible();
  await expect(page.getByLabel("Current route map")).toBeVisible();
  await expect(page.locator(".go-map .reference-floor")).toBeVisible();
  await expect(page.locator(".go-map .map-canvas")).toHaveCount(0);
  await expect(page.getByText(/Step 1 of/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-route.png",
    fullPage: true,
  });
});
