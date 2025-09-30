"use client"

import type React from "react"
import { useState } from "react"
import { getDatabase, ref, push } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function OutingRequest() {
  const [date, setDate] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const { userData } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData || !date || !reason.trim()) return

    setLoading(true)
    try {
      const db = getDatabase()
      const outingRef = ref(db, "outing_requests")

      await push(outingRef, {
        studentId: userData.uid,
        studentName: userData.name,
        studentEmail: userData.email,
        hostelId: userData.hostelId, // ✅ include hostelId
        date,
        reason: reason.trim(),
        status: "pending",
        createdAt: Date.now(),
      })

      setDate("")
      setReason("")
      toast({
        title: "Outing Request Submitted",
        description: "Your outing request has been submitted for approval.",
      })
    } catch (error) {
      console.error("Error submitting outing request:", error)
      toast({
        title: "Error",
        description: "Failed to submit outing request. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Outing Request</CardTitle>
          <CardDescription>Request permission for hostel leave or overnight stays</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outing-date">Date</Label>
              <Input
                id="outing-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outing-reason">Reason for Outing</Label>
              <Textarea
                id="outing-reason"
                placeholder="Please provide the reason for your outing request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={loading || !date || !reason.trim()}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outing Guidelines</CardTitle>
          <CardDescription>Important information about outing requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Submit requests at least 24 hours in advance</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Provide valid reason and contact information</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Return by the specified time to avoid penalties</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Emergency contact must be provided for overnight stays</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
