import { expect, test } from "@playwright/test";

test("loads the PixelBead entry screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /PixelBead/i })).toBeVisible();
  await expect(page.getByLabel(/upload image|上传图片/i)).toBeVisible();
});
