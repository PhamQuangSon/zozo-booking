// components/profile/ProfileUpdateForm.tsx
"use client";

import type React from "react";
import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Camera, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateProfile, type ProfileState } from "@/actions/user-actions";
import { Textarea } from "@/components/ui/textarea";
import { ZodErrors } from "@/components/custom/zod-errors";

// Initial state
const initialProfileState: ProfileState = {
  success: false,
  zodErrors: {
    _form: undefined,
    name: [],
    bio: [],
    image: [],
  },
  image: null,
  message: null,
};

// Submit Button Component using useFormStatus
function ProfileSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}

export function ProfileUpdateForm() {
  const { data: session, update: updateSession } = useSession(); // Get session and update function
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState<string>(""); // Keep for controlled input

  // Use useActionState for the profile form
  const [profileState, profileAction] = useActionState(updateProfile, initialProfileState);

  // Initialize form fields from session
  useEffect(() => {
    if (session) {
      if (session.user?.image) {
        setAvatarUrl(session.user.image);
      } else if (session.user?.name) {
        // Generate fallback avatar URL only if no image exists
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=random`);
      } else {
        setAvatarUrl(null); // Ensure null if no image or name
      }
      setBio(session.user?.bio || "");
    }
  }, [session]); // Depend only on session

  // Handle session update after successful profile change
  useEffect(() => {
    if (profileState.success) {
      console.log("Profile update successful, triggering client session update...");
      updateSession(); // Trigger client-side session refresh
      // Optionally show a success message that disappears or reset form state if needed
    }
  }, [profileState.success, updateSession]); // Add updateSession to dependencies

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // No need to keep avatarFile state if input has name="avatar"
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string); // Update preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="bg-gradient-to-b from-amber-50 to-white">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      {/* Use the action prop */}
      <form action={profileAction}>
        <CardContent className="space-y-6">
          {/* Profile picture */}
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={session?.user?.name || "User"} />
                ) : (
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label htmlFor="avatar-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                  <span className="sr-only">Upload avatar</span>
                  {/* IMPORTANT: Add name="avatar" to the file input */}
                  <input
                    id="avatar-upload"
                    name="avatar" // <-- Add name attribute
                    type="file"
                    accept="image/jpeg, image/png, image/webp, image/gif" // More specific types
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-medium">{session?.user?.name}</h3>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              <p className="text-xs text-muted-foreground">Role: {session?.user?.role || "User"}</p>
            </div>
          </div>
          {/* Display Zod error for avatar if any */}
          <ZodErrors error={profileState?.zodErrors?.image ?? []} />

          <Separator />
          {/* Success Message */}
          {profileState.success && profileState.message && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{profileState.message}</AlertDescription>
            </Alert>
          )}

          {/* General Form Error Message */}
          {profileState.message && !profileState.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{profileState.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={session?.user?.name || ""} placeholder="Your name" />
              <ZodErrors error={profileState?.zodErrors?.name ?? []} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={session?.user?.email || ""}
                placeholder="Your email"
                disabled // Keep disabled
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {/* Add name="bio" to the textarea */}
            <Textarea
              id="bio"
              name="bio" // <-- Add name attribute
              value={bio} // Controlled component
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
            <ZodErrors error={profileState?.zodErrors?.bio ?? []} />
          </div>
        </CardContent>
        <CardFooter>
          {/* Use the SubmitButton component */}
          <ProfileSubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
