"use client"

// Simplified Firebase initialization with error handling
let firebaseApp: any = null
let auth: any = null
let db: any = null
let initializationPromise: Promise<any> | null = null

async function initializeFirebaseServices() {
  if (typeof window === "undefined") {
    console.log("[v0] Server-side detected, skipping Firebase initialization")
    return { auth: null, db: null, app: null }
  }

  if (firebaseApp && auth && db) {
    return { auth, db, app: firebaseApp }
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    try {
      console.log("[v0] Attempting Firebase initialization...")

      // Import Firebase modules
      const firebaseAppModule = await import("firebase/app")
      const firebaseAuthModule = await import("firebase/auth")
      const firebaseDatabaseModule = await import("firebase/database")
      const { firebaseConfig } = await import("./firebase-config")

      // Initialize app
      const app =
        firebaseAppModule.getApps().length === 0
          ? firebaseAppModule.initializeApp(firebaseConfig)
          : firebaseAppModule.getApps()[0]

      // Wait a bit before initializing services
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Initialize services
      const authInstance = firebaseAuthModule.getAuth(app)
      const dbInstance = firebaseDatabaseModule.getDatabase(app) // ✅ Realtime DB

      // Store instances
      firebaseApp = app
      auth = authInstance
      db = dbInstance

      console.log("[v0] Firebase services initialized successfully (Realtime DB)")
      return { auth: authInstance, db: dbInstance, app }
    } catch (error) {
      console.error("[v0] Firebase initialization error:", error)

      // Return mock objects for development
      const mockAuth = {
        currentUser: null,
        onAuthStateChanged: () => () => {},
        signInWithEmailAndPassword: async () => {
          throw new Error("Firebase not available")
        },
        createUserWithEmailAndPassword: async () => {
          throw new Error("Firebase not available")
        },
        signOut: async () => {
          throw new Error("Firebase not available")
        },
      }

      const mockDb = {
        ref: () => ({
          get: async () => ({ exists: false, val: () => null }),
          set: async () => {
            throw new Error("Firebase not available")
          },
        }),
      }

      console.log("[v0] Using mock Firebase services due to initialization failure")
      return { auth: mockAuth, db: mockDb, app: null }
    }
  })()

  return initializationPromise
}

export async function getFirebaseAuth() {
  const { auth } = await initializeFirebaseServices()
  return auth
}

export async function getFirebaseDb() {
  const { db } = await initializeFirebaseServices()
  return db
}

export async function getFirebaseApp() {
  const { app } = await initializeFirebaseServices()
  return app
}

// Legacy exports for compatibility
export { auth, db, firebaseApp as app }

// Initialize on client load
if (typeof window !== "undefined") {
  initializeFirebaseServices().catch(console.error)
}
