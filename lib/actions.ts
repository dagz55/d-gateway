"use server"

import { createServerSupabaseClient } from "@/lib/supabase/serverClient"
import { redirect } from "next/navigation"

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/")
}
