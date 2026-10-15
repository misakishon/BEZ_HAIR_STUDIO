<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-serif="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Service Ticket</title>
    <style type="text/css">
        /* Reset styles for email clients */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }

        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
        .main-card { width: 100%; max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        
        .header-title { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700; margin: 0 0 6px 0; text-align: center; }
        .confirmation-number { font-size: 32px; font-weight: 700; color: #0f172a; margin: 0; text-align: center; letter-spacing: -0.5px; }
        
        .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin: 0 0 16px 0; padding-bottom: 6px; }
        .data-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 4px 0; display: block; }
        .data-value { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; }

        .status-badge { background-color: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }

        .alert-box { background-color: #f0f7ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 24px; }
        .alert-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; font-weight: 700; margin: 0 0 14px 0; }
        .alert-item { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 10px; }
        .alert-item:last-child { margin-bottom: 0; }
        .bullet-check { color: #2563eb; font-weight: bold; margin-right: 8px; display: inline-block; }

        .important-box { background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 24px; margin-top: 24px; }
        .important-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #92400e; font-weight: 700; margin: 0 0 14px 0; }
        .important-item { font-size: 14px; color: #78350f; line-height: 1.6; margin-bottom: 10px; }

        .divider { border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }

        @media screen and (max-width: 525px) {
            .col-stack { display: block !important; width: 100% !important; margin-bottom: 24px !important; }
            .col-stack:last-child { margin-bottom: 0 !important; }
            .padding-mobile { padding: 24px !important; }
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center">
                    <!--[if (gte mso 9)|(IE)]>
                    <table width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td>
                    <![endif]-->
                    <table class="main-card" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td class="padding-mobile" style="padding: 40px;">
                                
                                <!-- Logo Header -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                                    <tr>
                                        <td align="center" style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">
                                            🎫 SERVICE TICKET
                                        </td>
                                    </tr>
                                </table>

                                <!-- Status & Confirmation Block -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 32px; margin-bottom: 32px; text-align: center;">
                                    <tr>
                                        <td style="padding-bottom: 16px;">
                                            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700; margin: 0 0 12px 0;">Your Appointment is Ready</p>
                                            <p style="font-size: 32px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.5px;">{{ $confirmationNumber ?? 'N/A' }}</p>
                                            <div style="display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">✓ CONFIRMED</div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Service Details Section -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px;">
                                    <tr>
                                        <td>
                                            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin: 0 0 16px 0;">Service Details</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <!-- Hairstyle -->
                                                <tr>
                                                    <td style="padding-bottom: 16px;">
                                                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 4px 0;">Service</p>
                                                        <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0;">{{ $hairstyle->name ?? 'Haircut Service' }}</p>
                                                    </td>
                                                </tr>
                                                <!-- Barber -->
                                                <tr>
                                                    <td style="padding-bottom: 16px;">
                                                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 4px 0;">Your Barber</p>
                                                        <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0;">{{ $barber->full_name ?? 'BEZ Hair Studio Barber' }}</p>
                                                        @if(isset($barber) && isset($barber->specialty) && $barber->specialty)
                                                        <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">{{ $barber->specialty }}</p>
                                                        @endif
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Date & Time Split Row -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px;">
                                    <tr>
                                        <!-- Date Column -->
                                        <td class="col-stack" width="48%" valign="top">
                                            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 8px 0;">Appointment Date</p>
                                            <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">
                                                @php
                                                    try {
                                                        $date = \Carbon\Carbon::parse($booking->booking_date ?? null);
                                                        echo $date->format('M d, Y');
                                                    } catch (\Exception $e) {
                                                        echo $booking->booking_date ?? 'N/A';
                                                    }
                                                @endphp
                                            </p>
                                        </td>
                                        <!-- Spacer -->
                                        <td width="4%" class="col-stack"></td>
                                        <!-- Time Column -->
                                        <td class="col-stack" width="48%" valign="top">
                                            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 8px 0;">Appointment Time</p>
                                            <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">
                                                @php
                                                    try {
                                                        // FIXED: Removed 'H:i' as second parameter - it was causing the error
                                                        $time = \Carbon\Carbon::parse($booking->booking_time ?? null);
                                                        echo $time->format('g:i A');
                                                    } catch (\Exception $e) {
                                                        echo $booking->booking_time ?? 'N/A';
                                                    }
                                                @endphp
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Customer Information Section -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px;">
                                    <tr>
                                        <td>
                                            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin: 0 0 16px 0;">Your Information</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <!-- Name -->
                                                <tr>
                                                    <td style="padding-bottom: 16px;">
                                                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 4px 0;">Full Name</p>
                                                        <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0;">{{ $booking->full_name ?? 'N/A' }}</p>
                                                    </td>
                                                </tr>
                                                <!-- Email -->
                                                <tr>
                                                    <td style="padding-bottom: 16px;">
                                                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 4px 0;">Email Address</p>
                                                        <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0;">{{ $booking->email ?? 'N/A' }}</p>
                                                    </td>
                                                </tr>
                                                <!-- Phone -->
                                                <tr>
                                                    <td>
                                                        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 4px 0;">Phone Number</p>
                                                        <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin: 0;">{{ $booking->phone ?? 'N/A' }}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Price Section -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px;">
                                    <tr>
                                        <td style="text-align: right;">
                                            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin: 0 0 8px 0;">Total Amount</p>
                                            <p style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">₱{{ number_format($booking->total_price ?? 0, 2) }}</p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- What's Next Section -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" class="alert-box">
                                    <tr>
                                        <td>
                                            <p class="alert-title">📍 What's Next?</p>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="padding-bottom: 12px;">
                                                        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">
                                                            <span class="bullet-check">✓</span>
                                                            <strong>Arrive 10-15 minutes early</strong> to your appointment time
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 12px;">
                                                        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">
                                                            <span class="bullet-check">✓</span>
                                                            <strong>Bring payment</strong> if paying via cash
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 12px;">
                                                        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">
                                                            <span class="bullet-check">✓</span>
                                                            <strong>Have this ticket ready</strong> to show at the salon
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">
                                                            <span class="bullet-check">✓</span>
                                                            <strong>Questions?</strong> Call us or reply to this email
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Important Notes -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" class="important-box">
                                    <tr>
                                        <td>
                                            <p class="important-title">⏰ Important Reminders</p>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="padding-bottom: 10px;">
                                                        <p style="font-size: 14px; color: #78350f; line-height: 1.6; margin: 0;">
                                                            • If you need to cancel or reschedule, please notify us <strong>24 hours in advance</strong>
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 10px;">
                                                        <p style="font-size: 14px; color: #78350f; line-height: 1.6; margin: 0;">
                                                            • Late arrivals may affect your appointment time
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <p style="font-size: 14px; color: #78350f; line-height: 1.6; margin: 0;">
                                                            • We look forward to seeing you! 💈
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Footer -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
                                    <tr>
                                        <td>
                                            <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">
                                                <strong>BEZ Hair Studio</strong>
                                            </p>
                                            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                                                Thank you for choosing us! We can't wait to serve you.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td></tr></table>
                    <![endif]-->
                </td>
            </tr>
        </table>
    </center>
</body>
</html>