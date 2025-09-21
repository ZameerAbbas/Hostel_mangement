"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2 } from "lucide-react"

interface Hostel {
  id: string
  name: string
  location: string
  wardenId?: string
  wardenName?: string
  wardenEmail?: string
}

export function AdminHostels() {
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [newHostel, setNewHostel] = useState({ name: "", location: "" })
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null)
  const { toast } = useToast()

  const fetchHostels = async () => {
    try {
      const snapshot = await getDocs(collection(db, "hostels"))
      const data: Hostel[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Hostel[]
      setHostels(data)
    } catch (error) {
      console.error("Error fetching hostels:", error)
      toast({
        title: "Error",
        description: "Could not load hostels.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  const handleAddHostel = async () => {
    if (!newHostel.name || !newHostel.location) {
      toast({ title: "Missing fields", description: "Name and Location are required", variant: "destructive" })
      return
    }
    try {
      await addDoc(collection(db, "hostels"), newHostel)
      toast({ title: "Hostel Added", description: `${newHostel.name} created successfully.` })
      setNewHostel({ name: "", location: "" })
      fetchHostels()
    } catch (error) {
      toast({ title: "Error", description: "Could not add hostel", variant: "destructive" })
    }
  }

  // const handleUpdateHostel = async () => {
  //   if (!editingHostel) return
  //   try {
  //     await updateDoc(doc(db, "hostels", editingHostel.id), editingHostel)
  //     toast({ title: "Hostel Updated", description: `${editingHostel.name} updated successfully.` })
  //     setEditingHostel(null)
  //     fetchHostels()
  //   } catch (error) {
  //     toast({ title: "Error", description: "Could not update hostel", variant: "destructive" })
  //   }
  // }

  const handleDeleteHostel = async (id: string) => {
    try {
      await deleteDoc(doc(db, "hostels", id))
      toast({ title: "Hostel Deleted" })
      fetchHostels()
    } catch (error) {
      toast({ title: "Error", description: "Could not delete hostel", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Hostel */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Hostel</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div>
            <Label>Name</Label>
            <Input
              value={newHostel.name}
              onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={newHostel.location}
              onChange={(e) => setNewHostel({ ...newHostel, location: e.target.value })}
            />
          </div>
          <Button onClick={handleAddHostel}>Add</Button>
        </CardContent>
      </Card>

      {/* List of Hostels */}
      <div className="grid gap-6">
        {hostels.map((hostel) => (
          <Card key={hostel.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{hostel.name}</CardTitle>
                <CardDescription>{hostel.location}</CardDescription>
                {hostel.wardenName && (
                  <p className="text-sm mt-1">👨‍💼 Warden: {hostel.wardenName} ({hostel.wardenEmail})</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingHostel(hostel)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteHostel(hostel.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Edit Hostel */}
      {editingHostel && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Hostel</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editingHostel.name}
                onChange={(e) => setEditingHostel({ ...editingHostel, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={editingHostel.location}
                onChange={(e) => setEditingHostel({ ...editingHostel, location: e.target.value })}
              />
            </div>
            {/* For assigning warden, you could add a dropdown of users here */}
            {/* <Button onClick={handleUpdateHostel}>Save</Button> */}
            <Button variant="outline" onClick={() => setEditingHostel(null)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
