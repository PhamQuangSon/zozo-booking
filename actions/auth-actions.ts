"use server"

import { z } from "zod"
import { createHash } from "crypto"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { signIn } from "@/config/auth"
import { AuthError } from "next-auth"

// Types
export type AuthState = {
  success: boolean;
  error?: {
    _form?: string;
    email?: string[];
    password?: string[];
  };
  message?: string;
  redirectUrl?: string;
}

// Hash password using SHA-256
const hashPassword = (password: string) => {
  return createHash('sha256').update(password).digest('hex')
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Login action
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
      try {
        const validatedFields = loginSchema.safeParse({
          email: formData.get("email"),
          password: formData.get("password"),
        })
  
        if (!validatedFields.success) {
          console.log('Validation failed:', validatedFields.error.flatten())
          return {
            success: false,
            error: validatedFields.error.flatten().fieldErrors as AuthState['error'],
          } as AuthState
        }
  
        const { email, password } = validatedFields.data
        console.log('Login attempt:', { email })
  
       try {
         await signIn("credentials", {
           email,
           password,
           redirect: false,
         })
  
        //  revalidatePath("/admin/dashboard")
         return {
           success: true,
           message: "Login successful!",
           redirectUrl: "/admin/dashboard"
         } as AuthState
       } catch (error) {
         console.error('Sign in error:', error)
         if (error instanceof AuthError) {
           return {
             success: false,
             error: {
               _form: "Invalid credentials",
             },
           } as AuthState
         }
         return {
           success: false,
           error: {
             _form: "Something went wrong",
           },
         } as AuthState
       }
     } catch (error: any) {
       return {
         success: false,
         error: {
           _form: error.message || "Something went wrong",
         },
       } as AuthState
     }
}

// Register action
export async function register(prevState: any, formData: FormData) {
  try {
    const validatedFields = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        error: {
          email: ["Email already in use"],
        },
      }
    }

    // Hash password using SHA-256
    const hashedPassword = hashPassword(password)

    // Generate verification token
    const verificationToken = uuidv4()

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
      },
    })

    // In a real app, you would send an email with the verification link
    // For now, we'll just log it
    console.log(`Verification link: ${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationToken}`)

    return {
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
    }
  } catch (error: any) {
    return {
      success: false,
      error: {
        _form: error.message || "Something went wrong",
      },
    }
  }
}

// Verify email action
export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    })

    if (!user) {
      return {
        success: false,
        error: "Invalid verification token",
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    })

    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Something went wrong",
    }
  }
}

