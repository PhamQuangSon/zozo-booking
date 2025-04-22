"use server";

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { signIn } from "@/config/auth";
import prisma from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/schemas/auth-schema";

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

export type RegisterState = {
  success: boolean;
  zodErrors?: {
    _form?: string;
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (!result) {
        return {
          ...prevState,
          success: false,
          zodErrors: {
            _form: "Authentication failed. Please try again.",
          },
        } as AuthState;
      }

      if (result.error) {
        return {
          ...prevState,
          success: false,
          zodErrors: {
            _form:
              result.error === "CredentialsSignin"
                ? "Invalid email or password"
                : result.error,
          },
        } as AuthState;
      }

      return {
        ...prevState,
        success: true,
        message: "Login successful!",
        redirectUrl: "/admin/dashboard",
      } as AuthState;
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        ...prevState,
        success: false,
        zodErrors: {
          _form:
            error instanceof Error ? error.message : "Authentication failed",
        },
      } as AuthState;
    }
  } catch (error: any) {
    return {
      ...prevState,
      success: false,
      zodErrors: {
        _form: error.message || "Something went wrong",
      },
    } as AuthState;
  }
}

// Register action
export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  try {
    const validatedFields = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        success: false,
        zodErrors: validatedFields.error.flatten()
          .fieldErrors as RegisterState["zodErrors"],
        message: "Missing Fields. Failed to Register.",
      } as RegisterState;
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        ...prevState,
        success: false,
        zodErrors: {
          email: ["Email already in use"],
        },
      } as RegisterState;
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
    // For now, we'll just return the token for redirection
    console.log(
      `Verification link: ${process.env.NEXT_PUBLIC_APP_URL}/auth/verify/${verificationToken}`
    );

    return {
      ...prevState,
      success: true,
      message: "Registration successful! Please verify your email.",
      redirectUrl: `/verify/${verificationToken}`,
    } as RegisterState;
  } catch (error: any) {
    return {
      ...prevState,
      success: false,
      zodErrors: {
        _form: error.message || "Something went wrong",
      },
    } as RegisterState;
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
    console.error("Verification error:", error);
    return {
      success: false,
      error: error.message || "Something went wrong",
    };
  }
}
