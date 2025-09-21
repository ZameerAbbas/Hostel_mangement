"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Clock, Calendar } from "lucide-react"

interface OutingRequest {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  date: string
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: any
}

export function ManageOutingRequests() {
  const [outingRequests, setOutingRequests] = useState<OutingRequest[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "outing_requests"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OutingRequest[]
      setOutingRequests(requestData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()))
    })

    return unsubscribe
  }, [])

  const updateRequestStatus = async (requestId: string, status: "approved" | "rejected") => {
    setLoading(requestId)
    try {
      await updateDoc(doc(db, "outing_requests", requestId), { status })
      toast({
        title: "Status Updated",
        description: `Outing request has been ${status}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status.",
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
          <CardTitle>Manage Outing Requests</CardTitle>
          <CardDescription>Review and approve or reject student outing requests</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {outingRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No outing requests found</p>
            </CardContent>
          </Card>
        ) : (
          outingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{request.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Outing Date</p>
                      <p className="text-sm text-muted-foreground">{new Date(request.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Requested On</p>
                      <p className="text-sm text-muted-foreground">
                        {request.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Reason</p>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{request.reason}</p>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateRequestStatus(request.id, "approved")}
                        disabled={loading === request.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateRequestStatus(request.id, "rejected")}
                        disabled={loading === request.id}
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
