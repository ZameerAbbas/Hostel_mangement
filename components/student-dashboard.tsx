"use client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { LogOut, Building2, MessageSquare, HelpCircle, Calendar } from "lucide-react"
import { RequestBooking } from "@/components/request-booking"
import { FoodComplaint } from "@/components/food-complaint"
import { HelpRequest } from "@/components/help-request"
import { OutingRequest } from "@/components/outing-request"




export function StudentDashboard() {
  const { userData, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <Building2 className="h-6 w-6 text-primary" /> */}
            <h1 className="text-xl font-semibold">Student Dashboard</h1>
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
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              {/* <Building2 className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Current hostel booking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              {/* <MessageSquare className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Help Tickets</CardTitle>
              {/* <HelpCircle className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Open tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outings</CardTitle>
              {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="booking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="booking">Hostel Booking</TabsTrigger>
            <TabsTrigger value="complaint">Food Complaints</TabsTrigger>
            <TabsTrigger value="help">Help Center</TabsTrigger>
            <TabsTrigger value="outing">Outing Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <RequestBooking />
          </TabsContent>

          <TabsContent value="complaint">
            <FoodComplaint />
          </TabsContent>

          <TabsContent value="help">
            <HelpRequest />
          </TabsContent>

          <TabsContent value="outing">
            <OutingRequest />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
