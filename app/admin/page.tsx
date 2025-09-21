"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { seedHostels } from "../../lib/seed-hostels"
import { Building2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { AdminHostels } from "@/components/hostel-booking"

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedStatus, setSeedStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSeedHostels = async () => {
    setIsSeeding(true)
    setSeedStatus("idle")
    setMessage("")

    try {
      await seedHostels()
      setSeedStatus("success")
      setMessage("✅ Hostels seeded successfully into Realtime Database!")
    } catch (error) {
      setSeedStatus("error")
      setMessage(`❌ Error seeding hostels: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("Seeding error:", error)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance">Admin Panel</h1>
          <p className="text-muted-foreground text-pretty">
            Initialize hostel data and manage the system
          </p>
        </div>

        {/* Database Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Realtime Database Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              First, seed the hostel data to create the four hostels in Firebase Realtime Database.
              This is required before wardens can be assigned to hostels.
            </p>

            <Button onClick={handleSeedHostels} disabled={isSeeding} className="w-full">
              {isSeeding ? "Seeding Hostels..." : "Seed Hostels"}
            </Button>

            {seedStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                {message}
              </div>
            )}

            {seedStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {message}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Hostels to be created:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>North Wing Hostel (North Campus) - 100 capacity</li>
                <li>South Wing Hostel (South Campus) - 120 capacity</li>
                <li>East Wing Hostel (East Campus) - 80 capacity</li>
                <li>West Wing Hostel (West Campus) - 90 capacity</li>
              </ul>
            </div>
          </CardContent>
        </Card>



        <AdminHostels />
      </div>
    </div>
  )
}
