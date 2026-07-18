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

test("portable paths retain Unicode and collision contracts in browsers", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(fixturePath);
  const result = await page.evaluate(async () => {
    const { normalizePortableRelativePath, normalizePortableRelativePaths } = await import("/src/validation.js");
    let collisionRejected = false;
    try {
      normalizePortableRelativePaths(["Files/A.txt", "files/a.TXT"]);
    } catch (error) {
      collisionRejected = error instanceof RangeError;
    }
    return {
      normalized: normalizePortableRelativePath("cafe\u0301\\menu.txt", { allowBackslash: true }),
      collisionRejected,
    };
  });

  expect(result).toEqual({ normalized: "caf\u00e9/menu.txt", collisionRejected: true });
  expect(errors).toEqual([]);
});

test("timer controls coalesce results and cancel pending browser work", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(fixturePath);
  const result = await page.evaluate(async () => {
    const { debounce, throttle } = await import("/src/function.js");
    const calls = [];
    const debounced = debounce((value) => {
      calls.push(`debounce:${value}`);
      return value;
    }, 0);
    const first = debounced("first");
    const latest = debounced("latest");

    const throttled = throttle(
      (value) => {
        calls.push(`throttle:${value}`);
        return value;
      },
      0,
      { leading: false },
    );
    const queued = throttled("queued");

    const cancelled = debounce(() => "unused", 1_000);
    const cancellation = cancelled("unused").catch((error) => error.name);
    cancelled.cancel();

    return {
      sameDebouncePromise: first === latest,
      debounceResult: await latest,
      throttleResult: await queued,
      cancellation: await cancellation,
      calls,
    };
  });

  expect(result).toEqual({
    sameDebouncePromise: true,
    debounceResult: "latest",
    throttleResult: "queued",
    cancellation: "AbortError",
    calls: ["debounce:latest", "throttle:queued"],
  });
  expect(errors).toEqual([]);
});

test("browser controls, media preferences, and JSON storage compose safely", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(fixturePath);
  const result = await page.evaluate(async () => {
    const { inputValueFromControl, prefersColorScheme, readJsonStorage, writeJsonStorage } =
      await import("/src/browser.js");
    const { createInputValueParser } = await import("/src/input.js");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = false;
    const number = document.createElement("input");
    number.type = "number";
    number.value = "12.50";
    const select = document.createElement("select");
    select.multiple = true;
    for (const value of ["one", "two"]) {
      const option = document.createElement("option");
      option.value = value;
      option.selected = true;
      select.append(option);
    }
    const file = document.createElement("input");
    file.type = "file";
    const transfer = new DataTransfer();
    transfer.items.add(new File(["browser"], "browser.txt", { type: "text/plain" }));
    file.files = transfer.files;

    const key = `akashatools-${crypto.randomUUID()}`;
    const serialized = writeJsonStorage(localStorage, key, { active: false, count: 0 });
    const stored = readJsonStorage(localStorage, key);
    localStorage.removeItem(key);
    return {
      dark: prefersColorScheme("dark"),
      checkbox: inputValueFromControl(checkbox),
      number: inputValueFromControl(number, createInputValueParser(Number)),
      selected: inputValueFromControl(select),
      filename: inputValueFromControl(file).name,
      serialized,
      stored,
    };
  });

  expect(result).toEqual({
    dark: true,
    checkbox: false,
    number: 12.5,
    selected: ["one", "two"],
    filename: "browser.txt",
    serialized: '{"active":false,"count":0}',
    stored: { active: false, count: 0 },
  });
  expect(errors).toEqual([]);
});
