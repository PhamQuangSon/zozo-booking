# 🔒 Backend Database Connection - Security Best Practices

## Hiện trạng bảo mật (Current Security Status)

✅ **Đã triển khai:**
- Environment variables cho credentials (không hardcode)
- Error handling mà không expose sensitive info
- Connection pooling qua Prisma
- Retry logic với exponential backoff
- Graceful shutdown handlers
- Logging riêng cho development vs production

## 🚀 Setup Hướng dẫn

### 1. Environment Variables (.env)
```bash
# NEVER commit .env file! (Check .gitignore)
DATABASE_URL="postgresql://username:password@localhost:5432/zozo_booking"
NODE_ENV="development"  # or "production"
```

### 2. Key Security Rules

#### ✋ KHÔNG làm:
```typescript
// ❌ Hardcode credentials
const conn = "postgresql://user:pass@localhost/db";

// ❌ Log sensitive info
console.log("Connected to:", process.env.DATABASE_URL);

// ❌ Send error details to client
throw new Error(`DB Error: ${error.message}`);
```

#### ✅ PHẢI làm:
```typescript
// ✅ Use environment variables
const conn = process.env.DATABASE_URL;

// ✅ Log only in development
if (process.env.NODE_ENV === "development") {
  console.log("Query:", query);
}

// ✅ Send safe error response to client
return { error: "Database operation failed" };
```

### 3. API Route Pattern (Safe)
```typescript
// app/api/example/route.ts
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-connection";

export async function GET() {
  try {
    const data = await withRetry(async () => {
      return await prisma.user.findMany({
        select: { id: true, email: true },
        take: 10,
      });
    });

    return Response.json({ success: true, data });
  } catch (error) {
    // 🔒 Never expose error details to client
    console.error("Database error:", error);
    return Response.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
```

### 4. Server Action Pattern (Safe)
```typescript
// actions/safe-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-connection";

export async function safeAction(id: string) {
  try {
    const result = await withRetry(async () => {
      return await prisma.item.findUnique({ where: { id } });
    });

    return { success: true, data: result };
  } catch (error) {
    // 🔒 Log internally, but don't expose to client
    if (process.env.NODE_ENV === "development") {
      console.error("Action error:", error);
    }
    return { success: false, error: "Operation failed" };
  }
}
```

### 5. Connection Pool Configuration
```typescript
// lib/prisma.ts - nếu muốn tùy chỉnh pool size
new PrismaClient({
  log: ...,
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      // Prisma sẽ tự handle pooling
    },
  },
});
```

### 6. Monitoring & Logging (Safe)
```typescript
// Development: Full details
// Production: Only errors, no query logs

// Logs to write to separate file (not Git):
// logs/database-errors.log
// logs/performance-metrics.log
```

## 🛡️ Security Checklist

- [ ] `.env` file in `.gitignore`
- [ ] `DATABASE_URL` uses strong password
- [ ] No credentials in code/config files
- [ ] Error messages don't leak DB structure
- [ ] Logging disabled for production queries
- [ ] Connection pooling configured
- [ ] Retry logic for resilience
- [ ] Graceful shutdown handlers
- [ ] Input validation with Zod
- [ ] SQL injection prevention (use Prisma ORM)

## 🔄 Deployment Notes

### Local Development
```bash
npm run dev
# Uses full logging + query details
```

### Production
```bash
npm run build
npm run start
# Uses error-only logging (no queries)
```

### Environment Variables in Production
Set in your hosting platform (Vercel, Railway, Render, etc.):
```
DATABASE_URL=postgresql://prod-user:strong-password@prod-host:5432/prod-db
NODE_ENV=production
```

## 📚 References
- [Prisma Security Best Practices](https://www.prisma.io/docs/orm/more/security/security-best-practices)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Error Handling in Next.js](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
