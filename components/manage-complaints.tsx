"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, Clock, MessageSquare } from "lucide-react"

interface Complaint {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  message: string
  status: "pending" | "resolved"
  createdAt: any
}

export function ManageComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "complaints"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Complaint[]
      setComplaints(complaintData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()))
    })

    return unsubscribe
  }, [])

  const markAsResolved = async (complaintId: string) => {
    setLoading(complaintId)
    try {
      await updateDoc(doc(db, "complaints", complaintId), { status: "resolved" })
      toast({
        title: "Complaint Resolved",
        description: "The complaint has been marked as resolved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint status.",
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
      case "resolved":
        return (
          <Badge variant="default">
            <Check className="h-3 w-3 mr-1" />
            Resolved
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
          <CardDescription>Review and resolve student food complaints</CardDescription>
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
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{complaint.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{complaint.studentEmail}</p>
                      </div>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{complaint.message}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Submitted: {complaint.createdAt?.toDate().toLocaleDateString()}
                    </p>

                    {complaint.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => markAsResolved(complaint.id)}
                        disabled={loading === complaint.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
