export const runtime = "edge";
import { redirect, notFound } from "next/navigation";
import { getProspectByShortId } from "@/lib/prospects";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shortId = parseInt(id, 10);
  if (isNaN(shortId)) notFound();

  const prospect = await getProspectByShortId(shortId);
  if (!prospect) notFound();

  redirect(`/${prospect.slug}`);
}
