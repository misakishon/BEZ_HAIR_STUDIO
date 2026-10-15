<?php
// 1. Define the server credentials matching your InfinityFree Dashboard
$servername = "localhost"; 
$username   = "ilocjhzw_barberDb";             
$password   = "#Barber2026"; // <-- Put your secret MySQL password string here
$dbname     = "ilocjhzw_barber_shop_dbb";  // <-- Put your new database name here (e.g. if0_42024685_barber_shop_db)

// 2. Pass those exact variable names into the connection constructor
$conn = new mysqli($servername, $username, $password, $dbname);

// 3. Verify connection stability
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
$conn->query($sql);

// Select the database
$conn->select_db($dbname);

// ===== CREATE ALL TABLES =====

// 1. Users table (replaces users.json)
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(500),
    role ENUM('user', 'admin', 'barber') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
$conn->query($sql);

// 2. Password reset tokens (replaces password_resets.json)
$sql = "CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email)
)";
$conn->query($sql);

// 3. Barbers table
$sql = "CREATE TABLE IF NOT EXISTS barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    full_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(255),
    experience_years INT,
    bio TEXT,
    profile_image VARCHAR(500),
    rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)";
$conn->query($sql);

// 4. Hairstyles/Services table
$sql = "CREATE TABLE IF NOT EXISTS hairstyles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    category VARCHAR(50),
    image_path VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql);

// 5. Appointments table
$sql = "CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    barber_id INT NOT NULL,
    hairstyle_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'mobile_money') NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (hairstyle_id) REFERENCES hairstyles(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
)";
$conn->query($sql);

// 6. Favorites table
$sql = "CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    barber_id INT NULL,
    hairstyle_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (hairstyle_id) REFERENCES hairstyles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, barber_id, hairstyle_id)
)";
$conn->query($sql);

// 7. Gallery table
$sql = "CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
)";
$conn->query($sql);

// 8. Reviews table
$sql = "CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    user_id INT NOT NULL,
    barber_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (appointment_id)
)";
$conn->query($sql);

// 9. Barber ratings history -- one rating per registered user per barber
$sql = "CREATE TABLE IF NOT EXISTS barber_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    barber_id INT NOT NULL,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_barber (user_id, barber_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
)";
$conn->query($sql);

// 10. Time slots availability
$sql = "CREATE TABLE IF NOT EXISTS time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    max_bookings INT DEFAULT 1,
    current_bookings INT DEFAULT 0,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (barber_id, slot_date, start_time)
)";
$conn->query($sql);

// Migrate old schema to new schema if needed
$result = $conn->query("DESCRIBE users");
$columns = [];
while($row = $result->fetch_assoc()) {
    $columns[$row['Field']] = true;
}

// Add new columns if they don't exist
if(!isset($columns['first_name'])) {
    $conn->query("ALTER TABLE users ADD COLUMN first_name VARCHAR(50) AFTER id");
}
if(!isset($columns['last_name'])) {
    $conn->query("ALTER TABLE users ADD COLUMN last_name VARCHAR(50) AFTER first_name");
}

// ===== INSERT ONLY ADMIN DATA =====

// Sample admin user only
$hashed_password = password_hash("#cuts&fades2026", PASSWORD_DEFAULT);
$conn->query("INSERT INTO users (first_name, last_name, email, password, role) VALUES 
    ('Admin', 'User', 'bezcutsfades@gmail.com', '$hashed_password', 'admin')
    ON DUPLICATE KEY UPDATE id=id");

?>

