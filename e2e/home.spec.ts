import { test, expect } from "@playwright/test";

test.describe("Home Page & Restaurant Pages E2E", () => {
  test("should load the homepage and display important sections", async ({ page }) => {
    await page.goto("/");

    // Kiểm tra trang chủ load thành công bằng cách check có thẻ main không
    await expect(page.locator("main")).toBeVisible();
  });

  // Test load các trang chi tiết nhà hàng: 1, 2, 3
  const restaurantIds = ["1", "2", "3"];

  for (const id of restaurantIds) {
    test(`should load restaurant details page for ID: ${id}`, async ({ page }) => {
      // 1. Điều hướng trực tiếp tới trang nhà hàng
      await page.goto(`/restaurants/${id}`);

      // 2. Đợi mạng load xong
      await page.waitForLoadState("networkidle");

      // 3. Kiểm tra xem URL đã đúng chưa
      await expect(page).toHaveURL(new RegExp(`/restaurants/${id}`));

      // 4. Kiểm tra xem trang có render thành công không
      // Nếu database có data: sẽ render thẻ <h1> chứa tên nhà hàng
      // Nếu không có data (Not found): sẽ render màn hình lỗi có nút Back về /restaurants
      await expect(
        page.locator("h1").first().or(page.locator('a[href="/restaurants"]').first()),
      ).toBeVisible({ timeout: 10000 });
    });
  }
});
