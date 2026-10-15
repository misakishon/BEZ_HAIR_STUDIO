<?php
/**
 * ONE-TIME DATABASE INSTALLATION SCRIPT
 * Run this script once to create all tables on InfinityFree
 * DELETE THIS FILE AFTER RUNNING!
 */

// ============================================
// DATABASE CONFIGURATION - UPDATE THESE!
// ============================================
$host = 'localhost';
$dbname = 'ilocjhzw_barber_shop_db';
$username = 'ilocjhzw_barberDb';
$password = '#Barber2026';

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================

header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html>
<html>
<head>
    <title>Database Installer</title>
    <style>
        body { font-family: "Segoe UI", Arial, sans-serif; max-width: 900px; margin: 20px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #c9a84c; padding-bottom: 10px; }
        .success { color: #155724; background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }
        .error { color: #721c24; background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #dc3545; }
        .info { color: #0c5460; background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #17a2b8; }
        .table-list { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .table-list li { padding: 5px 0; border-bottom: 1px solid #eee; list-style: none; }
        .table-list li:last-child { border-bottom: none; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
        .badge-success { background: #28a745; color: white; }
        .badge-danger { background: #dc3545; color: white; }
    </style>
</head>
<body>
<div class="container">
    <h1>🔧 BEZ Hair Studio - Database Installer</h1>
    <p>Installing database tables on InfinityFree...</p>
    <hr>';

// Connect to database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo '<div class="success">✅ Connected to database successfully!</div>';
} catch (PDOException $e) {
    echo '<div class="error">❌ Database connection failed: ' . $e->getMessage() . '</div>';
    echo '<p><strong>Please check your database credentials and try again.</strong></p>';
    echo '</div></body></html>';
    exit;
}

// ============================================
// SQL DEFINITIONS - ALL TABLES
// ============================================

$sqls = [];

// 1. USERS TABLE
$sqls[] = "CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `profile_image` VARCHAR(500) NULL,
    `role` ENUM('user', 'admin', 'barber') DEFAULT 'user',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 2. PASSWORD RESET TOKENS
$sqls[] = "CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `email` VARCHAR(100) NOT NULL PRIMARY KEY,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 3. SESSIONS
$sqls[] = "CREATE TABLE IF NOT EXISTS `sessions` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `user_id` INT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `payload` LONGTEXT NOT NULL,
    `last_activity` INT NOT NULL,
    INDEX `sessions_user_id_index` (`user_id`),
    INDEX `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 4. BARBERS TABLE
$sqls[] = "CREATE TABLE IF NOT EXISTS `barbers` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `specialty` VARCHAR(255) NULL,
    `experience_years` INT NULL,
    `bio` TEXT NULL,
    `introduction` TEXT NULL,
    `certifications` TEXT NULL,
    `profile_image` VARCHAR(500) NULL,
    `rating` DECIMAL(2,1) DEFAULT 4.9,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `duration_minutes` INT NOT NULL,
    `category` VARCHAR(50) NULL,
    `image_path` VARCHAR(500) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 6. BOOKINGS TABLE
$sqls[] = "CREATE TABLE IF NOT EXISTS `bookings` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NULL,
    `barber_id` INT NULL,
    `hairstyle_id` INT NOT NULL,
    `booking_date` DATE NOT NULL,
    `booking_time` TIME NOT NULL,
    `total_price` DECIMAL(10,2) NOT NULL,
    `payment_method` ENUM('cash', 'gcash', 'card') DEFAULT 'cash',
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    `payment_source_id` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'pending',
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`hairstyle_id`) REFERENCES `hairstyles`(`id`) ON DELETE CASCADE,
    INDEX `bookings_booking_date_index` (`booking_date`),
    INDEX `bookings_status_index` (`status`),
    INDEX `bookings_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 7. FAVORITES TABLE
$sqls[] = "CREATE TABLE IF NOT EXISTS `favorites` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `barber_id` INT NULL,
    `hairstyle_id` INT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`hairstyle_id`) REFERENCES `hairstyles`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_favorite` (`user_id`, `barber_id`, `hairstyle_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 8. GALLERY TABLE
$sqls[] = "CREATE TABLE IF NOT EXISTS `gallery` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image_path` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NULL,
    `uploaded_by` INT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 9. BARBER RATINGS
$sqls[] = "CREATE TABLE IF NOT EXISTS `barber_ratings` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `barber_id` INT NOT NULL,
    `rating` INT NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_barber` (`user_id`, `barber_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 10. REVIEWS TABLE
$sqls[] = "CREATE TABLE IF NOT EXISTS `reviews` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `appointment_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `barber_id` INT NOT NULL,
    `rating` INT NOT NULL,
    `comment` TEXT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`appointment_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `reviews_appointment_id_unique` (`appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// 11. TIME SLOTS
$sqls[] = "CREATE TABLE IF NOT EXISTS `time_slots` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `barber_id` INT NULL,
    `slot_date` DATE NOT NULL,
    `slot_time` TIME NOT NULL,
    `is_available` BOOLEAN DEFAULT TRUE,
    `max_bookings` INT DEFAULT 1,
    `current_bookings` INT DEFAULT 0,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL,
    FOREIGN KEY (`barber_id`) REFERENCES `barbers`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_slot` (`barber_id`, `slot_date`, `slot_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

// ============================================
// EXECUTE ALL SQL STATEMENTS
// ============================================

$successCount = 0;
$errorCount = 0;
$tables = [];

echo '<h2>📋 Creating Tables...</h2>';

foreach ($sqls as $index => $sql) {
    try {
        $pdo->exec($sql);
        $successCount++;
        
        // Extract table name from SQL
        preg_match('/CREATE TABLE IF NOT EXISTS `([^`]+)`/', $sql, $matches);
        if (isset($matches[1])) {
            $tables[] = $matches[1];
        }
        
        echo '<div class="success">✅ Table created successfully!</div>';
    } catch (PDOException $e) {
        $errorCount++;
        // Check if table already exists
        if (strpos($e->getMessage(), 'already exists') !== false) {
            echo '<div class="info">ℹ️ Table already exists (skipped)</div>';
            $successCount++; // Count as success since it exists
        } else {
            echo '<div class="error">❌ Error: ' . $e->getMessage() . '</div>';
        }
    }
}

// ============================================
// INSERT SAMPLE DATA
// ============================================

echo '<hr><h2>📊 Inserting Sample Data...</h2>';

// Sample Barbers
$sampleBarbers = [
    ['James Wilson', 'Master Barber', 8, 'Specializing in classic cuts and modern styles with over 8 years of experience.', 'James is a master barber who takes pride in delivering precision cuts that enhance your natural features.', 4.9, 128],
    ['Michael Chen', 'Fade Specialist', 5, 'Expert in skin fades with a keen eye for detail.', 'Michael\'s attention to detail and expertise in fades makes him one of the most sought-after barbers.', 4.8, 95],
    ['David Rodriguez', 'Classic Cuts', 6, 'Traditional barbering techniques with a modern approach to classic haircut styles.', 'David brings a touch of tradition to modern cuts, creating timeless looks for every client.', 4.7, 72]
];

$barberInserted = 0;
foreach ($sampleBarbers as $barber) {
    try {
        $stmt = $pdo->prepare("INSERT IGNORE INTO `barbers` (`full_name`, `specialty`, `experience_years`, `bio`, `introduction`, `rating`, `total_reviews`, `is_available`) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
        $stmt->execute($barber);
        $barberInserted++;
    } catch (PDOException $e) {
        // Ignore duplicate errors
    }
}
echo '<div class="success">✅ Inserted ' . $barberInserted . ' sample barbers</div>';

// Sample Hairstyles
$sampleHairstyles = [
    ['Classic Taper', 'Classic Cuts', 'A timeless taper cut that gradually shortens from the top down to the neckline.', 25.00, 30],
    ['Skin Fade', 'Modern Fades', 'High-contrast fade that blends from skin to longer hair on top.', 30.00, 35],
    ['Textured Crop', 'Textured & Styled', 'Short, textured top with clean sides. Low maintenance and stylish.', 28.00, 30],
    ['Buzz Cut', 'Specialty Services', 'Uniform short length all around. Clean, bold, and effortless.', 20.00, 20]
];

$hairstyleInserted = 0;
foreach ($sampleHairstyles as $hairstyle) {
    try {
        $stmt = $pdo->prepare("INSERT IGNORE INTO `hairstyles` (`name`, `category`, `description`, `price`, `duration_minutes`, `is_active`) 
                               VALUES (?, ?, ?, ?, ?, 1)");
        $stmt->execute($hairstyle);
        $hairstyleInserted++;
    } catch (PDOException $e) {
        // Ignore duplicate errors
    }
}
echo '<div class="success">✅ Inserted ' . $hairstyleInserted . ' sample hairstyles</div>';

// ============================================
// SUMMARY
// ============================================

echo '<hr><h2>📊 Installation Summary</h2>';

echo '<div class="table-list">';
echo '<p><strong>Tables Created:</strong></p>';
echo '<ul>';
foreach ($tables as $table) {
    echo '<li>✅ ' . $table . '</li>';
}
echo '</ul>';
echo '</div>';

echo '<div class="info">';
echo '<p><strong>Statistics:</strong></p>';
echo '<ul style="list-style: none; padding-left: 0;">';
echo '<li>📦 Total Tables: ' . count($tables) . '</li>';
echo '<li>✅ Successful: ' . $successCount . '</li>';
echo '<li>❌ Errors: ' . $errorCount . '</li>';
echo '<li>👤 Barbers inserted: ' . $barberInserted . '</li>';
echo '<li>💇 Hairstyles inserted: ' . $hairstyleInserted . '</li>';
echo '</ul>';
echo '</div>';

if ($errorCount == 0) {
    echo '<div class="success" style="font-size: 18px; text-align: center; padding: 20px;">
        🎉 <strong>Database installation completed successfully!</strong><br>
        Your tables are ready to use.
    </div>';
} else {
    echo '<div class="error" style="font-size: 16px; text-align: center; padding: 20px;">
        ⚠️ Some errors occurred. Please check the output above.
    </div>';
}

echo '<hr>';
echo '<div class="info">';
echo '<p><strong>⚠️ IMPORTANT:</strong></p>';
echo '<p>Please <strong>DELETE THIS FILE</strong> after installation for security reasons.</p>';
echo '<p>Delete: <code>install-database.php</code></p>';
echo '</div>';

echo '
    <p style="margin-top: 20px;">
        <a href="/" style="display: inline-block; padding: 10px 30px; background: #c9a84c; color: white; text-decoration: none; border-radius: 5px;">Go to Homepage</a>
    </p>
';

echo '</div></body></html>';
?>