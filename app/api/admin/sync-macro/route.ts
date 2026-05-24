import { NextResponse } from "next/server";
import { runMacroSync } from "@/lib/sync/sync-runner";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "Supabase server configuration is missing." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access only." }, { status: 403 });
  }

  try {
    const result = await runMacroSync({
      adminUserId: user.id,
    });

    return NextResponse.json({
      ok: true,
      result,
      summary: {
        status: result.status,
        sourceStatus: result.sourceStatus,
        syncedCount: result.recordsSynced,
        failedCount: result.failedCount,
        draftSnapshotId: result.draftSnapshotId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync macro data.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
