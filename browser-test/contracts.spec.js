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

test("native browser hashing matches standard vectors and stable JSON", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(fixturePath);
  const result = await page.evaluate(async () => {
    const { crc32, sha256Hex, sha256Json } = await import("/src/hash.js");
    return {
      checksum: crc32("123456789"),
      digest: await sha256Hex("abc"),
      sameJson: (await sha256Json({ z: 1, a: false })) === (await sha256Json({ a: false, z: 1 })),
    };
  });

  expect(result).toEqual({
    checksum: 0xcbf4_3926,
    digest: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    sameJson: true,
  });
  expect(errors).toEqual([]);
});
