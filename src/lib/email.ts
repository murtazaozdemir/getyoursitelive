import "server-only";

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

interface SendResult {
  ok: boolean;
  error?: string;
}

async function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const { Resend } = await import("resend");
  return new Resend(apiKey);
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

  console.log(`[invite-email] sending from=${FROM} to=${opts.to}`);
  const { data, error } = await resend.emails.send({
    from: FROM,
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
    from: FROM,
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
    if (process.env.NODE_ENV === "production") {
      console.error("[reset-email] RESEND_API_KEY is not set — email not sent");
      return { ok: false, error: "Email service is not configured." };
    }
    console.log(`[reset-email] DEV (no RESEND_API_KEY) to=${opts.to} url=${opts.resetUrl}`);
    return { ok: true };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Reset your Get Your Site Live password",
    html,
  });

  if (error) {
    console.error("[reset-email] resend error", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
