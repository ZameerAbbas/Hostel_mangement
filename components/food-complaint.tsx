"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function FoodComplaint() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { userData } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData || !message.trim()) return

    setLoading(true)
    try {
      await addDoc(collection(db, "complaints"), {
        studentId: userData.uid,
        studentName: userData.name,
        studentEmail: userData.email,
        message: message.trim(),
        status: "pending",
        createdAt: new Date(),
      })

      setMessage("")
      toast({
        title: "Complaint Submitted",
        description: "Your food complaint has been submitted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Food Complaint</CardTitle>
          <CardDescription>Report any issues with food quality, service, or dining facilities</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complaint-message">Describe your complaint</Label>
              <Textarea
                id="complaint-message"
                placeholder="Please provide details about your food-related complaint..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>
            <Button type="submit" disabled={loading || !message.trim()}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
          <CardDescription>Quick reference for common food-related concerns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Food Quality</h4>
              <p className="text-sm text-muted-foreground">Taste, freshness, temperature issues</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Hygiene</h4>
              <p className="text-sm text-muted-foreground">Cleanliness of dining area or utensils</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Service</h4>
              <p className="text-sm text-muted-foreground">Staff behavior or serving issues</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium">Menu</h4>
              <p className="text-sm text-muted-foreground">Variety, dietary restrictions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
