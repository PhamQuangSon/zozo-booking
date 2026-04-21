"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// global-error must include its own html and body tags
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center bg-background">
          <div className="rounded-full bg-destructive/10 p-6 mb-6">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Critical System Error
          </h2>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            The application encountered a fatal error and could not recover. 
            Please try reloading the page.
          </p>

          <Button 
            onClick={() => reset()} 
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Application
          </Button>
        </div>
      </body>
    </html>
  );
}
