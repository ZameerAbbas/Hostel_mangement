




// "use client"

// import React from "react"
// import { createContext, useContext, useEffect, useState } from "react"
// import { getFirebaseAuth, getFirebaseDb } from "./firebase"

// interface UserData {
//   uid: string
//   name: string
//   email: string
//   role: "student" | "warden"
//   hostelId?: string
// }

// interface AuthContextType {
//   user: any | null
//   userData: UserData | null
//   loading: boolean
//   signIn: (email: string, password: string) => Promise<void>
//   signUp: (
//     email: string,
//     password: string,
//     name: string,
//     role: "student" | "warden",
//     hostelId?: string,
//   ) => Promise<void>
//   logout: () => Promise<void>
//   isConfigured: boolean
//   error: string | null
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<any | null>(null)
//   const [userData, setUserData] = useState<UserData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [isConfigured, setIsConfigured] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         console.log("[v0] Initializing auth context...")
//         const auth = await getFirebaseAuth()
//         const db = await getFirebaseDb()

//         if (auth && db) {
//           setIsConfigured(true)
//           console.log("[v0] Auth context configured successfully")

//           // Set up auth state listener
//           if (typeof auth.onAuthStateChanged === "function") {
//             const { onAuthStateChanged } = await import("firebase/auth")
//             const { doc, getDoc } = await import("firebase/firestore")

//             const unsubscribe = onAuthStateChanged(auth, async (user) => {
//               console.log("[v0] Auth state changed:", user?.uid || "no user")

//               if (user && db) {
//                 try {
//                   const userDoc = await getDoc(doc(db, "users", user.uid))
//                   if (userDoc.exists()) {
//                     const data = userDoc.data() as UserData
//                     console.log("[v0] User data loaded:", data.role, data.hostelId)
//                     setUserData(data)
//                   }
//                 } catch (error) {
//                   console.error("[v0] Error fetching user data:", error)
//                 }
//               } else {
//                 setUserData(null)
//               }
//               setUser(user)
//               setLoading(false)
//             })

//             return unsubscribe
//           }
//         } else {
//           setError("Firebase services not available")
//           console.error("[v0] Firebase services not available")
//         }
//       } catch (error) {
//         setError("Failed to initialize Firebase")
//         console.error("[v0] Auth initialization error:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     initAuth()
//   }, [])

//   const signIn = async (email: string, password: string) => {
//     const auth = await getFirebaseAuth()
//     if (!auth || typeof auth.signInWithEmailAndPassword !== "function") {
//       throw new Error("Authentication service not available")
//     }

//     const { signInWithEmailAndPassword } = await import("firebase/auth")
//     await signInWithEmailAndPassword(auth, email, password)
//   }

//   const signUp = async (
//     email: string,
//     password: string,
//     name: string,
//     role: "student" | "warden",
//     hostelId?: string,
//   ) => {
//     const auth = await getFirebaseAuth()
//     const db = await getFirebaseDb()

//     if (!auth || !db) {
//       throw new Error("Firebase services not available")
//     }

//     const { createUserWithEmailAndPassword } = await import("firebase/auth")
//     const { doc, setDoc } = await import("firebase/firestore")

//     const { user } = await createUserWithEmailAndPassword(auth, email, password)

//     const userData: any = {
//       uid: user.uid,
//       name,
//       email,
//       role,
//     }

//     if (role === "warden" && hostelId) {
//       userData.hostelId = hostelId
//     }

//     await setDoc(doc(db, "users", user.uid), userData)
//   }

//   const logout = async () => {
//     const auth = await getFirebaseAuth()
//     if (!auth) {
//       throw new Error("Authentication service not available")
//     }

//     const { signOut } = await import("firebase/auth")
//     await signOut(auth)
//   }

//   return (
//     <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, logout, isConfigured, error }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { getFirebaseAuth, getFirebaseDb } from "./firebase"

// -----------------
// Types
// -----------------
interface UserData {
  uid: string
  name: string
  email: string
  role: "student" | "warden"
  hostelId?: string
}

interface Hostel {
  id: string
  name: string
  capacity: number
  occupied: number
  wardenId?: string
}

