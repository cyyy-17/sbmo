"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, User, KeyRound, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProfile, updatePassword } from "@/features/users/actions"
import { useSearchParams, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

interface SettingsFormProps {
  initialData: {
    name: string
    email: string
    role: string
  }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "account" ? "account" : "profile"
  
  const [isProfilePending, setIsProfilePending] = useState(false)
  const [isPasswordPending, setIsPasswordPending] = useState(false)

  const profileForm = useForm({
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
    },
  })

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onProfileSubmit(values: any) {
    setIsProfilePending(true)
    try {
      const result = await updateProfile(values)
      if (result.success) {
        toast.success("Profile updated successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsProfilePending(false)
    }
  }

  async function onPasswordSubmit(values: any) {
    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setError("confirmPassword", { message: "Passwords don't match" })
      return
    }

    setIsPasswordPending(true)
    try {
      const result = await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      if (result.success) {
        toast.success("Password updated. Logging you out...")
        passwordForm.reset()
        if (result.requireLogout) {
          setTimeout(() => signOut({ callbackUrl: '/login' }), 2000)
        }
      } else {
        toast.error(result.error || "Failed to update password")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsPasswordPending(false)
    }
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full md:w-[400px] grid-cols-2">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Account
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-6">
        <TabsContent value="profile" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                
                <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg border border-border">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Current Role</p>
                    <p className="text-xs text-muted-foreground">{initialData.role.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    {...profileForm.register("name", { required: "Name is required" })} 
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.name.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    {...profileForm.register("email", { required: "Email is required" })} 
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{profileForm.formState.errors.email.message as string}</p>
                  )}
                  <p className="text-xs text-muted-foreground">This email is used for login and notifications.</p>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={isProfilePending}>
                    {isProfilePending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Update your password and manage your account security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    {...passwordForm.register("currentPassword")} 
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      {...passwordForm.register("newPassword", { 
                        required: "New password is required",
                        minLength: { value: 8, message: "Must be at least 8 characters" }
                      })} 
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message as string}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      {...passwordForm.register("confirmPassword", { required: "Confirm your password" })} 
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message as string}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={isPasswordPending} variant="secondary">
                    {isPasswordPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  )
}
