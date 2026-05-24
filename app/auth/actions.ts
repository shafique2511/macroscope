"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function encodedMessage(message: string) {
  return encodeURIComponent(message);
}

async function getCurrentUserRole(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role ?? "member";
}

export async function signInMember(formData: FormData) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect(`/login?message=${encodedMessage("Supabase configuration is missing.")}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodedMessage("Invalid email or password.")}`);
  }

  const role = await getCurrentUserRole(supabase);

  if (role === "member") {
    redirect("/dashboard");
  }

  await supabase.auth.signOut();
  redirect(`/admin-login?message=${encodedMessage("Admins should use the admin login page.")}`);
}

export async function signInAdmin(formData: FormData) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect(`/admin-login?message=${encodedMessage("Supabase configuration is missing.")}`);
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/admin-login?message=${encodedMessage("Invalid email or password.")}`);
  }

  const role = await getCurrentUserRole(supabase);

  if (role === "admin") {
    redirect("/admin");
  }

  await supabase.auth.signOut();
  redirect(`/login?message=${encodedMessage("Admin access only.")}`);
}
