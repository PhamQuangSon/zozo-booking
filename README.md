# Next.js template

### Môi trường chạy dự án: Node.js v20.14.0

https://nodejs.org/download/release/v20.14.0/

===

Các bước cài đặt: (chế độ development)

1. clone code
2. cài đặt thư viện: npm i
3. Update file .env.development (nếu cần thiết)
4. Chạy dự án: npm run dev

===

Cách chạy tại chế độ production:

1. clone code
2. cài đặt thư viện: npm i
3. Update file .env.production (nếu cần thiết)
4. Build dự án: npm run build
5. Chạy dự án: npm run start

Install database example: node --loader ts-node/esm prisma/seed.ts
Not use: npx prisma db drop --force

1. Run Migrations: npx prisma migrate dev --name init
2. Run Seed: node --loader ts-node/esm prisma/seed.ts

... fix eslint: pnpm exec eslint . --ext .js,.jsx,.ts,.tsx --fix

===

Code conventions (Zozo Booking):

- Mặc định dùng Server Components trong `app/`; chỉ thêm `"use client"` khi cần.
- Sử dụng TypeScript cho tất cả file mới; đặt type gần nơi dùng.
- Dùng `cn` trong `lib/utils.ts` để gộp `className`.
- UI dùng chung đặt trong `components/`; UI theo tính năng đặt gần route trong `app/`.
- Truy cập database qua Prisma helpers trong `lib/` (ví dụ `lib/prisma.ts`).
- API routes đặt trong `app/api` và validate input bằng `zod` khi phù hợp.
- Ưu tiên component nhỏ, dễ test; tránh side effects trong render.

Testing:
- Chạy kiểm tra nhanh: `npm run test`

```
📂 restaurant-ordering
├── 📂 app
│   └── 📂 api
│       ├── 📂 auth (Xử lý đăng nhập admin)
│       ├── 📂 orders (CRUD đơn hàng)
│       ├── 📂 restaurants (Danh sách nhà hàng, menu)
│       └── 📂 likes (Thích và đánh giá món ăn)
├── 📂 components (Re-usable UI với ShadCN & Tailwind)
├── 📂 lib (Chứa Prisma client, helpers)
├── 📂 prisma (Schema database & migrations)
├── 📂 public (Chứa ảnh menu, icon, assets)
├── 📂 styles (Global styles)
├── 📂 utils (Các hàm utility)
├── 📜 .env (Biến môi trường)
├── 📜 next.config.js
├── 📜 package.json
├── 📜 prisma/schema.prisma (Schema DB)
└── 📜 tailwind.config.js
```

===

1. An admin user (email: [admin@example.com](mailto:admin@example.com), password: admin123)
2. A regular user (email: [user@example.com](mailto:user@example.com), password: user123)
3. A sample restaurant

<div align="center">
    <img src="./public/ui-screenshot-1.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-2.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-3.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-4.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-5.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-6.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-7.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-8.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-9.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-10.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-11.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-12.png" alt="UI Screenshot">
</div>
<div align="center">
    <img src="./public/ui-screenshot-13.png" alt="UI Screenshot">
</div>
