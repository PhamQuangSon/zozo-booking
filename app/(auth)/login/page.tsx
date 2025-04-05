"use client"
import { useActionState, useLayoutEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/actions/auth-actions"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import type
import type { AuthState } from "@/actions/auth-actions"
import { ZodErrors } from "@/components/custom/zod-errors";

// Initial state with proper type
const initialState: AuthState = {
  success: false,
  zodErrors: {
    _form: undefined,
    email: [],
    password: [],
  },
  message: undefined,
  redirectUrl: undefined
}

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Logging in..." : "Login"}
    </Button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [formState, formAction] = useActionState(login, initialState)

  // Handle redirect after successful login
  useLayoutEffect(() => {
    if (formState?.success && formState?.redirectUrl) {
      router.push(formState.redirectUrl)
    }
  }, [formState?.success, formState?.redirectUrl, router])
  
  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form action={formAction} method="POST">
          <CardContent className="space-y-4">
            {formState.zodErrors?._form && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formState.zodErrors._form}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
              <ZodErrors error={formState?.zodErrors?.email ?? []} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
              <ZodErrors error={formState?.zodErrors?.password ?? []} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton />
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
