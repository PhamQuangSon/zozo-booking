"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full text-center border-none shadow-lg glass-card">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="flex justify-center mb-6">
            <XCircle className="h-20 w-20 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled or interrupted. No charges were made.
          </p>
          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-full text-lg border-primary text-primary hover:bg-primary hover:text-white"
          >
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
