export const dynamic = "force-dynamic";

export async function GET() {
  console.log("[ping] GET");
  return Response.json({
    pong: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "(not set)",
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? "(not set)",
  });
}
