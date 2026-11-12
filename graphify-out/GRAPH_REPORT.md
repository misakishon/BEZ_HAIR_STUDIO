# Graph Report - BEZ_HAIR_STUDIO  (2026-11-13)

## Corpus Check
- 202 files · ~69,913 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: (none) 17, .css 3, .example 1)

## Summary
- 901 nodes · 1529 edges · 142 communities (37 shown, 105 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3672fd06`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- React UI Components
- step2.tsx
- Booking Logic Controller
- dashboard.tsx
- Home.tsx
- Password Management Controllers
- Admin Resource Controllers
- Admin Auth Middleware
- Appointment API Routes
- Frontend Build Dependencies
- Illuminate\Foundation\Testing\RefreshDatabase
- TypeScript Configuration
- User Table Migrations
- Route Integration Tests
- Form Validation Requests
- Node Package Configuration
- Auth Session Routes
- User
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
- popularSection.tsx
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
- Hairstyles.tsx
- Appointments.tsx
- PasswordConfirmationTest
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
- Barber Tools and Clippers on Towel
- BEZ Hair Studio Logo with Crest
- AchievementsSection.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 48 edges
2. `Controller` - 38 edges
3. `TestCase` - 32 edges
4. `@inertiajs/react` - 31 edges
5. `lucide-react` - 21 edges
6. `User` - 20 edges
7. `BookingController` - 18 edges
8. `Sidebar()` - 15 edges
9. `compilerOptions` - 14 edges
10. `Header()` - 13 edges

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

## Communities (142 total, 105 thin omitted)

### Community 0 - "React UI Components"
Cohesion: 0.09
Nodes (27): @inertiajs/react, react, EmailVerificationProps, Checkbox(), Dropdown(), Props, InputError(), InputLabel() (+19 more)

### Community 1 - "step2.tsx"
Cohesion: 0.07
Nodes (38): Barber, BookingStep1(), BookingStep1Props, ALL_TIME_SLOTS, Barber, BookingStep3(), BookingStep3Props, Hairstyle (+30 more)

### Community 2 - "Booking Logic Controller"
Cohesion: 0.08
Nodes (6): BookingController, ContactController, BookingConfirmation, ContactMessageMail, OtpCode, ServiceTicket

### Community 3 - "dashboard.tsx"
Cohesion: 0.12
Nodes (20): ALL_TIME_SLOTS, Dashboard(), DashboardProps, formatPeso(), MONTH_NAMES_SHORT, MONTHS, TimeSlot, WEEKDAYS (+12 more)

### Community 4 - "Home.tsx"
Cohesion: 0.20
Nodes (11): lucide-react, Footer(), Home(), HomeProps, Barber, BarbersSection(), BarbersSectionProps, ContactSection() (+3 more)

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

### Community 10 - "Illuminate\Foundation\Testing\RefreshDatabase"
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

### Community 59 - "popularSection.tsx"
Cohesion: 0.25
Nodes (8): Barber, Barbers(), BarbersProps, DEFAULT_HAIRSTYLES, Hairstyle, PopularHairstyles(), PopularHairstylesProps, resolveUploadImageUrl()

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

### Community 82 - "Hairstyles.tsx"
Cohesion: 0.23
Nodes (12): AdminConfirmModal(), AdminConfirmModalProps, AdminToast(), AdminToastProps, ToastMessage, Appointments(), Hairstyle, Hairstyles() (+4 more)

### Community 83 - "Appointments.tsx"
Cohesion: 0.22
Nodes (7): ALL_TIME_SLOTS, Appointment, AppointmentsProps, BarberOption, MONTHS, TimeSlotOption, WEEKDAYS

### Community 141 - "BEZ Hair Studio Logo with Crest"
Cohesion: 0.40
Nodes (5): Add New Hairstyle UI Screenshot, BEZ Hair Studio Logo with Crest (High Res), BEZ Hair Studio Logo with Crest, UI: BEZ Hair Studio Mobile Splash/Wallpaper, Gemini SVG Logo

### Community 142 - "AchievementsSection.tsx"
Cohesion: 0.50
Nodes (4): StatCard(), StatItemData, statsData, StatsSection()

## Knowledge Gaps
- **41 isolated node(s):** `autoprefixer`, `chart.js`, `concurrently`, `@headlessui/react`, `postcss` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 441 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **105 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React UI Components` to `step2.tsx`, `dashboard.tsx`, `Home.tsx`, `AchievementsSection.tsx`, `Node Package Configuration`, `Hairstyles.tsx`, `Appointments.tsx`, `popularSection.tsx`, `App Entry Point`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `autoprefixer`, `chart.js`, `concurrently` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.0907103825136612 - nodes in this community are weakly interconnected._
- **Why does `User` connect `User` to `User Profile Tests`, `Password Management Controllers`, `Authentication Tests`, `Admin Auth Middleware`, `Illuminate\Foundation\Testing\RefreshDatabase`, `Form Validation Requests`, `PasswordConfirmationTest`, `Password Reset Tests`, `Database Seeders`, `Email Verification Tests`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `step2.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06775510204081632 - nodes in this community are weakly interconnected._
- **Why does `TestCase` connect `Route Integration Tests` to `User Profile Tests`, `Authentication Tests`, `Illuminate\Foundation\Testing\RefreshDatabase`, `PasswordConfirmationTest`, `Password Reset Tests`, `Contact Form Tests`, `Email Verification Tests`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `Booking Logic Controller` be split into smaller, more focused modules?**
  _Cohesion score 0.07716701902748414 - nodes in this community are weakly interconnected._