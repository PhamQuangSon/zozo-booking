"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to a storage service
    // For now, we'll just create a local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(objectUrl);

    // In a real implementation, you would do something like:
    // const formData = new FormData()
    // formData.append('file', file)
    // const response = await fetch('/api/upload', { method: 'POST', body: formData })
    // const data = await response.json()
    // onChange(data.url)
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="image" className="cursor-pointer">
          {preview ? (
            <div className="relative h-40 w-40 rounded-md overflow-hidden border">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </Label>
      </div>
      <Input
        id="image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => document.getElementById("image")?.click()}
        disabled={disabled}
      >
        {preview ? "Change Image" : "Upload Image"}
      </Button>
    </div>
  );
}