interface AuthContextType {
  user: any | null
  userData: UserData | null
  loading: boolean
  isConfigured: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    name: string,
    role: "student" | "warden",
    hostelId?: string,
  ) => Promise<void>
  logout: () => Promise<void>
  listHostels: () => Promise<Hostel[]>
}

// -----------------
// Context
// -----------------
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -----------------
  // Init Auth
  // -----------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("[v0] Initializing auth context...")
        const auth = await getFirebaseAuth()
        const db = await getFirebaseDb()

        if (auth && db) {
          setIsConfigured(true)

          const { onAuthStateChanged } = await import("firebase/auth")
          const { ref, get } = await import("firebase/database")

          onAuthStateChanged(auth, async (user) => {
            if (user && db) {
              try {
                const userRef = ref(db, `users/${user.uid}`)
                const snapshot = await get(userRef)
                if (snapshot.exists()) {
                  setUserData(snapshot.val() as UserData)
                } else {
                  console.warn("[v0] No user profile found in RTDB for uid:", user.uid)
                  setUserData(null)
                }
              } catch (err) {
                console.error("[v0] Error fetching user data:", err)
              }
            } else {
              setUserData(null)
            }
            setUser(user)
            setLoading(false)
          })
        } else {
          setError("Firebase services not available")
        }
      } catch (err) {
        setError("Failed to initialize Firebase")
        console.error("[v0] Auth initialization error:", err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // -----------------
  // Sign In
  // -----------------
  const signIn = async (email: string, password: string) => {
    const auth = await getFirebaseAuth()
    if (!auth) throw new Error("Auth not available")

    const { signInWithEmailAndPassword } = await import("firebase/auth")
    await signInWithEmailAndPassword(auth, email, password)
  }

  // -----------------
  // Sign Up (warden & student)
  // -----------------
  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "warden",
    hostelId?: string,
  ) => {
    const auth = await getFirebaseAuth()
    const db = await getFirebaseDb()
    if (!auth || !db) throw new Error("Firebase not available")

    const { createUserWithEmailAndPassword } = await import("firebase/auth")
    const { ref, set, update, get, child } = await import("firebase/database")

    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    const newUserData: UserData = {
      uid: user.uid,
      name,
      email,
      role,
    }

    if (role === "warden") {
      let assignedHostelId = hostelId

      if (!assignedHostelId) {
        // create a new hostel for this warden
        assignedHostelId = user.uid // use warden uid as hostel id
        const hostelRef = ref(db, `hostels/${assignedHostelId}`)
        await set(hostelRef, {
          name: `${name}'s Hostel`,
          wardenId: user.uid,
          capacity: 50,
          occupied: 0,
          createdAt: new Date().toISOString(),
        })
      } else {
        // assign warden to existing hostel
        await update(ref(db, `hostels/${assignedHostelId}`), { wardenId: user.uid })
      }

      newUserData.hostelId = assignedHostelId
    }

    if (role === "student" && hostelId) {
      newUserData.hostelId = hostelId

      // increment occupied count
      const hostelRef = ref(db, `hostels/${hostelId}/occupied`)
      const snapshot = await get(hostelRef)
      const currentOccupied = snapshot.exists() ? snapshot.val() : 0
      await set(hostelRef, currentOccupied + 1)
    }

    // save user profile
    await set(ref(db, `users/${user.uid}`), newUserData)
    setUserData(newUserData)
  }

  // -----------------
  // Logout
  // -----------------
  const logout = async () => {
    const auth = await getFirebaseAuth()
    if (!auth) throw new Error("Auth not available")

    const { signOut } = await import("firebase/auth")
    await signOut(auth)
  }

  // -----------------
  // List hostels
  // -----------------
  const listHostels = async (): Promise<Hostel[]> => {
    const db = await getFirebaseDb()
    if (!db) throw new Error("Database not available")

    const { ref, get } = await import("firebase/database")
    const snapshot = await get(ref(db, "hostels"))

    if (snapshot.exists()) {
      const data = snapshot.val()
      return Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<Hostel, "id">),
      }))
    }
    return []
  }

  // -----------------
  // Provider
  // -----------------
  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        isConfigured,
        error,
        signIn,
        signUp,
        logout,
        listHostels,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// -----------------
// Hook
// -----------------
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
