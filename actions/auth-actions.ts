"use server"

import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"
import { signIn } from "@/config/auth"
import { loginSchema, registerSchema } from "@/schemas/auth-schema"

// Types
export type AuthState = {
  success: boolean
  zodErrors?: {
    _form?: string
    email?: string[]
    password?: string[]
  }
  message?: string
  redirectUrl?: string
}

export type RegisterState = {
  success: boolean
  zodErrors?: {
    _form?: string
    name?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
  message?: string
  redirectUrl?: string
}

// Login action
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      console.log("Validation failed:", validatedFields.error.flatten())
      return {
        ...prevState,
        zodErrors: validatedFields.error.flatten().fieldErrors as AuthState["zodErrors"],
        success: false,
        message: "Missing Fields. Failed to Login.",
      } as AuthState
    }

    const { email, password } = validatedFields.data
    console.log("Login attempt:", { email })

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        return {
          ...prevState,
          success: false,
          zodErrors: {
            _form: result.error,
          },
        } as AuthState
      }

      return {
        ...prevState,
        success: true,
        message: "Login successful!",
        redirectUrl: "/admin/dashboard",
      } as AuthState
    } catch (error) {
      console.error("Sign in error:", error)
      if (error instanceof Error) {
        return {
          ...prevState,
          success: false,
          zodErrors: {
            _form: error.message,
          },
        } as AuthState
      }
      return {
        ...prevState,
        success: false,
        zodErrors: {
          _form: "Something went wrong",
        },
      } as AuthState
    }
  } catch (error: any) {
    return {
      ...prevState,
      success: false,
      zodErrors: {
        _form: error.message || "Something went wrong",
      },
    } as AuthState
  }
}

// Register action
export async function register(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  try {
    const validatedFields = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!validatedFields.success) {
      console.log("Validation failed:", validatedFields.error.flatten())
      return {
        ...prevState,
        zodErrors: validatedFields.error.flatten().fieldErrors as RegisterState["zodErrors"],
        success: false,
        message: "Missing Fields. Failed to Register.",
      } as RegisterState
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        ...prevState,
        success: false,
        zodErrors: {
          email: ["Email already in use"],
        },
      } as RegisterState
    }

    // Hash password with bcrypt
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate verification token
    const verificationToken = uuidv4()

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        // For development, set emailVerified to current date
        emailVerified: new Date(),
      },
    })

    // In a real app, you would send an email with the verification link
    // For now, we'll just log it
    console.log(`Verification link: ${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationToken}`)

    return {
      ...prevState,
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      redirectUrl: `/verify/${verificationToken}`, // Redirect to login after successful registration
    } as RegisterState
  } catch (error: any) {
    console.error("Registration error:", error)
    return {
      ...prevState,
      success: false,
      zodErrors: {
        _form: error.message || "Something went wrong",
      },
    } as RegisterState
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
    console.error("Verification error:", error)
    return {
      success: false,
      error: error.message || "Something went wrong",
    }
  }
}
