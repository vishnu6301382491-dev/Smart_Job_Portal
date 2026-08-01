import { sendAlertCreatedEmail, sendMatchingJobAlertEmail, sendWelcomeEmail, sendApplicationEmail } from "../services/emailService.js";

const sendEmail = async ({ to, subject, html, text }) => {
  return sendAlertCreatedEmail({ user: { email: to }, alert: { title: subject } });
};

export { sendAlertCreatedEmail, sendMatchingJobAlertEmail, sendWelcomeEmail, sendApplicationEmail };
export default sendEmail;
