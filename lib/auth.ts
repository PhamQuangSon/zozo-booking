import prisma from "@/lib/prisma"
import { auth } from "@/config/auth"

export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return null
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email as string,
    },
  })

  if (!currentUser) {
    return null
  }

  return {
    ...currentUser,
    createdAt: currentUser.createdAt.toISOString(),
    updatedAt: currentUser.updatedAt.toISOString(),
    emailVerified: currentUser.emailVerified?.toISOString() || null,
  }
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN"
}
