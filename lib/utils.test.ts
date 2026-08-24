import { describe, expect, it } from "vitest";
import { cn, formatDate, safeParseJSON } from "./utils";

describe("utils.ts - Unit Tests", () => {
  describe("cn (tailwind-merge & clsx)", () => {
    it("should merge tailwind classes correctly", () => {
      // clsx behavior
      expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
      // tailwind-merge behavior (overriding)
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });
  });

  describe("formatDate", () => {
    it("should format date to time string", () => {
      const testDate = "2024-01-01T15:30:00.000Z";
      // Chú ý: Kết quả có thể phụ thuộc vào timezone của máy chạy test, 
      // ở đây ta chỉ kiểm tra xem nó có trả về chuỗi hợp lệ không.
      const formatted = formatDate(testDate);
      expect(typeof formatted).toBe("string");
      expect(formatted).not.toBe("Invalid Date");
    });
  });

  describe("safeParseJSON", () => {
    it("should parse valid JSON successfully", () => {
      const result = safeParseJSON('{"name":"Son"}', { name: "Default" });
      expect(result).toEqual({ name: "Son" });
    });

    it("should return fallback for invalid JSON", () => {
      const result = safeParseJSON('invalid-json', { name: "Default" });
      expect(result).toEqual({ name: "Default" });
    });

    it("should return fallback for null input", () => {
      const result = safeParseJSON(null, { name: "Default" });
      expect(result).toEqual({ name: "Default" });
    });
  });
});
