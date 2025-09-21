import { db } from "@/lib/firebase"
import { ref, get, set, push, child } from "firebase/database"

const hostels = [
  { id: "1", name: "North Wing Hostel", location: "North Campus", capacity: 100, occupied: 85 },
  { id: "2", name: "South Wing Hostel", location: "South Campus", capacity: 120, occupied: 95 },
  { id: "3", name: "East Wing Hostel", location: "East Campus", capacity: 80, occupied: 60 },
  { id: "4", name: "West Wing Hostel", location: "West Campus", capacity: 90, occupied: 75 },
]

export async function seedHostels() {
  try {
    console.log("Checking existing hostels...")

    const hostelsRef = ref(db, "hostels")
    const snapshot = await get(hostelsRef)

    if (snapshot.exists()) {
      console.log("Hostels already exist in database. Skipping seed.")
      return
    }

    console.log("Adding hostels to Realtime Database...")

    for (const hostel of hostels) {
      const newHostelRef = push(hostelsRef) // auto-generate unique key
      await set(newHostelRef, {
        name: hostel.name,
        location: hostel.location,
        capacity: hostel.capacity,
        occupied: hostel.occupied,
        createdAt: new Date().toISOString(),
      })
      console.log(`Added ${hostel.name}`)
    }

    console.log("All hostels added successfully!")
  } catch (error) {
    console.error("Error seeding hostels:", error)
  }
}
