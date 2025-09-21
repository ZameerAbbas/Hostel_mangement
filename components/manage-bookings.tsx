"use client"

import { useState, useEffect } from "react"
import { ref, onValue, update } from "firebase/database"
import { db } from "@/lib/firebase" // make sure you export `rtdb = getDatabase(app)` in firebase.ts
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Clock } from "lucide-react"

interface Booking {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  hostelId: string
  hostelName: string
  status: "pending" | "approved" | "rejected"
  createdAt: string // store as ISO string in RTDB
}

export function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  // 🔹 Fetch bookings in real time
  useEffect(() => {
    const bookingsRef = ref(db, "bookings")
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const bookingList = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        })) as Booking[]

        // Sort newest first (based on createdAt string)
        bookingList.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setBookings(bookingList)
      } else {
        setBookings([])
      }
    })

    return () => unsubscribe()
  }, [])

  // 🔹 Update booking status in RTDB
  const updateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    setLoading(bookingId)
    try {
      await update(ref(db, `bookings/${bookingId}`), { status })
      toast({
        title: "Status Updated",
        description: `Booking has been ${status}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      })
    }
    setLoading(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Booking Requests</CardTitle>
          <CardDescription>Review and approve or reject student hostel booking requests</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No booking requests found</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{booking.studentName}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.studentEmail}</p>
                    <p className="text-sm">
                      <span className="font-medium">Hostel:</span> {booking.hostelName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, "approved")}
                        disabled={loading === booking.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateBookingStatus(booking.id, "rejected")}
                        disabled={loading === booking.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
