import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "smartjobportalapp@gmail.com";
  const pass = process.env.SMTP_PASS || "";

  if (!pass || pass === "your_gmail_app_password") {
    console.log(`[SMTP_LOG] Gmail App Password not configured in .env. Email logging to console mode.`);
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 5000,
    timeout: 5000,
    greetingTimeout: 5000,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || "smartjobportalapp@gmail.com";
  console.log(`[EMAIL_SEND_ATTEMPT] Target: ${to} | Subject: "${subject}"`);

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`[EMAIL_CONSOLE_SIMULATION] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"Smart Job Portal" <${from}>`,
      to,
      subject,
      text: text || "Please open this email in an HTML compatible mail viewer.",
      html,
    });

    console.log(`[EMAIL_SENT_SUCCESS] Message ID: ${info.messageId} | Target: ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL_SEND_FAILURE] Target: ${to} | Error:`, error.message);
    return { success: false, error: error.message };
  }
};

const getBaseHtmlWrapper = (title, contentHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #111827; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 50%, #06b6d4 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #334155; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .badge { display: inline-block; background: rgba(37, 99, 235, 0.1); color: #2563eb; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-weight: 700; border-radius: 12px; margin-top: 20px; text-align: center; shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Smart Job Portal</h1>
      <p>Autonomous AI Job Intelligence & Discovery System</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Smart Job Portal Team. All rights reserved.</p>
      <p>Sent from smartjobportalapp@gmail.com</p>
    </div>
  </div>
</body>
</html>
`;

export const sendAlertCreatedEmail = async ({ user, alert }) => {
  if (!user?.email) return;

  const subject = "🔔 Smart Job Portal Alert Created Successfully";
  const content = `
    <p>Hello <strong>${user.name || "Job Seeker"}</strong>,</p>
    <p>Your Job Alert has been created successfully and is now active.</p>

    <div class="card">
      <span class="badge">ACTIVE ALERT</span>
      <h3 style="margin: 10px 0 6px 0; color: #0f172a;">${alert.title || "Custom Job Alert"}</h3>
      <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; font-weight: 600;">Location:</td><td>${alert.city || "All Locations"}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Category:</td><td>${alert.category || "All Categories"}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Skills:</td><td>${(alert.skills || []).join(", ") || "Any"}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Experience:</td><td style="text-transform: capitalize;">${alert.experienceLevel || "All Levels"}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Frequency:</td><td style="text-transform: capitalize;">${alert.frequency || "Instant"}</td></tr>
      </table>
    </div>

    <p>We'll automatically monitor new job openings and notify you whenever matching vacancies are published.</p>

    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/#/jobs" class="cta-btn">Browse Vacancies Now ↗</a>
    </div>

    <p style="margin-top: 24px;">Regards,<br><strong>Smart Job Portal Team</strong></p>
  `;

  return sendEmail({ to: user.email, subject, html: getBaseHtmlWrapper(subject, content) });
};

export const sendMatchingJobAlertEmail = async ({ user, alert, job }) => {
  if (!user?.email) return;

  const subject = `🔥 New Matching Job Alert: ${job.title}`;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const applyUrl = `${clientUrl}/#/jobs/${job._id}`;

  const content = `
    <p>Hello <strong>${user.name || "Job Seeker"}</strong>,</p>
    <p>A new job vacancy matching your alert <strong>"${alert.title}"</strong> has just been published!</p>

    <div class="card">
      <span class="badge" style="background: #10b981; color: white;">MATCHING VACANCY</span>
      <h2 style="margin: 10px 0 4px 0; color: #0f172a; font-size: 20px;">${job.title}</h2>
      <p style="margin: 0 0 12px 0; color: #2563eb; font-weight: 700;">${job.employer?.companyName || "Verified Employer"}</p>

      <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; font-weight: 600;">Location:</td><td>📍 ${job.location}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Salary:</td><td>💰 ${job.salaryMin ? `${job.currency || "USD"} ${job.salaryMin.toLocaleString()}` : "Competitive"}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Experience:</td><td style="text-transform: capitalize;">🎯 ${job.experienceLevel || "Entry"} Level</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Skills:</td><td>⚡ ${(job.skills || []).join(", ")}</td></tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="${applyUrl}" class="cta-btn">View Job & Apply Now →</a>
    </div>

    <p style="margin-top: 24px;">Best regards,<br><strong>Smart Job Portal Team</strong></p>
  `;

  return sendEmail({ to: user.email, subject, html: getBaseHtmlWrapper(subject, content) });
};

export const sendWelcomeEmail = async ({ user }) => {
  if (!user?.email) return;

  const subject = "🎉 Welcome to Smart Job Portal!";
  const content = `
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>Welcome to Smart Job Portal! Your account has been registered successfully.</p>
    <p>Build your candidate profile, set up city job alerts, and track your application progress in real time.</p>
    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/#/jobs" class="cta-btn">Start Exploring Jobs 🚀</a>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html: getBaseHtmlWrapper(subject, content) });
};

export const sendApplicationEmail = async ({ user, job }) => {
  if (!user?.email) return;

  const subject = `📩 Application Received: ${job.title}`;
  const content = `
    <p>Hello <strong>${user.name}</strong>,</p>
    <p>Your application for <strong>${job.title}</strong> at <strong>${job.employer?.companyName || "Employer"}</strong> has been submitted successfully.</p>
    <p>You can track the progress of your application on your <strong>My Job Tracker</strong> dashboard.</p>
  `;

  return sendEmail({ to: user.email, subject, html: getBaseHtmlWrapper(subject, content) });
};
