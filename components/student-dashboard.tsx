"use client"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { LogOut, Building2, MessageSquare, HelpCircle, Calendar } from "lucide-react"
import { RequestBooking } from "@/components/request-booking"
import { FoodComplaint } from "@/components/food-complaint"
import { HelpRequest } from "@/components/help-request"
import { OutingRequest } from "@/components/outing-request"
import { ref, onValue } from "firebase/database"
import { db } from "@/lib/firebase"




export function StudentDashboard() {
  const { userData, logout } = useAuth()




  // 🔹 Dashboard counters
  const [activeBookings, setActiveBookings] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [helpTickets, setHelpTickets] = useState(0)
  const [outings, setOutings] = useState(0)

  useEffect(() => {
    if (!userData) return

    // ✅ Listen to bookings
    const bookingRef = ref(db, "bookings")
    onValue(bookingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const list = Object.values(data) as any[]
        const userBookings = list.filter((b) => b.studentId === userData.uid)
        setActiveBookings(userBookings.length)
      }
    })

    // ✅ Listen to outing requests
    const outingRef = ref(db, "outing_requests")
    onValue(outingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const list = Object.values(data) as any[]
        const userOutings = list.filter((o) => o.studentId === userData.uid)
        setOutings(userOutings.length)
        setPendingRequests(userOutings.filter((o) => o.status === "pending").length)
      }
    })

    // ✅ Listen to help requests
    const helpRef = ref(db, "help_requests")
    onValue(helpRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const list = Object.values(data) as any[]
        const userHelps = list.filter((h) => h.studentId === userData.uid && h.status === "pending")
        setHelpTickets(userHelps.length)
      }
    })
  }, [userData])



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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings}</div>
              <p className="text-xs text-muted-foreground">Current hostel booking(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Help Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{helpTickets}</div>
              <p className="text-xs text-muted-foreground">Open tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outings}</div>
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
