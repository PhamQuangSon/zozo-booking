"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const t = useTranslations("Cart");
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const tableId = searchParams.get("tableId");

  const returnUrl = restaurantId && tableId ? `/restaurants/${restaurantId}/${tableId}` : "/";
  const returnText = restaurantId && tableId ? "Return to Table" : "Return to Home";

  return (
    <Card className="max-w-md w-full text-center border-none shadow-lg glass-card">
      <CardContent className="pt-10 pb-8 px-8">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-20 w-20 text-green-500 animate-bounce" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your payment. Your order has been marked as paid and the kitchen is working
          on it.
        </p>
        <Button asChild className="w-full h-12 rounded-full text-lg">
          <Link href={returnUrl}>{returnText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
