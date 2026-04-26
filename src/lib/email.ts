import { getCloudflareContext } from "@opennextjs/cloudflare";

const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL ?? "info@getyoursitelive.com";

interface SendResult {
  ok: boolean;
  error?: string;
}

async function getCfEnv(): Promise<Record<string, unknown>> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as unknown as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function getEnvVar(name: string): Promise<string | undefined> {
  // process.env works in local dev
  if (process.env[name]) return process.env[name];
  // Cloudflare Workers: secrets live on the env bindings, not process.env
  const cf = await getCfEnv();
  const val = cf[name];
  return typeof val === "string" ? val : undefined;
}

async function getResend() {
  const apiKey = await getEnvVar("RESEND_API_KEY");
  console.log(`[email] getResend apiKey=${apiKey ? "set (" + apiKey.slice(0, 8) + "...)" : "MISSING"}`);
  if (!apiKey) return null;
  const { Resend } = await import("resend");
  return new Resend(apiKey);
}

async function getFromEmail(): Promise<string> {
  return (await getEnvVar("RESEND_FROM_EMAIL")) ?? "info@getyoursitelive.com";
}

export async function sendAdminInviteEmail(opts: {
  to: string;
  inviteUrl: string;
  invitedBy: string;
  role: string;
}): Promise<SendResult> {
  const resend = await getResend();

  const html = `
    <p>Hi,</p>
    <p><strong>${opts.invitedBy}</strong> has invited you to join the
    <strong>Get Your Site Live</strong> admin platform as a
    <strong>${opts.role === "admin" ? "Admin" : "Business Owner"}</strong>.</p>
    <p>Click the link below to accept your invitation and create your account.
    The link expires in 7 days.</p>
    <p><a href="${opts.inviteUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Accept Invitation →</a></p>
    <p>Or copy this URL into your browser:<br><code>${opts.inviteUrl}</code></p>
    <p style="color:#888;font-size:13px">If you weren't expecting this, you can ignore this email.</p>
  `;

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      console.error("[invite-email] RESEND_API_KEY is not set — email not sent");
      return { ok: false, error: "Email service is not configured. Contact the platform administrator." };
    }
    // Dev/staging: log to console so you can grab the invite URL
    console.log(`[invite-email] DEV (no RESEND_API_KEY) to=${opts.to} url=${opts.inviteUrl}`);
    return { ok: true };
  }

  const from = await getFromEmail();
  console.log(`[invite-email] sending from=${from} to=${opts.to}`);
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: "You've been invited to Get Your Site Live",
    html,
  });

  if (error) {
    console.error("[invite-email] resend error", JSON.stringify(error));
    return { ok: false, error: error.message };
  }
  console.log(`[invite-email] sent id=${data?.id}`);

  return { ok: true };
}

export async function sendAdminWelcomeEmail(opts: {
  to: string;
  name: string;
  loginUrl: string;
  role: string;
}): Promise<SendResult> {
  const resend = await getResend();

  const html = `
    <p>Hi ${opts.name},</p>
    <p>Your <strong>Get Your Site Live</strong> account is ready.
    You've been added as a <strong>${opts.role === "admin" ? "Admin" : "Business Owner"}</strong>.</p>
    <p>Sign in here:</p>
    <p><a href="${opts.loginUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Sign in →</a></p>
    <p>URL: <code>${opts.loginUrl}</code></p>
    <p style="color:#888;font-size:13px">Get Your Site Live — getyoursitelive.com</p>
  `;

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      console.error("[welcome-email] RESEND_API_KEY is not set — email not sent");
      return { ok: false, error: "Email service is not configured." };
    }
    console.log(`[welcome-email] DEV (no RESEND_API_KEY) to=${opts.to} loginUrl=${opts.loginUrl}`);
    return { ok: true };
  }

  const { error } = await resend.emails.send({
    from: await getFromEmail(),
    to: opts.to,
    subject: "Your Get Your Site Live account is ready",
    html,
  });

  if (error) {
    console.error("[welcome-email] resend error", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  resetUrl: string;
}): Promise<SendResult> {
  const resend = await getResend();

  const html = `
    <p>Hi,</p>
    <p>We received a request to reset your <strong>Get Your Site Live</strong> password.</p>
    <p>Click the link below to choose a new password. The link expires in 1 hour.</p>
    <p><a href="${opts.resetUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Reset password →</a></p>
    <p>Or copy this URL into your browser:<br><code>${opts.resetUrl}</code></p>
    <p style="color:#888;font-size:13px">If you didn't request a password reset, you can ignore this email. Your password won't change.</p>
  `;

  if (!resend) {
    console.error("[reset-email] RESEND_API_KEY is not set — email not sent");
    return { ok: false, error: "Email service is not configured." };
  }

  const from = await getFromEmail();
  console.log(`[reset-email] sending from=${from} to=${opts.to}`);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: "Reset your Get Your Site Live password",
      html,
    });

    if (error) {
      console.error("[reset-email] resend error", JSON.stringify(error));
      return { ok: false, error: error.message };
    }
    console.log(`[reset-email] sent id=${data?.id}`);
  } catch (e) {
    console.error("[reset-email] exception", e);
    return { ok: false, error: String(e) };
  }

  return { ok: true };
}

export async function sendUnmatchedCategoryAlert(opts: {
  category: string;
  businessName: string;
  slug: string;
  address: string;
  addedBy: string;
}): Promise<SendResult> {
  const resend = await getResend();

  const html = `
    <p><strong>Unmapped Google Category Detected</strong></p>
    <p>A prospect was added with a Google category that doesn't match any template.
    It was assigned the <strong>generic</strong> template (minimal content).</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;font-weight:600">Category:</td><td style="padding:4px 0"><code>${opts.category}</code></td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:600">Business:</td><td style="padding:4px 0">${opts.businessName}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:600">Slug:</td><td style="padding:4px 0">${opts.slug}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:600">Address:</td><td style="padding:4px 0">${opts.address}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:600">Added by:</td><td style="padding:4px 0">${opts.addedBy}</td></tr>
    </table>
    <p><strong>What to do:</strong></p>
    <ol>
      <li>Decide if this category belongs in an existing template (e.g. add it to auto-repair's categories list)</li>
      <li>Or create a new template file at <code>src/lib/templates/{vertical}.ts</code></li>
      <li>Register it in <code>src/lib/templates/registry.ts</code></li>
      <li>Rebuild and push — new prospects with this category will then get the right content</li>
    </ol>
    <p style="color:#888;font-size:13px">This prospect's site preview is live but has generic placeholder content until a matching template is assigned.</p>
  `;

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      console.error("[unmatched-category] RESEND_API_KEY not set — category='${opts.category}' business='${opts.businessName}'");
      return { ok: false, error: "Email service is not configured." };
    }
    console.log("[unmatched-category] DEV — category='${opts.category}' business='${opts.businessName}' slug='${opts.slug}'");
    return { ok: true };
  }

  const { error } = await resend.emails.send({
    from: await getFromEmail(),
    to: FOUNDER_EMAIL,
    subject: "Unmapped category: " + opts.category + " — " + opts.businessName,
    html,
  });

  if (error) {
    console.error("[unmatched-category] resend error", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
