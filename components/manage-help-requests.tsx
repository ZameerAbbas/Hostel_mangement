"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
// import { Check, Clock, HelpCircle } from "lucide-react"

interface HelpRequest {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  description: string
  category: string
  status: "pending" | "resolved"
  createdAt: any
}

export function ManageHelpRequests() {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "help_requests"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HelpRequest[]
      setHelpRequests(requestData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()))
    })

    return unsubscribe
  }, [])

  const markAsResolved = async (requestId: string) => {
    setLoading(requestId)
    try {
      await updateDoc(doc(db, "help_requests", requestId), { status: "resolved" })
      toast({
        title: "Request Resolved",
        description: "The help request has been marked as resolved.",
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
            {/* <Clock className="h-3 w-3 mr-1" /> */}
            Pending
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="default">
            {/* <Check className="h-3 w-3 mr-1" /> */}
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
          <CardTitle>Manage Help Requests</CardTitle>
          <CardDescription>Review and resolve student help requests</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {helpRequests.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No help requests found</p>
            </CardContent>
          </Card>
        ) : (
          helpRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* <HelpCircle className="h-5 w-5 text-muted-foreground" /> */}
                      <div>
                        <h3 className="font-semibold">{request.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{request.category}</Badge>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{request.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Submitted: {request.createdAt?.toDate().toLocaleDateString()}
                    </p>

                    {request.status === "pending" && (
                      <Button size="sm" onClick={() => markAsResolved(request.id)} disabled={loading === request.id}>
                        {/* <Check className="h-4 w-4 mr-1" /> */}
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
