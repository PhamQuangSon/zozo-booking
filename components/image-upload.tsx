"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // In a real app, you would upload the file to a storage service
    // and get back a URL to store in your database
    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll just use the object URL
      // In a real app, replace this with your actual upload logic
      onChange(objectUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Handle error
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col items-center gap-4">
        {preview ? (
          <div className="relative h-40 w-full overflow-hidden rounded-md border">
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
              className="absolute right-2 top-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
            onClick={handleButtonClick}
          >
            <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload an image
            </p>
          </div>
        )}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        )}
      </div>
    </div>
  );
}
