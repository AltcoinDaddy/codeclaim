import { createClient } from "@supabase/supabase-js"

// For client-side usage (with anon key)
const createClientSide = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createClient(supabaseUrl, supabaseAnonKey)
}

// For server-side usage (with service role key)
const createServerSide = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Client-side singleton
let clientSideInstance: ReturnType<typeof createClient> | null = null

export const getClientSide = () => {
  if (!clientSideInstance && typeof window !== "undefined") {
    clientSideInstance = createClientSide()
  }
  return clientSideInstance
}

export const getServerSide = () => {
  return createServerSide()
}
