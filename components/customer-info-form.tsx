"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerInfoFormProps {
  onSubmit: () => void;
}

export function CustomerInfoForm({ onSubmit }: CustomerInfoFormProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Load saved customer info from localStorage
  useEffect(() => {
    if (!session) {
      const savedName = localStorage.getItem("customerName");
      const savedEmail = localStorage.getItem("customerEmail");
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
    }
  }, [session]);

  // If user is logged in, use their info and disable the form
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to localStorage for future use
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerEmail", email);

    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={!!session?.user}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              disabled={!!session?.user}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Information
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
