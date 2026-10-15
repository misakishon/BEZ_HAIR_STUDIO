<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
    <h2 style="margin-bottom: 12px;">New Contact Message</h2>
    <p>You received a new message from the website contact form.</p>

    <ul style="padding-left: 20px;">
        <li><strong>Name:</strong> {{ $data['full_name'] ?? 'N/A' }}</li>
        <li><strong>Email:</strong> {{ $data['email'] ?? 'N/A' }}</li>
        <li><strong>Phone:</strong> {{ $data['phone'] ?? 'N/A' }}</li>
        <li><strong>Subject:</strong> {{ $data['subject'] ?? 'General Inquiry' }}</li>
    </ul>

    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">{{ $data['message'] ?? '' }}</p>
</body>
</html>
