"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { StudentDashboard } from "@/components/student-dashboard"
import { WardenDashboard } from "@/components/warden-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Settings } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { user, userData, loading } = useAuth()


  console.log("user", user)
  console.log("userData", userData)


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-balance">Hostel Management System</h1>
            <p className="text-muted-foreground text-pretty">Sign in to access your dashboard</p>
          </div>
          <LoginForm />
          <div className="text-center">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">First-time setup? Use Admin Panel to seed hostel data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {userData.role === "student" ? <StudentDashboard /> : <WardenDashboard />}
    </div>
  )
}
