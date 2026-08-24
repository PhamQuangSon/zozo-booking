import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    // Bỏ qua thư mục e2e (của Playwright) khi chạy Vitest
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
