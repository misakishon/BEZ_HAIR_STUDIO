<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-serif="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Booking Confirmation</title>
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

        .alert-box { background-color: #f0f7ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 24px; }
        .alert-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; font-weight: 700; margin: 0 0 14px 0; }
        .alert-item { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 10px; }
        .alert-item:last-child { margin-bottom: 0; }
        .bullet-check { color: #2563eb; font-weight: bold; margin-right: 8px; display: inline-block; }

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
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td align="center" style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">
                                            BEZ<span style="color:#2563eb;">.</span> <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color:#94a3b8; font-weight:500; margin-left: 4px;">Hair Studio</span>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Confirmation Block -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 32px; margin-bottom: 32px;">
                                    <tr>
                                        <td>
                                            <p class="header-title">Confirmation Number</p>
                                            <h1 class="confirmation-number">{{ $confirmationNumber ?? 'N/A' }}</h1>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Section: Service & Date/Time split row -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 32px;">
                                    <tr>
                                        <!-- Service Details Column -->
                                        <td class="col-stack" width="48%" valign="top">
                                            <h2 class="section-title">Service Details</h2>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Service</span>
                                                        <p class="data-value">{{ $booking->hairstyle_name ?? 'Haircut Service' }}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Barber</span>
                                                        <p class="data-value">{{ $booking->barber_name ?? 'BEZ Hair Studio' }}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                        <!-- Spacer Column -->
                                        <td width="4%" class="col-stack"></td>
                                        <!-- Date & Time Column -->
                                        <td class="col-stack" width="48%" valign="top">
                                            <h2 class="section-title">Date & Time</h2>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Date</span>
                                                        <p class="data-value">
                                                            @php
                                                                try {
                                                                    $date = \Carbon\Carbon::parse($booking->booking_date ?? null);
                                                                    echo $date->format('F j, Y');
                                                                } catch (\Exception $e) {
                                                                    echo 'N/A';
                                                                }
                                                            @endphp
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Time</span>
                                                        <p class="data-value">
                                                            @php
                                                                try {
                                                                    $time = \Carbon\Carbon::parse($booking->booking_time ?? null);
                                                                    echo $time->format('g:i A');
                                                                } catch (\Exception $e) {
                                                                    echo 'N/A';
                                                                }
                                                            @endphp
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Section: Customer Information split row -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 32px;">
                                    <tr>
                                        <!-- Info Left Column -->
                                        <td class="col-stack" width="48%" valign="top">
                                            <h2 class="section-title">Your Information</h2>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Name</span>
                                                        <p class="data-value">{{ $booking->full_name ?? $booking->customer_name ?? 'N/A' }}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Phone</span>
                                                        <p class="data-value">{{ $booking->phone ?? $booking->customer_phone ?? 'N/A' }}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                        <!-- Spacer Column -->
                                        <td width="4%" class="col-stack"></td>
                                        <!-- Info Right Column -->
                                        <td class="col-stack" width="48%" valign="top">
                                            <h2 class="section-title" style="color: #ffffff; -webkit-text-fill-color: #ffffff; user-select: none;">&nbsp;</h2>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Email</span>
                                                        <p class="data-value" style="word-break: break-all; font-size:14px;">{{ $booking->email ?? $booking->customer_email ?? 'N/A' }}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td>
                                                        <span class="data-label">Payment Method</span>
                                                        <p class="data-value">{{ ucfirst($booking->payment_method ?? 'N/A') }}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Total Amount Row -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                                    <tr>
                                        <td class="data-label" style="font-weight:700; padding:0;">Total Amount</td>
                                        <td align="right" style="font-size: 26px; font-weight: 700; color: #0f172a; padding:0;">
                                            ₱{{ isset($booking->total_price) ? number_format($booking->total_price, 2) : '0.00' }}
                                        </td>
                                    </tr>
                                </table>

                                <!-- "What's Next" Container Table -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td class="alert-box">
                                            <h3 class="alert-title">What's Next?</h3>
                                            <div class="alert-item">
                                                <span class="bullet-check">✓</span> A confirmation email has been sent to <strong>{{ $booking->email ?? $booking->customer_email ?? 'your email' }}</strong>
                                            </div>
                                            <div class="alert-item">
                                                <span class="bullet-check">✓</span> Please arrive 5-10 minutes before your appointment
                                            </div>
                                            <div class="alert-item">
                                                <span class="bullet-check">✓</span> If you need to reschedule, contact us at least 24 hours in advance
                                            </div>
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