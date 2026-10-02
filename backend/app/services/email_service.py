import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("devnova.email")


class EmailService:
    @staticmethod
    def _is_smtp_configured() -> bool:
        return bool(
            settings.SMTP_HOST
            and settings.SMTP_HOST != "xxxx"
            and settings.SMTP_USERNAME
            and settings.SMTP_USERNAME != "xxxx"
            and settings.SMTP_PASSWORD
            and settings.SMTP_PASSWORD != "xxxx"
        )

    @classmethod
    def send_password_reset_email(cls, to_email: str, token: str) -> bool:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        subject = "Reset Your Password - DevNova"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>DevNova Password Reset</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; }}
                .container {{ max-width: 560px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }}
                .brand {{ font-size: 24px; font-weight: 700; color: #38bdf8; margin-bottom: 24px; }}
                .btn {{ display: inline-block; background-color: #0284c7; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }}
                .footer {{ margin-top: 32px; font-size: 12px; color: #94a3b8; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="brand">DevNova</div>
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your DevNova account. Click the button below to choose a new password:</p>
                <a href="{reset_url}" class="btn" target="_blank">Reset Password</a>
                <p style="margin-top: 24px; font-size: 14px; color: #94a3b8;">
                    If button does not work, copy and paste this URL into your browser:<br>
                    <a href="{reset_url}" style="color: #38bdf8;">{reset_url}</a>
                </p>
                <p style="font-size: 14px; color: #94a3b8;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
                <div class="footer">
                    &copy; DevNova. Explore. Learn. Build.
                </div>
            </div>
        </body>
        </html>
        """

        if cls._is_smtp_configured():
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.SMTP_FROM_EMAIL
                msg["To"] = to_email
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.starttls()
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
                logger.info(f"Password reset email sent to {to_email}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP: {e}")

        # Development fallback / notification
        logger.info(
            f"\n=========================================\n"
            f"[DEVNOVA EMAIL NOTIFICATION]\n"
            f"To: {to_email}\n"
            f"Subject: {subject}\n"
            f"Reset Link: {reset_url}\n"
            f"=========================================\n"
        )
        return True
