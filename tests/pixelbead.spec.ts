import path from "node:path";
import { expect, test } from "@playwright/test";

test("converts a local image into an exportable bead pattern", async ({ page }) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "tests/fixtures/two-color.png"));
  await expect(page.getByRole("heading", { name: /裁剪图片|Crop image/i })).toBeVisible();
  await page.getByRole("button", { name: /确认裁剪|Confirm crop/i }).click();
  await expect(page.getByRole("heading", { name: /预览点阵图|Preview pattern/i })).toBeVisible();
  await expect(page.getByText(/#/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /导出 PNG|Export PNG/i })).toBeVisible();
});
