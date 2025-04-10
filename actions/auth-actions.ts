"use server"
import { signIn } from "@/config/auth"
import { AuthError } from "next-auth"
import { loginSchema } from "@/schemas/auth-schema"

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

// Debug helper
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔍 Auth Action Debug: ${message}`, data || "")
  }
}

// Login action
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  debugLog("Login action started", { formDataExists: !!formData })

  try {
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      debugLog("Validation failed", validatedFields.error.flatten())
      return {
        ...prevState,
        zodErrors: validatedFields.error.flatten().fieldErrors as AuthState["zodErrors"],
        success: false,
        message: "Missing Fields. Failed to Login.",
      } as AuthState
    }

    const { email, password } = validatedFields.data
    debugLog("Login attempt with validated data", { email })

    try {
      debugLog("Calling signIn function")
      const responseData = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      debugLog("Sign in response", responseData)

      if (responseData?.error) {
        debugLog("Sign in error from response", responseData.error)
        return {
          ...prevState,
          success: false,
          zodErrors: {
            _form: "Invalid credentials",
          },
        } as AuthState
      }

      debugLog("Login successful, redirecting")
      return {
        ...prevState,
        success: true,
        message: "Login successful!",
        redirectUrl: "/admin/dashboard",
      } as AuthState
    } catch (error) {
      debugLog("Sign in error caught", error)
      if (error instanceof AuthError) {
        return {
          ...prevState,
          success: false,
          zodErrors: {
            _form: "Invalid credentials",
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
    debugLog("Unexpected error in login action", error)
    return {
      ...prevState,
      success: false,
      zodErrors: {
        _form: error.message || "Something went wrong",
      },
    } as AuthState
  }
}

// Register action and other functions remain the same...
