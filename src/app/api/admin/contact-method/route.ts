"use server";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getTaskItemSlug } from "@/lib/tasks";
import { updateProspect } from "@/lib/prospects";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { itemIds, contactMethod } = body as { itemIds: string[]; contactMethod: string };

  if (!itemIds?.length || !contactMethod) {
    return NextResponse.json({ error: "Missing itemIds or contactMethod" }, { status: 400 });
  }

  for (const itemId of itemIds) {
    const slug = await getTaskItemSlug(itemId);
    if (slug) {
      await updateProspect(slug, { contactMethod });
    }
  }

  console.log(`[api/contact-method] saved method=${contactMethod} count=${itemIds.length} user=${user.email}`);
  return NextResponse.json({ ok: true });
}
