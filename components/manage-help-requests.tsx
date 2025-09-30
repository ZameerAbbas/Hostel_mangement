"use client"

import { useState, useEffect } from "react"
import { ref, onValue, update } from "firebase/database"
import { db } from "@/lib/firebase" // <-- should export your Realtime Database instance
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface HelpRequest {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  description: string
  category: string
  status: "pending" | "resolved"
  createdAt: number // we’ll store timestamps as numbers in RTDB
}

export function ManageHelpRequests() {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const helpRequestsRef = ref(db, "help_requests")

    const unsubscribe = onValue(helpRequestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const requestList: HelpRequest[] = Object.entries(data).map(([id, value]) => ({
          id,
          ...(value as Omit<HelpRequest, "id">),
        }))

        // Sort newest first
        setHelpRequests(requestList.sort((a, b) => b.createdAt - a.createdAt))
      } else {
        setHelpRequests([])
      }
    })

    return () => unsubscribe()
  }, [])

  const markAsResolved = async (requestId: string) => {
    setLoading(requestId)
    try {
      await update(ref(db, `help_requests/${requestId}`), { status: "resolved" })
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
        return <Badge variant="secondary">Pending</Badge>
      case "resolved":
        return <Badge variant="default">Resolved</Badge>
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
                      Submitted: {new Date(request.createdAt).toLocaleDateString()}
                    </p>

                    {request.status === "pending" && (
                      <Button size="sm" onClick={() => markAsResolved(request.id)} disabled={loading === request.id}>
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
