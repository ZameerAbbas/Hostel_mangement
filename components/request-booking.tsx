"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Users, Bed } from "lucide-react"
import { ref, onValue, push } from "firebase/database"

interface Hostel {
    id: string
    name: string
    location: string
    capacity: number
    occupied: number
}

export function RequestBooking() {
    const [hostels, setHostels] = useState<Hostel[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingHostels, setFetchingHostels] = useState(true)
    const { userData } = useAuth()
    const { toast } = useToast()

    // 🔹 Live fetch hostels
    useEffect(() => {
        const hostelsRef = ref(db, "hostels")
        const unsubscribe = onValue(
            hostelsRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val()
                    const hostelList = Object.entries(data).map(([id, value]) => ({
                        id,
                        ...(value as Omit<Hostel, "id">),
                    }))
                    setHostels(hostelList)
                } else {
                    setHostels([])
                }
                setFetchingHostels(false)
            },
            (error) => {
                console.error("Error fetching hostels:", error)
                toast({
                    title: "Error",
                    description: "Failed to load hostels. Please refresh the page.",
                    variant: "destructive",
                })
                setFetchingHostels(false)
            },
        )

        return () => unsubscribe()
    }, [toast])

    // 🔹 Handle booking request
    const handleBooking = async (hostelId: string, hostelName: string) => {
        if (!userData) return

        setLoading(true)
        try {
            const bookingRef = ref(db, "bookings")
            await push(bookingRef, {
                studentId: userData.uid,
                hostelId,
                hostelName,
                status: "pending",
                createdAt: new Date().toISOString(),
                studentName: userData.name,
                studentEmail: userData.email,
            })

            toast({
                title: "Booking Request Submitted",
                description: `Your booking request for ${hostelName} has been submitted successfully.`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit booking request. Please try again.",
                variant: "destructive",
            })
        }
        setLoading(false)
    }

    if (fetchingHostels) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Available Hostels</CardTitle>
                        <CardDescription>Loading hostels...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Available Hostels</CardTitle>
                    <CardDescription>Browse and book available hostel rooms</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {hostels.map((hostel) => {
                    const availableRooms = hostel.capacity - hostel.occupied
                    const occupancyRate = (hostel.occupied / hostel.capacity) * 100

                    return (
                        <Card key={hostel.id} className="relative">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{hostel.name}</CardTitle>
                                    <Badge
                                        variant={
                                            availableRooms > 10 ? "default" : availableRooms > 0 ? "secondary" : "destructive"
                                        }
                                    >
                                        {availableRooms > 0 ? `${availableRooms} Available` : "Full"}
                                    </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {hostel.location}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>Capacity: {hostel.capacity}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Bed className="h-4 w-4 text-muted-foreground" />
                                        <span>Occupied: {hostel.occupied}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Occupancy Rate</span>
                                        <span>{occupancyRate.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${occupancyRate}%` }}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    disabled={availableRooms === 0 || loading}
                                    onClick={() => handleBooking(hostel.id, hostel.name)}
                                >
                                    {availableRooms === 0 ? "No Rooms Available" : "Request Booking"}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
