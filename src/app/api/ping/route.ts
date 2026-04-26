export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("pong " + new Date().toISOString());
}
