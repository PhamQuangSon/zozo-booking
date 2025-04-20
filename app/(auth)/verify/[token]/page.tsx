"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";

import { verifyEmail } from "@/actions/auth-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!token) {
          setVerificationResult({
            success: false,
            error: "Invalid verification token",
          });
          return;
        }

        const result = await verifyEmail(token);
        setVerificationResult(result);
      } catch (error) {
        setVerificationResult({
          success: false,
          error: "An unexpected error occurred",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Verifying your email...
              </p>
            </div>
          ) : verificationResult?.success ? (
            <Alert className="bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                {verificationResult.message ||
                  "Your email has been verified successfully!"}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {verificationResult?.error ||
                  "Failed to verify your email. Please try again."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/login")} disabled={isVerifying}>
            {verificationResult?.success ? "Proceed to Login" : "Back to Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
