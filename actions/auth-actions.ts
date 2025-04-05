"use server";

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn } from "@/config/auth";
import { AuthError } from "next-auth";
import { loginSchema, registerSchema, type LoginFormValues } from "@/schemas/auth-schema"

// Types
export type AuthState = {
  success: boolean;
  zodErrors?: {
    _form?: string;
    email?: string[];
    password?: string[];
  };
  message?: string;
  redirectUrl?: string;
};

// Login action
export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      console.log("Validation failed:", validatedFields.error.flatten());
      return {
        ...prevState,
        zodErrors: validatedFields.error.flatten()
          .fieldErrors as AuthState["zodErrors"],
        success: false,
        message: "Missing Fields. Failed to Login.",
      } as AuthState;
    }

    const { email, password } = validatedFields.data;
    console.log("Login attempt:", { email });

    try {
      const responseData = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      return {
        ...prevState,
        success: true,
        message: "Login successful!",
        redirectUrl: "/admin/dashboard",
      } as AuthState;
    } catch (error) {
      console.error("Sign in error:", error);
      if (error instanceof AuthError) {
        return {
          ...prevState,
          success: false,
          error: {
            _form: "Invalid credentials",
          },
        } as AuthState;
      }
      return {
        ...prevState,
        success: false,
        error: {
          _form: "Something went wrong",
        },
      } as AuthState;
    }
  } catch (error: any) {
    return {
      ...prevState,
      success: false,
      error: {
        _form: error.message || "Something went wrong",
      },
    } as AuthState;
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
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: {
          email: ["Email already in use"],
        },
      };
    }
    
    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
      },
    });

    // In a real app, you would send an email with the verification link
    // For now, we'll just log it
    console.log(
      `Verification link: ${process.env.NEXT_PUBLIC_APP_URL}/verify/${verificationToken}`
    );

    return {
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        _form: error.message || "Something went wrong",
      },
    };
  }
}

// Verify email action
export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid verification token",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Something went wrong",
    };
  }
}
