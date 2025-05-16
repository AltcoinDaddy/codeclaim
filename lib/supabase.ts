import { createClient } from "@supabase/supabase-js"

// For client-side usage (with anon key)
const createClientSide = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables for client-side")
    throw new Error("Missing required environment variables for Supabase client")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// For server-side usage (with service role key)
const createServerSide = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables for server-side")
    throw new Error("Missing required environment variables for Supabase server")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Client-side singleton
let clientSideInstance: ReturnType<typeof createClient> | null = null

export const getClientSide = () => {
  if (!clientSideInstance && typeof window !== "undefined") {
    try {
      clientSideInstance = createClientSide()
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      throw error
    }
  }
  return clientSideInstance
}

export const getServerSide = () => {
  try {
    return createServerSide()
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    throw error
  }
}
