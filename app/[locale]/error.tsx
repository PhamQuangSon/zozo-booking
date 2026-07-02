"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Runtime Error Caught by Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8 text-center bg-background">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      
      <h2 className="text-3xl font-bold tracking-tight mb-3">
        Oops! Something went wrong
      </h2>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We encountered an unexpected error while rendering this page. Our team has been notified.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button 
          onClick={() => reset()} 
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => { window.location.href = "/"; }}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}
