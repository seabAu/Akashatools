import { expect, test } from "@playwright/test";

const fixturePath = "/fixtures/browser/download.html";

function collectBrowserErrors(page) {
  const errors = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

test("runtime guards pass for native and foreign-realm browser values", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(fixturePath);
  await expect(page.locator("#status")).toHaveText("guards:pass");
  expect(errors).toEqual([]);
});

test("JSON download uses the safe filename and defers URL revocation", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(fixturePath);
  await expect(page.locator("#status")).toHaveText("guards:pass");
  await page.getByRole("button", { name: "Download JSON fixture" }).click();

  await expect(page.locator("#status")).toHaveText("browser-fixture.json|revoked:1|guards:pass");
  expect(errors).toEqual([]);
});
