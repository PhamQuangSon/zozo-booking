"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

import { ProfileUpdateForm } from "@/components/profile/ProfileUpdateForm"
import { PasswordUpdateForm } from "@/components/profile/PasswordUpdateForm"
import Loading from "@/app/loading"

export default function ProfilePage() {
  const { status } = useSession() // Only need status here for redirect/loading
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <Loading />
  }

  // Render the page only if authenticated
  if (status === "authenticated") {
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
            {/* Render the Profile Update Form Component */}
            <ProfileUpdateForm />
          </TabsContent>

          <TabsContent value="security">
            {/* Render the Password Update Form Component */}
            <PasswordUpdateForm />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Return null or a placeholder if status is neither loading nor authenticated
  // (though the redirect should handle unauthenticated)
  return null
}

