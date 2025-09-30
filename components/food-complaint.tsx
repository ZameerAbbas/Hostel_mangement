
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  ref,
  push,
  serverTimestamp,
  onValue,
  query,
  orderByChild,
  equalTo,
} from "firebase/database"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

type ComplaintDoc = {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  hostelId: string
  message: string
  status: "pending" | "resolved" | "rejected"
  resolutionNote?: string
  createdAt?: any
  updatedAt?: any
  resolvedAt?: any
}

export function FoodComplaint() {
  const { userData } = useAuth()
  const { toast } = useToast()

  const studentId = userData?.uid
  const studentName = userData?.name
  const studentEmail = userData?.email
  const defaultHostelId = userData?.hostelId ?? ""

  const [message, setMessage] = useState("")
  const [hostelId, setHostelId] = useState(defaultHostelId)
  const [loading, setLoading] = useState(false)
  const [complaintsLoading, setComplaintsLoading] = useState(true)
  const [myComplaints, setMyComplaints] = useState<ComplaintDoc[]>([])

  // 🔹 Load complaints for this student in realtime
  useEffect(() => {
    if (!studentId) return
    const complaintsRef = query(
      ref(db, "complaints"),
      orderByChild("studentId"),
      equalTo(studentId)
    )

    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const items: ComplaintDoc[] = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            ...value,
          })
        )
        // Order by createdAt (latest first)
        items.sort(
          (a, b) =>
            (b.createdAt || 0) - (a.createdAt || 0)
        )
        setMyComplaints(items)
      } else {
        setMyComplaints([])
      }
      setComplaintsLoading(false)
    })

    return () => unsubscribe()
  }, [studentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !studentName || !studentEmail) {
      toast({
        title: "Missing user info",
        description: "Student details are required.",
        variant: "destructive",
      })
      return
    }
    if (!hostelId.trim()) {
      toast({
        title: "Hostel ID required",
        description: "Please enter your hostel ID.",
        variant: "destructive",
      })
      return
    }
    if (!message.trim()) return

    setLoading(true)
    try {
      await push(ref(db, "complaints"), {
        studentId,
        studentName,
        studentEmail,
        hostelId: hostelId.trim(),
        message: message.trim(),
        status: "pending",
        resolutionNote: "",
        createdAt: Date.now(), // ✅ use timestamp (Realtime DB doesn’t have serverTimestamp like Firestore)
        updatedAt: Date.now(),
      })

      setMessage("")
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully.",
      })
    } catch {
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
          <CardDescription>
            Report any issues with food quality, service, or dining facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hostel-id">Hostel ID</Label>
              <Input
                id="hostel-id"
                placeholder="e.g., A-Block, H-12, etc."
                value={hostelId}
                onChange={(e) => setHostelId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-message">
                Describe your complaint
              </Label>
              <Textarea
                id="complaint-message"
                placeholder="Please provide details about your food-related complaint..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !message.trim() || !hostelId.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Complaint"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Complaints</CardTitle>
          <CardDescription>
            Live status updates on your recent complaints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {complaintsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading complaints...
            </div>
          ) : myComplaints.length === 0 ? (
            <p className="text-sm text-muted-foreground">No complaints yet.</p>
          ) : (
            myComplaints.map((c) => (
              <div key={c.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Hostel:{" "}
                    <span className="font-medium text-foreground">
                      {c.hostelId}
                    </span>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm">{c.message}</p>
                {c.resolutionNote ? (
                  <p className="text-sm text-muted-foreground">
                    Note:{" "}
                    <span className="text-foreground">{c.resolutionNote}</span>
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Submitted:{" "}
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: ComplaintDoc["status"] }) {
  if (status === "pending")
    return <Badge variant="secondary">Pending</Badge>
  if (status === "resolved")
    return <Badge variant="default">Resolved</Badge>
  if (status === "rejected")
    return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="secondary">{status}</Badge>
}
