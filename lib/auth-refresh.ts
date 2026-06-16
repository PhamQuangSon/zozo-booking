import prisma from "@/lib/prisma";

/**
 * Hàm xử lý xoay vòng Refresh Token
 * Trả về token mới nếu thành công, hoặc ném lỗi nếu phát hiện gian lận
 */
export async function rotateRefreshToken(oldToken: string) {
  // 1. Tìm token trong DB
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  // 2. Nếu không tìm thấy hoặc đã bị thu hồi trước đó
  if (!storedToken || storedToken.isRevoked) {
    throw new Error("Token invalid or revoked");
  }

  // 3. KIỂM TRA SỬ DỤNG LẠI (REUSE DETECTION)
  if (storedToken.isUsed) {
    // PHÁT HIỆN TẤN CÔNG: Token này đã được dùng để đổi 1 lần rồi, giờ lại xuất hiện lại.
    // Thực hiện "Nuclear Option": Thu hồi TẤT CẢ token của user này.
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId },
      data: { isRevoked: true },
    });
    throw new Error("Refresh token reuse detected! All sessions revoked.");
  }

  // 4. Kiểm tra hết hạn
  if (new Date() > storedToken.expiresAt) {
    throw new Error("Refresh token expired");
  }

  // 5. Nếu hợp lệ: Đánh dấu token cũ đã sử dụng và tạo token mới
  const newTokenValue = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Dùng transaction để đảm bảo tính toàn vẹn dữ liệu
  const [newToken] = await prisma.$transaction([
    // Tạo token mới
    prisma.refreshToken.create({
      data: {
        token: newTokenValue,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
      },
    }),
    // Đánh dấu token cũ là đã dùng
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isUsed: true },
    }),
  ]);

  return {
    token: newToken.token,
    user: storedToken.user,
  };
}

/**
 * Hàm khởi tạo Refresh Token lần đầu khi đăng nhập
 */
export async function createInitialRefreshToken(userId: string) {
  const tokenValue = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return await prisma.refreshToken.create({
    data: {
      token: tokenValue,
      userId: userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    },
  });
}

/**
 * Dọn dẹp các Refresh Token đã hết hạn hoặc đã dùng.
 * Nên chạy định kỳ (ví dụ: cron job hàng ngày).
 */
export async function purgeExpiredRefreshTokens() {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true },
        { isUsed: true },
      ],
    },
  });
  return result.count;
}
