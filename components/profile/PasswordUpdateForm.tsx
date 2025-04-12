// components/profile/PasswordUpdateForm.tsx
"use client";

import { useEffect, useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updatePassword, type PasswordState } from "@/actions/user-actions";
import { ZodErrors } from "@/components/custom/zod-errors";

// Initial state
const initialPasswordState: PasswordState = {
  success: false,
  zodErrors: {
    _form: undefined,
    currentPassword: [],
    newPassword: [],
    confirmPassword: [],
  },
  message: null,
};

// Submit Button Component using useFormStatus
function PasswordSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        "Change Password"
      )}
    </Button>
  );
}

export function PasswordUpdateForm() {
  const [passwordState, passwordAction] = useActionState(updatePassword, initialPasswordState);
  const formRef = useRef<HTMLFormElement>(null); // Ref for resetting the form

  // Reset password form on success
  useEffect(() => {
    if (passwordState.success) {
      formRef.current?.reset(); // Reset the form using the ref
      // Optionally show a success message that disappears after a while
    }
  }, [passwordState.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      {/* Use the action prop and add ref */}
      <form action={passwordAction} ref={formRef}>
        <CardContent className="space-y-6">
          {/* Success Message */}
          {passwordState.success && passwordState.message && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{passwordState.message}</AlertDescription>
            </Alert>
          )}

          {/* General Form Error Message */}
          {passwordState.message && !passwordState.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{passwordState.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
              <ZodErrors error={passwordState?.zodErrors?.currentPassword ?? []} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required />
              <ZodErrors error={passwordState?.zodErrors?.newPassword ?? []} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
              <ZodErrors error={passwordState?.zodErrors?.confirmPassword ?? []} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {/* Use the SubmitButton component */}
          <PasswordSubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
