



"use client"

import { useState, useEffect } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Check, Clock, MessageSquare, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Complaint {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  hostelId: string
  message: string
  status: "pending" | "resolved" | "rejected"
  resolutionNote?: string
  createdAt: number
  updatedAt?: number
  resolvedAt?: number
}

type ManageComplaintsProps = {
  hostelId?: string
}

export function ManageComplaints() {

  const { userData } = useAuth()

  const hostelId = userData?.hostelId

  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    const db = getDatabase()
    const complaintsRef = ref(db, "complaints")

    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setComplaints([])
        return
      }

      const data = snapshot.val()
      const list: Complaint[] = Object.entries(data).map(([id, value]: any) => ({
        id,
        ...value,
      }))

      // Filter by hostelId if provided
      const filtered = hostelId ? list.filter((c) => c.hostelId === hostelId) : list

      // Sort by createdAt desc
      filtered.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

      setComplaints(filtered)
    })

    return () => unsubscribe()
  }, [hostelId])

  const updateStatus = async (complaintId: string, status: Complaint["status"]) => {
    setLoading(complaintId)
    try {
      const db = getDatabase()
      const resolutionNote = notesById[complaintId]?.trim() ?? ""
      const updates: any = {
        status,
        resolutionNote,
        updatedAt: Date.now(),
      }
      if (status === "resolved") {
        updates.resolvedAt = Date.now()
      }

      await update(ref(db, `complaints/${complaintId}`), updates)

      toast({
        title: `Complaint ${status === "resolved" ? "Resolved" : "Rejected"}`,
        description: `The complaint has been marked as ${status}.`,
      })

      setNotesById((prev) => ({ ...prev, [complaintId]: "" }))
    } catch {
      toast({
        title: "Error",
        description: "Failed to update complaint status.",
        variant: "destructive",
      })
    }
    setLoading(null)
  }

  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="default">
            <Check className="h-3 w-3 mr-1" />
            Resolved
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
          <CardTitle>Manage Food Complaints</CardTitle>
          <CardDescription>
            Review and update student food complaints {hostelId ? `(Hostel: ${hostelId})` : ""}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No complaints found</p>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{complaint.studentName}</h3>
                      <p className="text-sm text-muted-foreground">{complaint.studentEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Hostel: {complaint.hostelId}</Badge>
                    {getStatusBadge(complaint.status)}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">{complaint.message}</p>
                </div>

                {complaint.resolutionNote ? (
                  <p className="text-sm text-muted-foreground">
                    Note: <span className="text-foreground">{complaint.resolutionNote}</span>
                  </p>
                ) : null}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Submitted:{" "}
                    {complaint.createdAt
                      ? new Date(complaint.createdAt).toLocaleString()
                      : "—"}
                  </p>

                  {complaint.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Textarea
                        placeholder="Add resolution note (optional)"
                        className="min-w-[220px]"
                        rows={2}
                        value={notesById[complaint.id] ?? ""}
                        onChange={(e) =>
                          setNotesById((prev) => ({
                            ...prev,
                            [complaint.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => updateStatus(complaint.id, "resolved")}
                        disabled={loading === complaint.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(complaint.id, "rejected")}
                        disabled={loading === complaint.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
