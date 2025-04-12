"use client"

import type React from "react"
import { useState, useEffect, useActionState } from "react"
import { useFormStatus } from "react-dom" // Import useFormStatus
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Camera, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateProfile, updatePassword, type ProfileState, type PasswordState } from "@/actions/user-actions"
import { Textarea } from "@/components/ui/textarea"
import { ZodErrors } from "@/components/custom/zod-errors"

// Initial states
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
}
const initialPasswordState: PasswordState = {
  success: false,
  zodErrors: {
    _form: undefined,
    currentPassword: [],
    newPassword: [],
    confirmPassword: [],
  },
  message: null,
}

// Submit Button Component using useFormStatus
function ProfileSubmitButton() {
  const { pending } = useFormStatus()
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
  )
}

function PasswordSubmitButton() {
  const { pending } = useFormStatus()
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
  )
}

// --- Helper Wrapper for updateProfile if needed ---
// If updateProfile doesn't match useActionState signature (prevState, formData)
// You might need a wrapper, or modify updateProfile itself.
// Assuming updateProfile is modified or already compatible.

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null) // Keep for preview, but ensure input has name="avatar"
  const [bio, setBio] = useState<string>("") // Keep for controlled input

  // Use useActionState for forms
  const [profileState, profileAction] = useActionState(updateProfile, initialProfileState)
  const [passwordState, passwordAction] = useActionState(updatePassword, initialPasswordState)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Initialize form fields from session
  useEffect(() => {
    if (session) {
      if (session.user?.image) {
        setAvatarUrl(session.user.image)
      } else if (session.user?.name) {
        setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=random`)
      }
      setBio(session.user?.bio || "")
    }
  }, [session])

  // Handle session update after successful profile change
  useEffect(() => {
    if (profileState.success) {
      // The session will be automatically updated by the server action
      // We can either wait for the session to update naturally
      // or force a refresh of the session data
      update()
    }
  }, [profileState.success])

  // Reset password form on success
  useEffect(() => {
    if (passwordState.success) {
      // Find the form and reset it
      const form = document.getElementById("password-update-form") as HTMLFormElement
      form?.reset()
    }
  }, [passwordState.success])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file) // Keep for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer w-full h-full flex items-center justify-center"
                      >
                        <Camera className="h-5 w-5 text-white" />
                        <span className="sr-only">Upload avatar</span>
                        {/* IMPORTANT: Add name="avatar" to the file input */}
                        <input
                          id="avatar-upload"
                          name="avatar" // <-- Add name attribute
                          type="file"
                          accept="image/*"
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

                <Separator />
                {profileState.success && (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Profile updated successfully! The page will refresh to show your changes.
                    </AlertDescription>
                  </Alert>
                )}

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
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            {/* Use the action prop */}
            <form action={passwordAction} id="password-update-form">
              <CardContent className="space-y-6">
                {passwordState.success && (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">Password updated successfully!</AlertDescription>
                  </Alert>
                )}

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
        </TabsContent>
      </Tabs>
    </div>
  )
}
