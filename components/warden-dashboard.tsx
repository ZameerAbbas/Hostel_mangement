"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { LogOut, Shield, Users, MessageSquare, HelpCircle, Calendar } from "lucide-react"
import { ManageBookings } from "@/components/manage-bookings"
import { ManageComplaints } from "@/components/manage-complaints"
import { ManageHelpRequests } from "@/components/manage-help-requests"
import { ManageOutingRequests } from "@/components/manage-outing-requests"

export function WardenDashboard() {
  const { userData, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <Shield className="h-6 w-6 text-primary" /> */}
            <h1 className="text-xl font-semibold">Warden Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {userData?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              {/* <LogOut className="h-4 w-4 mr-2" /> */}
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
              {/* <MessageSquare className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Help Requests</CardTitle>
              {/* <HelpCircle className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Open requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outing Requests</CardTitle>
              {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
            <TabsTrigger value="complaints">Food Complaints</TabsTrigger>
            <TabsTrigger value="help">Help Requests</TabsTrigger>
            <TabsTrigger value="outings">Outing Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <ManageBookings />
          </TabsContent>

          <TabsContent value="complaints">
            <ManageComplaints />
          </TabsContent>

          <TabsContent value="help">
            <ManageHelpRequests />
          </TabsContent>

          <TabsContent value="outings">
            <ManageOutingRequests />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
