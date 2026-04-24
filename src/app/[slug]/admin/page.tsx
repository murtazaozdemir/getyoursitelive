export const runtime = "edge";
import { redirect } from "next/navigation";

export default async function ShopAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}/admin/edit`);
}
