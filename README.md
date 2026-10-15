# Hair Studio Appointment Booking System

#### Video Demo: <[YOUR YOUTUBE URL HERE](https://youtu.be/mrUQ_f0GOzY)>

#### Description:

Developed a full-stack appointment booking and management system for a hair studio named BEZ using Laravel and React. The platform features a responsive user-facing web application with modern UI design, an interactive multi-step booking flow, email verification, and secure online payments via GCash (PayMongo). It also includes a comprehensive Admin Dashboard (accessible at `/admin/dashboard`) for monitoring revenue trends, managing time slots, tracking appointments, and overseeing studio operations.

## Project Architecture & File Structure

- **`resources/js/` & `resources/views/`:** Contains the modern React frontend components and Blade views powering the responsive user-facing booking interface and multi-step wizard.
- **`app/Http/Controllers/`:** Handles server-side business logic, including appointment routing, data validation, status updates, and administrative management.
- **`database/`:** Manages relational database migrations, seeders, and SQLite/MySQL data storage for barbers, hairstyles, client records, and transactions.
- **`routes/web.php`:** Defines the application endpoints, including public booking paths and protected administrative routes such as `http://127.0.0.1:8000/admin/dashboard`.

## Design Choices & Implementation Details

- **Laravel & React Stack:** Chosen to combine Laravel's robust, secure server-side routing and database ORM with React's dynamic, component-driven UI capabilities for a seamless user experience.
- **Multi-Step Booking Flow:** Structured into logical sequential steps (Barber Selection -> Date/Time Selection -> Contact Information & Verification -> Secure Payment) to minimize user error and drop-off rates.
- **Payment & Verification Integration:** Implemented verification codes sent via email along with PayMongo (QR PH/GCash) support to mirror real-world production payment workflows.
- **Admin Dashboard:** Designed a centralized management hub enabling studio staff to review analytics trends, track appointment statuses (pending, confirmed, completed), and handle day-to-day scheduling.
