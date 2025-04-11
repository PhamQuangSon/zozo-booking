"use client"
import { useActionState, useLayoutEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/actions/auth-actions"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ZodErrors } from "@/components/custom/zod-errors"

// Import type
import type { RegisterState } from "@/actions/auth-actions"

// Initial state with proper type
const initialState: RegisterState = {
  success: false,
  zodErrors: {
    _form: undefined,
    name: [],
    email: [],
    password: [],
    confirmPassword: [],
  },
  message: undefined,
  redirectUrl: undefined,
}

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Creating account..." : "Register"}
    </Button>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [formState, formAction] = useActionState(register, initialState)

  // Update the useLayoutEffect to handle the redirect to verification page
  useLayoutEffect(() => {
    if (formState?.success && formState?.redirectUrl) {
      router.push(formState.redirectUrl)
    }
  }, [formState?.success, formState?.redirectUrl, router])

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to create a new account</CardDescription>
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
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required />
              <ZodErrors error={formState?.zodErrors?.name ?? []} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
              <ZodErrors error={formState?.zodErrors?.email ?? []} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              <ZodErrors error={formState?.zodErrors?.password ?? []} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
              <ZodErrors error={formState?.zodErrors?.confirmPassword ?? []} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
