# Bond — Project Folder Structure

> Last updated: April 2026
> Stack: React (Vite) + Node.js (Express) + PostgreSQL (Supabase)

---

## Root

```
Problem Stement 4.4/
├── client/                  # React frontend (Vite)
├── database/                # SQL schema, migrations, seeders & views
├── server/                  # Node.js / Express backend
└── Folder Structure.md
```

---

## client/

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── Explore.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── booking/
│   │   │   │   ├── BookingCard.jsx
│   │   │   │   ├── BookingForm.jsx
│   │   │   │   ├── BookingHistory.jsx
│   │   │   │   ├── BookingStatus.jsx
│   │   │   │   └── PaymentForm.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatBox.jsx
│   │   │   │   └── MessageList.jsx
│   │   │   ├── community/
│   │   │   │   ├── CommunityCard.jsx
│   │   │   │   ├── CommunityForm.jsx
│   │   │   │   ├── CommunityProfile.jsx
│   │   │   │   └── SustainabilityTags.jsx
│   │   │   ├── experience/
│   │   │   │   ├── ExperienceCard.jsx
│   │   │   │   ├── ExperienceDetails.jsx
│   │   │   │   ├── ExperienceForm.jsx
│   │   │   │   └── ExperienceList.jsx
│   │   │   ├── map/
│   │   │   │   ├── CommunityMarker.jsx
│   │   │   │   ├── LocationPicker.jsx
│   │   │   │   └── MapView.jsx
│   │   │   ├── notification/
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   └── NotificationList.jsx
│   │   │   ├── report/
│   │   │   │   ├── ReportForm.jsx
│   │   │   │   └── ReportList.jsx
│   │   │   ├── review/
│   │   │   │   ├── RatingStars.jsx
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   └── ReviewForm.jsx
│   │   │   └── story/
│   │   │       ├── StoryCard.jsx
│   │   │       ├── StoryEditor.jsx
│   │   │       └── StoryFeed.jsx
│   │   ├── layouts/
│   │   │   ├── navbars/
│   │   │   │   ├── AdminNav.jsx
│   │   │   │   ├── CommunityNav.jsx
│   │   │   │   ├── PublicNav.jsx
│   │   │   │   ├── SecurityNav.jsx
│   │   │   │   └── TouristNav.jsx
│   │   │   ├── sidebars/
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   ├── CommunitySidebar.jsx
│   │   │   │   └── SecuritySidebar.jsx
│   │   │   ├── AdminLayout.jsx         # Mobile-responsive (overlay + GSAP)
│   │   │   ├── CommunityLayout.jsx     # Mobile-responsive (overlay + GSAP)
│   │   │   ├── PublicLayout.jsx        # Public-facing footer & nav
│   │   │   ├── SecurityLayout.jsx      # Mobile-responsive (overlay + GSAP)
│   │   │   └── TouristLayout.jsx
│   │   ├── sections/
│   │   │   ├── CommunitiesSection.jsx
│   │   │   ├── CTASection.jsx
│   │   │   └── HeroSection.jsx
│   │   └── ui/
│   │       ├── Avatar.jsx
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Dropdown.jsx
│   │       ├── index.js
│   │       ├── Input.jsx
│   │       ├── Loader.jsx
│   │       ├── Modal.jsx
│   │       ├── Pagination.jsx
│   │       ├── Textarea.jsx
│   │       ├── Toast.jsx
│   │       └── Tooltip.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   ├── useFetch.js
│   │   ├── useLocalStorage.js
│   │   ├── useMap.js
│   │   ├── useNotification.js
│   │   └── useUploadImage.js
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── ActivityLogs.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProfile.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── ManageSecurities.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   └── Reports.jsx
│   │   ├── auth/
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── community/
│   │   │   ├── CommunityDashboard.jsx
│   │   │   ├── CommunityProfileSetup.jsx
│   │   │   ├── Earnings.jsx
│   │   │   ├── ManageBookings.jsx
│   │   │   ├── ManageExperiences.jsx
│   │   │   └── ManageStories.jsx
│   │   ├── public/
│   │   │   ├── About.jsx
│   │   │   ├── Home.jsx
│   │   │   └── NotFound.jsx
│   │   ├── security/
│   │   │   ├── HandleComplaints.jsx        # Report triage (/assign, /resolve, /dismiss)
│   │   │   ├── MonitorExperiences.jsx      # Experience monitoring with flag/approve/suspend
│   │   │   ├── MonitorUsers.jsx            # User monitoring with flag/suspend/reinstate
│   │   │   ├── OfficerProfile.jsx
│   │   │   ├── ReviewComunityDetails.jsx   # Community detail review (GSAP hero)
│   │   │   ├── SecurityDashboard.jsx
│   │   │   ├── SuspendedUsers.jsx
│   │   │   └── VerifyCommunities.jsx
│   │   ├── tourist/
│   │   │   ├── Favorites.jsx
│   │   │   ├── Interests.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── TouristDashboard.jsx
│   │   │   └── TouristProfile.jsx
│   │   └── PageShell.jsx
│   │
│   ├── routes/
│   │   ├── AdminRoutes.jsx
│   │   ├── AppRoutes.jsx
│   │   ├── CommunityRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleBasedRoute.jsx
│   │   ├── SecurityRoutes.jsx
│   │   └── TouristRoutes.jsx
│   │
│   ├── services/                          # Axios API client wrappers
│   │   ├── api.js                         # Base Axios instance (auth headers)
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   ├── communityService.js
│   │   ├── experienceService.js
│   │   ├── mapService.js
│   │   ├── notificationService.js
│   │   ├── reportService.js
│   │   ├── reviewService.js
│   │   ├── securityService.js             # Security module: communities, users, experiences
│   │   ├── storyService.js
│   │   ├── uploadService.js
│   │   └── userService.js
│   │
│   ├── store/                             # Zustand global state
│   │   ├── authStore.js
│   │   ├── bookingStore.js
│   │   ├── mapStore.js
│   │   └── notificationStore.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── dateUtils.js
│   │   ├── formatters.js
│   │   ├── tokenUtils.js
│   │   └── validators.js
│   │
│   ├── App.jsx
│   ├── index.css                          # Design tokens & global styles
│   └── main.jsx
│
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── .env
```

---

## server/

```
server/
├── src/
│   ├── config/
│   │   ├── cloudinary.js          # Cloudinary upload configuration
│   │   ├── corsOptions.js         # CORS whitelist
│   │   ├── db.js                  # PostgreSQL pool (Supabase)
│   │   └── env.js                 # Env variable validation
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── communityController.js
│   │   ├── experienceController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   ├── reviewController.js
│   │   ├── securityController.js  # Security module: community verify, user & experience monitoring
│   │   ├── storyController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT token verification
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── notFound.js            # 404 fallback
│   │   ├── rateLimiter.js
│   │   ├── roleMiddleware.js      # Role-based access control
│   │   ├── uploadMiddleware.js    # Multer memory storage
│   │   └── validateRequest.js    # Joi/Zod schema validation
│   │
│   ├── models/
│   │   ├── bookingModel.js
│   │   ├── communityModel.js
│   │   ├── experienceModel.js
│   │   ├── notificationModel.js
│   │   ├── reportModel.js
│   │   ├── reviewModel.js
│   │   ├── storyModel.js
│   │   └── userModel.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── experienceRoutes.js
│   │   ├── index.js               # Route aggregator
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js        # /assign, /resolve, /dismiss
│   │   ├── reviewRoutes.js
│   │   ├── securityRoutes.js      # All /security/* routes (auth: security|admin)
│   │   ├── storyRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── services/
│   │   ├── analyticsService.js
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   ├── recommendationService.js
│   │   └── uploadService.js
│   │
│   ├── utils/
│   │   ├── apiError.js            # Custom ApiError class
│   │   ├── apiResponse.js         # Standardized API response wrapper
│   │   ├── asyncHandler.js        # Async try/catch wrapper
│   │   ├── constants.js
│   │   ├── generateToken.js
│   │   ├── hashPassword.js
│   │   └── logger.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── bookingValidator.js
│   │   ├── communityValidator.js
│   │   ├── experienceValidator.js
│   │   ├── notificationValidator.js
│   │   └── reviewValidator.js
│   │
│   ├── logs/
│   │   ├── activity.log
│   │   └── error.log
│   │
│   ├── app.js                     # Express app setup & middleware
│   └── server.js                  # HTTP server entry point
│
├── tests/
│   ├── auth.test.js
│   ├── booking.test.js
│   └── community.test.js
│
├── test_users.js
├── package.json
└── .env
```

---

## database/

```
database/
├── schema/                        # Table definitions (run in order)
│   ├── 01_users.sql               # user_status ENUM: active|suspended|banned|pending|flagged
│   ├── 02_communities.sql
│   ├── 03_experiences.sql         # experience_status ENUM: draft|active|paused|archived
│   ├── 04_bookings.sql
│   ├── 05_reviews.sql
│   ├── 06_stories.sql
│   ├── 07_reports.sql
│   ├── 08_favorites.sql
│   ├── 09_messages.sql
│   ├── 10_logs.sql
│   └── 11_notifications.sql
│
├── migrations/                    # Incremental schema changes
│   ├── 001_initial_setup.sql
│   ├── 002_add_sustainability_tags.sql
│   ├── 003_add_indexes.sql
│   ├── 004_add_notifications.sql
│   └── 005_add_flagged_status.sql  # ALTER TYPE user_status ADD VALUE 'flagged'
│
├── seeders/                       # Sample data
│   ├── seed_bookings.sql
│   ├── seed_communities.sql
│   ├── seed_experiences.sql
│   ├── seed_reviews.sql
│   ├── seed_stories.sql
│   └── seed_users.sql
│
├── functions/                     # PostgreSQL functions & triggers
│   ├── booking_status_trigger.sql
│   ├── rating_average.sql
│   └── update_timestamp.sql
│
├── views/                         # Computed views
│   ├── booking_summary.sql
│   ├── popular_experiences.sql
│   └── top_communities.sql
│
├── queries/                       # Utility queries (analytics, reports)
│   ├── analytics.sql
│   ├── recommendations.sql
│   └── reports.sql
│
├── full_setup.sql                 # One-shot setup (schema + seeds)
├── reset.sql                      # Drop all types & tables
└── README.md
```

---

## Key API Route Groups

| Prefix | Router file | Auth required |
|---|---|---|
| `/api/auth` | authRoutes.js | No |
| `/api/users` | userRoutes.js | Yes |
| `/api/communities` | communityRoutes.js | Partial |
| `/api/experiences` | experienceRoutes.js | Partial |
| `/api/bookings` | bookingRoutes.js | Yes |
| `/api/reviews` | reviewRoutes.js | Yes |
| `/api/reports` | reportRoutes.js | Yes |
| `/api/stories` | storyRoutes.js | Partial |
| `/api/notifications` | notificationRoutes.js | Yes |
| `/api/upload` | uploadRoutes.js | Yes |
| `/api/admin` | adminRoutes.js | admin |
| `/api/security` | securityRoutes.js | security \| admin |

### Security Routes (`/api/security/*`)

| Method | Path | Handler |
|---|---|---|
| GET | `/stats` | getSecurityStats |
| GET | `/communities/pending` | getPendingCommunities |
| GET | `/communities/:id` | getCommunityById |
| PATCH | `/communities/:id/verify` | verifyCommunity |
| PATCH | `/communities/:id/reject` | rejectCommunity |
| GET | `/users` | getAllUsers |
| GET | `/users/suspended` | getSuspendedUsers |
| PATCH | `/users/:id/flag` | flagUser |
| PATCH | `/users/:id/suspend` | suspendUser |
| PATCH | `/users/:id/unsuspend` | unsuspendUser |
| GET | `/experiences` | getAllExperiences |
| PATCH | `/experiences/:id/flag` | flagExperience |
| PATCH | `/experiences/:id/approve` | approveExperience |
| PATCH | `/experiences/:id/suspend` | suspendExperience |

---

## Role Architecture

```
user.role
  ├── tourist       → TouristLayout  (TouristRoutes)
  ├── community     → CommunityLayout (CommunityRoutes)
  ├── security      → SecurityLayout  (SecurityRoutes)
  └── admin         → AdminLayout     (AdminRoutes)
```

## Status Enums

| Entity | DB values | Frontend labels |
|---|---|---|
| User | active, suspended, banned, pending, flagged | active, suspended, inactive, flagged |
| Community | pending, verified, rejected | Pending, Verified, Rejected |
| Experience | draft, active, paused, archived | under_review, live, suspended, suspended |
| Report | open, assigned, resolved, dismissed | — |
