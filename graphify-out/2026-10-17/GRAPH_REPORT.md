# Graph Report - BEZ_HAIR_STUDIO  (2026-10-17)

## Corpus Check
- Large corpus: 238 files · ~695,751 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 882 nodes · 1468 edges · 139 communities (32 shown, 107 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 53,187 input · 3,160 output

## Community Hubs (Navigation)
- React UI Components
- Booking Flow Steps
- Booking Logic Controller
- Admin Appointment Management
- Landing Page Assets
- Password Management Controllers
- Admin Resource Controllers
- Admin Auth Middleware
- Appointment API Routes
- Frontend Build Dependencies
- Admin Feature Tests
- TypeScript Configuration
- User Table Migrations
- Route Integration Tests
- Form Validation Requests
- Node Package Configuration
- Auth Session Routes
- User Model Configuration
- Payment Integration Logic
- Public Home Controller
- Time Slot Management
- Password Reset Tests
- Composer Metadata
- PHP Development Dependencies
- Composer Lifecycle Scripts
- Barber Schema Migrations
- Gallery and Ratings Schema
- Frontend Core Config
- Database Seeders
- Email Verification Tests
- App Entry Point
- Laravel Service Providers
- App Bootstrap Configuration
- Composer Plugin Config
- Core PHP Dependencies
- User Profile Tests
- Static Image Assets
- Authentication Tests
- User Management Controller
- PSR-4 Autoload Mapping
- Payment Status Migration
- Barber Certification Migration
- Barber Introduction Migration
- Payment Source Migration
- Booking Source Migration
- Booking Source Update
- Nullable User Migration
- Booking User Migration
- Barber QR Migration
- Booking Receipt Migration
- Barber Pricing Migration
- Booking Confirmation Migration
- Service Ticket Migration
- Confirmation Number Migration
- Booking Column Migration
- Admin User Migration
- Contact Form Tests
- Vite Bundler Config
- Password Confirmation Tests
- Appointments Table Migration
- Hairstyles Table Migration
- Favorites Table Migration
- Reviews Table Migration
- Time Slots Migration
- Bookings Table Migration
- Frontend Chart Dependencies
- Basic Unit Tests
- Tailwind CSS Config
- Hairstyle Data Helpers
- Test Autoloading
- Laravel Package Discovery
- NPM Build Scripts
- Project Documentation Assets
- Global Type Definitions
- Payment UI Assets
- QR Payment Assets
- Branding Logo Assets
- Studio Photography Assets
- Admin Dashboard View
- Barber Data Model
- Booking Data Model
- Hairstyle Data Model
- Studio Group Photo
- PayMongo API Integration
- Studio Interior Photo
- Hairstyle Reference Photo
- Payment Template Asset
- InstaPay QR Code
- Weekly Planner Cover
- Daily Planner Template
- Building Exterior Photo
- Anime Character Illustration
- Minimalist Studio Logo
- Minimalist Studio Logo
- Barber Shop Imagery
- Barber Shop Imagery
- Barber Tool Photography

## God Nodes (most connected - your core abstractions)
1. `react` - 44 edges
2. `Controller` - 38 edges
3. `TestCase` - 32 edges
4. `@inertiajs/react` - 29 edges
5. `User` - 20 edges
6. `BookingController` - 18 edges
7. `compilerOptions` - 14 edges
8. `Sidebar()` - 13 edges
9. `Header()` - 13 edges
10. `InputError()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `GET /test-service-ticket()` --calls--> `ServiceTicket`  [INFERRED]
  routes/web.php → app/Mail/ServiceTicket.php
- `BEZ Hair Studio README` --references--> `BEZ Hair Studio Logo`  [EXTRACTED]
  README.md → public/Logo.png
- `BEZ Hair Studio Logo` --references--> `BEZ Hair Studio Appointment Booking System`  [EXTRACTED]
  public/Logo.png → README.md
- `GCash Payment Receipt UI` --references--> `PayMongo (GCash/QR PH)`  [EXTRACTED]
  public/uploads/paymentImage/1782566769_346908b5-2f70-454a-a1d0-5739f8f97103.jpg → README.md
- `Add New Hairstyle UI Screenshot` --conceptually_related_to--> `BEZ Hair Studio Logo with Crest`  [INFERRED]
  public/uploads/paymentImage/1782961695_Screenshot 2026-06-23 165049.png → resources/assets/bg.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brand Identity Assets** — resources_assets_gemini_svg, resources_assets_bg, resources_assets_bg_png, resources_assets_bg1, resources_assets_bg232, resources_assets_bgphone [EXTRACTED 1.00]
- **Marketing Hero Imagery** — resources_assets_hero_barber_arch_clean, resources_assets_hero_barber_arch_white, resources_assets_hero_barber_arch, resources_assets_hero_tools_placeholder, resources_assets_hero_tools_white [EXTRACTED 1.00]

## Communities (139 total, 107 thin omitted)

### Community 0 - "React UI Components"
Cohesion: 0.11
Nodes (24): @inertiajs/react, react, EmailVerificationProps, Checkbox(), Dropdown(), Props, InputError(), InputLabel() (+16 more)

### Community 1 - "Booking Flow Steps"
Cohesion: 0.07
Nodes (35): Barber, BookingStep1(), BookingStep1Props, ALL_TIME_SLOTS, Barber, BookingStep3(), BookingStep3Props, Hairstyle (+27 more)

### Community 2 - "Booking Logic Controller"
Cohesion: 0.08
Nodes (6): BookingController, ContactController, BookingConfirmation, ContactMessageMail, OtpCode, ServiceTicket

### Community 3 - "Admin Appointment Management"
Cohesion: 0.07
Nodes (31): ALL_TIME_SLOTS, Appointment, Appointments(), AppointmentsProps, BarberOption, MONTHS, TimeSlotOption, WEEKDAYS (+23 more)

### Community 4 - "Landing Page Assets"
Cohesion: 0.09
Nodes (26): Add New Hairstyle UI Screenshot, lucide-react, BEZ Hair Studio Logo with Crest (High Res), BEZ Hair Studio Logo with Crest, UI: BEZ Hair Studio Mobile Splash/Wallpaper, Gemini SVG Logo, Barber Tools and Clippers on Towel, Footer() (+18 more)

### Community 5 - "Password Management Controllers"
Cohesion: 0.10
Nodes (5): ConfirmablePasswordController, EmailVerificationPromptController, NewPasswordController, PasswordResetLinkController, ProfileController

### Community 6 - "Admin Resource Controllers"
Cohesion: 0.11
Nodes (6): BarberController, DashboardController, HairstyleController, EmailVerificationNotificationController, VerifyEmailController, Controller

### Community 7 - "Admin Auth Middleware"
Cohesion: 0.11
Nodes (3): AdminLoginController, EnsureUserIsAdmin, GET /test-service-ticket()

### Community 8 - "Appointment API Routes"
Cohesion: 0.13
Nodes (4): AppointmentController, GET /booking/step-2(), GET /booking/step-3(), HandleInertiaRequests

### Community 9 - "Frontend Build Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, axios, concurrently, @headlessui/react, @inertiajs/react, laravel-vite-plugin, postcss (+11 more)

### Community 10 - "Admin Feature Tests"
Cohesion: 0.15
Nodes (5): AdminBarberQrCodeTest, AdminBarberUploadTest, AdminLoginTest, PasswordUpdateTest, BarberRatingReviewTest

### Community 11 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, module, moduleResolution (+9 more)

### Community 12 - "User Table Migrations"
Cohesion: 0.17
Nodes (7): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}()

### Community 13 - "Route Integration Tests"
Cohesion: 0.15
Nodes (5): AdminRouteTest, RegistrationTest, BookingPaymentRouteTest, ExampleTest, TestCase

### Community 15 - "Node Package Configuration"
Cohesion: 0.13
Nodes (14): private, $schema, type, autoprefixer, chart.js, concurrently, @headlessui/react, postcss (+6 more)

### Community 16 - "Auth Session Routes"
Cohesion: 0.15
Nodes (3): AuthenticatedSessionController, PasswordController, RegisteredUserController

### Community 19 - "Public Home Controller"
Cohesion: 0.20
Nodes (3): {closure#1}(), {closure#4}(), HomeController

### Community 22 - "Composer Metadata"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 23 - "PHP Development Dependencies"
Cohesion: 0.22
Nodes (9): require-dev, fakerphp/faker, laravel/breeze, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision (+1 more)

### Community 24 - "Composer Lifecycle Scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 27 - "Frontend Core Config"
Cohesion: 0.22
Nodes (4): axios, @inertiajs/core, PageProps, Window

### Community 30 - "App Entry Point"
Cohesion: 0.29
Nodes (5): react-dom, ConnectionSpeed, createLoadingScreen(), getConnectionSpeed(), loader

### Community 33 - "Composer Plugin Config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 34 - "Core PHP Dependencies"
Cohesion: 0.29
Nodes (7): require, inertiajs/inertia-laravel, laravel/framework, laravel/sanctum, laravel/tinker, php, tightenco/ziggy

### Community 36 - "Static Image Assets"
Cohesion: 0.33
Nodes (5): *.jpeg, *.jpg, *.png, *.svg, *.webp

### Community 39 - "PSR-4 Autoload Mapping"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 58 - "Vite Bundler Config"
Cohesion: 0.40
Nodes (3): laravel-vite-plugin, vite, @vitejs/plugin-react

### Community 67 - "Frontend Chart Dependencies"
Cohesion: 0.50
Nodes (4): dependencies, chart.js, lucide-react, @types/chart.js

### Community 72 - "Test Autoloading"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 73 - "Laravel Package Discovery"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 74 - "NPM Build Scripts"
Cohesion: 0.67
Nodes (3): scripts, build, dev

### Community 75 - "Project Documentation Assets"
Cohesion: 0.67
Nodes (3): BEZ Hair Studio Logo, BEZ Hair Studio README, BEZ Hair Studio Appointment Booking System

## Knowledge Gaps
- **44 isolated node(s):** `@headlessui/react`, `@tailwindcss/vite`, `@types/node`, `@types/react`, `@types/react-dom` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 432 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **107 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React UI Components` to `Booking Flow Steps`, `Admin Appointment Management`, `Landing Page Assets`, `Node Package Configuration`, `App Entry Point`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `@headlessui/react`, `@tailwindcss/vite`, `@types/node` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.10519480519480519 - nodes in this community are weakly interconnected._
- **Why does `User` connect `User Model Configuration` to `User Profile Tests`, `Password Management Controllers`, `Authentication Tests`, `Admin Auth Middleware`, `Admin Feature Tests`, `Form Validation Requests`, `Password Reset Tests`, `Password Confirmation Tests`, `Database Seeders`, `Email Verification Tests`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `Booking Flow Steps` be split into smaller, more focused modules?**
  _Cohesion score 0.07400555041628122 - nodes in this community are weakly interconnected._
- **Why does `TestCase` connect `Route Integration Tests` to `User Profile Tests`, `Authentication Tests`, `Admin Feature Tests`, `Password Reset Tests`, `Contact Form Tests`, `Password Confirmation Tests`, `Email Verification Tests`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `Booking Logic Controller` be split into smaller, more focused modules?**
  _Cohesion score 0.07716701902748414 - nodes in this community are weakly interconnected._