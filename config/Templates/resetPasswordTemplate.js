const resetPasswordTemplate = (
  userName,
  userEmail,
  resetLink,
  expiryTime = "1 hour"
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Your SplitWise Password</title>
<style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f0fdf4;
            margin: 0;
            padding: 0;
        }
        
        /* Email container */
        .email-wrapper {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid #e5e7eb;
        }
        
        /* Header with SplitWise gradient */
        .email-header {
            background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
            padding: 48px 40px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .email-header::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .logo {
            margin-bottom: 24px;
            position: relative;
        }
        
        .logo-circle {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
            border: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .splitwise-logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #059669, #10b981);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 24px;
            box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);
        }
        
        .email-header h1 {
            color: white;
            font-size: 32px;
            font-weight: 800;
            margin: 16px 0 8px;
            letter-spacing: -0.5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .email-header p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 18px;
            margin: 0;
            font-weight: 500;
        }
        
        /* Main content */
        .email-content {
            padding: 48px 40px;
            background-color: #ffffff;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #059669;
            margin-bottom: 16px;
        }
        
        .message {
            color: #4b5563;
            font-size: 16px;
            margin-bottom: 24px;
            line-height: 1.8;
        }
        
        .highlight {
            background-color: #ecfdf5;
            color: #065f46;
            padding: 2px 6px;
            border-radius: 6px;
            font-weight: 500;
        }
        
        /* Reset button */
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white !important;
            text-decoration: none;
            padding: 18px 48px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 0.5px;
            box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.4);
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .reset-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 25px -5px rgba(5, 150, 105, 0.5);
        }
        
        /* Divider */
        .divider {
            margin: 32px 0;
            border-top: 2px solid #e5e7eb;
            position: relative;
        }
        
        .divider span {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 20px;
            color: #9ca3af;
            font-size: 14px;
            font-weight: 500;
        }
        
        /* Link info */
        .link-info {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            border: 1px solid #e5e7eb;
        }
        
        .link-info p {
            color: #4b5563;
            font-size: 14px;
            margin-bottom: 12px;
        }
        
        .link-text {
            color: #059669;
            font-size: 14px;
            word-break: break-all;
            font-family: monospace;
            background-color: #ffffff;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #d1d5db;
            font-weight: 500;
        }
        
        /* Warning box */
        .warning-box {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-left: 6px solid #f59e0b;
            padding: 20px 24px;
            border-radius: 16px;
            margin: 32px 0;
            box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1);
        }
        
        .warning-box p {
            color: #92400e;
            font-size: 15px;
            margin: 0;
            line-height: 1.7;
        }
        
        .warning-box strong {
            color: #b45309;
            font-weight: 700;
        }
        
        /* Features */
        .features {
            display: flex;
            justify-content: space-between;
            margin: 40px 0;
            gap: 16px;
        }
        
        .feature {
            flex: 1;
            text-align: center;
            padding: 20px 12px;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 16px;
            border: 1px solid #e5e7eb;
        }
        
        .feature-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #059669;
            font-size: 24px;
            box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.1);
        }
        
        .feature h4 {
            color: #065f46;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 6px;
        }
        
        .feature p {
            color: #6b7280;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
        }
        
        /* Footer */
        .email-footer {
            padding: 40px;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-top: 2px solid #e5e7eb;
            text-align: center;
        }
        
        .footer-logo {
            margin-bottom: 24px;
        }
        
        .footer-logo span {
            color: #059669;
            font-weight: 800;
            font-size: 24px;
            letter-spacing: -0.5px;
        }
        
        .footer-links {
            margin-bottom: 24px;
            display: flex;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
        }
        
        .footer-links a {
            color: #4b5563;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s;
            padding: 4px 8px;
        }
        
        .footer-links a:hover {
            color: #059669;
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin: 12px 0;
            line-height: 1.6;
        }
        
        .copyright {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
        }
        
        .badge {
            display: inline-block;
            background: #ecfdf5;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            margin: 8px 0;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                margin: 20px;
                border-radius: 20px;
            }
            
            .email-header,
            .email-content,
            .email-footer {
                padding: 32px 24px;
            }
            
            .features {
                flex-direction: column;
                gap: 16px;
            }
            
            .reset-button {
                display: block;
                padding: 16px 24px;
            }
            
            .footer-links {
                gap: 16px;
                flex-direction: column;
                align-items: center;
            }
        }
</style>
</head>

<body>
<div class="email-wrapper">

    <!-- Header -->
    <div class="email-header">
        <div class="logo">
            <div class="logo-circle">
                <div class="splitwise-logo">SW</div>
            </div>
        </div>
        <h1>SplitWise</h1>
        <p>Password Reset Request</p>
    </div>

    <!-- Content -->
    <div class="email-content">
        <div class="greeting">👋 Hello ${userName || "User"},</div>

        <p class="message">
            We received a request to reset the password for your 
            <span class="highlight">SplitWise</span> account associated with 
            <strong style="color: #059669;">${userEmail}</strong>.
        </p>

        <p class="message">
            To reset your password, click the button below. 
            For security reasons, this link will expire in 
            <strong style="color: #059669;">${expiryTime}</strong>.
        </p>

        <!-- Reset Button -->
        <div class="button-container">
            <a href="${resetLink}" class="reset-button">
                Reset Password
            </a>
        </div>

        <!-- Alternative Link -->
        <div class="link-info">
            <p style="font-weight: 600; color: #374151;">
                🔗 Link not working? Copy this:
            </p>
            <p class="link-text">${resetLink}</p>
        </div>

        <!-- Warning -->
        <div class="warning-box">
            <p>
                <strong>⚠️ Didn't request this?</strong> 
                If you didn't request a password reset, 
                please ignore this email or contact our support team at 
                <strong>support@splitwise.com</strong>
            </p>
        </div>

        <!-- Features -->
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <h4>Secure Link</h4>
                <p>Encrypted & secure connection</p>
            </div>
            <div class="feature">
                <div class="feature-icon">⏰</div>
                <h4>Expires in ${expiryTime}</h4>
                <p>For your account safety</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🛡️</div>
                <h4>One-Time Use</h4>
                <p>Cannot be reused after reset</p>
            </div>
        </div>

        <!-- Security Tips -->
        <div class="divider">
            <span>Security Tips</span>
        </div>

        <p class="message" style="font-size: 14px; color: #6b7280; text-align: left; background: #f9fafb; padding: 20px; border-radius: 12px;">
            <strong style="color: #059669; display: block; margin-bottom: 8px;">
                🔐 Protect Your Account:
            </strong>
            • Never share this link with anyone<br>
            • SplitWise will never ask for your password<br>
            • Enable two-factor authentication<br>
            • Use a strong, unique password
        </p>
    </div>

    <!-- Footer -->
    <div class="email-footer">
        <div class="footer-logo">
            <span>SplitWise</span>
        </div>

        <div class="badge">
            ✉️ Sent to ${userEmail}
        </div>

        <p class="footer-text">
            This email was sent because a password reset was requested 
            for your SplitWise account.
        </p>

        <p class="copyright">
            © ${new Date().getFullYear()} SplitWise. All rights reserved.
        </p>
    </div>

</div>
</body>
</html>
`;
};

module.exports = resetPasswordTemplate;
