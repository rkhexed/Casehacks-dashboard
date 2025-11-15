# CaseHacks Dashboard - Updated GitHub Issues

## ✅ Already Complete
- Supabase client configuration (`lib/supabase.ts`)
- Custom theme and styling (`app/globals.css`)
- Homepage with branding
- Dashboard page skeleton
- Environment variables template (`.env.example`)
- Utility functions (`lib/utils.ts`)

---

## 🏷️ Create Labels First
- `P0` (red) - Critical
- `P1` (orange) - High Priority
- `P2` (yellow) - Medium Priority
- `backend` (blue)
- `frontend` (green)
- `both` (gray)
- `week-1` `week-2` (light blue)

---

## Issue #1: Dashboard Sidebar & Navigation

**Labels:** `P0` `frontend` `week-1` | **Estimate:** 4h

### Tasks
- [ ] Create sidebar component in `/components/sidebar.tsx`
- [ ] Add to `/app/dashboard/layout.tsx`
- [ ] Navigation links:
  - Check-in Monitor → `/dashboard`
  - Events → `/events`
- [ ] Active route highlighting with `usePathname`
- [ ] Style with glass morphism: `bg-white/80 backdrop-blur-lg`
- [ ] Mobile responsive (hamburger menu)
- [ ] User info section (name, role from Supabase)

**Depends on:** None

---

## Issue #2: Events CRUD APIs

**Labels:** `P0` `backend` `week-1` | **Estimate:** 4h

### Tasks
- [ ] Create `/app/api/events/route.ts`
  - GET: Fetch all events, order by `starts_at ASC`
  - POST: Create new event with validation
- [ ] Create `/app/api/events/[id]/route.ts`
  - PATCH: Update event
  - DELETE: Delete event
- [ ] Validate: `starts_at < ends_at`, required fields
- [ ] Use admin client to bypass RLS
- [ ] Return consistent JSON responses

**Depends on:** None

---

## Issue #3: Events Management Page

**Labels:** `P0` `frontend` `week-1` | **Estimate:** 6h

### Tasks
- [ ] Create `/app/events/page.tsx` and layout
- [ ] Events table (Title, Start, End, Location, Capacity, Actions)
- [ ] Install `react-datepicker @types/react-datepicker`
- [ ] Create/edit form dialog with date pickers
- [ ] Delete confirmation dialog
- [ ] Create `/styles/datepicker.css` for styling
- [ ] Form validation
- [ ] Toast notifications with Sonner
- [ ] Table updates after CRUD operations

**Depends on:** #1 (sidebar layout), #2 (events APIs)

---

## Issue #4: Check-in API Endpoints

**Labels:** `P0` `backend` `week-1` | **Estimate:** 4h

### Tasks
- [ ] Create `/app/api/admin/checkin/route.ts` (POST)
  - Accept `userId` and `eventId`
  - Validate user and event exist
  - Check for duplicate check-ins
  - Create check-in record with `user_name`
  - Use admin client to bypass RLS
- [ ] Create `/app/api/admin/checkins/route.ts` (GET)
  - Fetch all with joins (users, events)
  - Order by `created_at DESC`
  - Limit 100
- [ ] Create `/app/api/admin/user/route.ts` (GET)
  - Accept query: `?qrCode={code}` or `?id={userId}`
  - Return user details
  - 404 if not found

**Depends on:** #2 (events API for event validation)

---

## Issue #5: QR Scanner Component

**Labels:** `P1` `frontend` `week-2` | **Estimate:** 6h

### Tasks
- [ ] Install `html5-qrcode`
- [ ] Create `/components/qr-scanner/QrScanner.tsx`
- [ ] Camera scanning (prefer rear camera on mobile)
- [ ] Dev mode with manual UUID input
- [ ] Parse QR, call check-in API
- [ ] Handle errors:
  - Camera permissions
  - Invalid QR code
  - User not found
  - Duplicate check-ins
- [ ] Cleanup on unmount (stop camera)
- [ ] Visual feedback (scanning animation)

**Depends on:** #4 (check-in APIs)

---

## Issue #6: Complete Check-in Monitor

**Labels:** `P0` `frontend` `week-2` | **Estimate:** 5h

### Tasks
- [ ] Update `/app/dashboard/page.tsx`
- [ ] Event selection dropdown (fetch from events API)
- [ ] Integrate QR Scanner component
- [ ] "Scan QR Code" button (disabled if no event selected)
- [ ] Check-ins table:
  - Columns: Name, Event, Timestamp
  - Fetch from `/api/admin/checkins`
  - Format timestamps
- [ ] Real-time updates with Supabase Realtime
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Update stats cards with real data

**Depends on:** #1 (sidebar), #4 (check-in APIs), #5 (QR scanner)

---

## Issue #7: Real-time Subscriptions

**Labels:** `P1` `backend` `week-2` | **Estimate:** 3h

### Tasks
- [ ] Create `/lib/realtime.ts` helper
- [ ] Set up Realtime channel for `checkins` table
- [ ] Create `useCheckinSubscription(eventId)` hook
- [ ] Subscribe to INSERT events
- [ ] Handle reconnection with exponential backoff
- [ ] Fallback polling (every 5s if Realtime fails)
- [ ] Cleanup subscriptions on unmount

**Depends on:** #6 (check-in monitor)

---

## Issue #8: Create Test Users & QR Codes

**Labels:** `P1` `backend` `week-2` | **Estimate:** 2h

### Tasks
- [ ] Create API endpoint `/api/admin/generate-users` (POST)
- [ ] Generate test users with UUID QR codes
- [ ] Insert into Supabase `users` table
- [ ] Create printable QR codes (use `qrcode` npm package)
- [ ] Generate PDF with multiple QR codes for testing
- [ ] Add names/emails to test users

**Depends on:** None

---

## Issue #9: Participants List Page

**Labels:** `P1` `frontend` `week-2` | **Estimate:** 3h

### Tasks
- [ ] Create `/app/participants/page.tsx`
- [ ] Fetch all users from Supabase
- [ ] Display table: Name, Email, Team, QR Code
- [ ] Search/filter functionality
- [ ] Export to CSV option
- [ ] Add to sidebar navigation

**Depends on:** #1 (sidebar)

---

## Issue #10: Stats & Analytics

**Labels:** `P2` `frontend` `week-2` | **Estimate:** 3h

### Tasks
- [ ] Create API `/app/api/admin/stats/route.ts`
  - Total check-ins
  - Check-ins by event
  - Total participants
  - Check-in rate per hour
- [ ] Update dashboard stats cards with real data
- [ ] Add charts (optional, use recharts or similar)
- [ ] Event capacity tracking

**Depends on:** #6 (check-in monitor)

---

## Issue #11: UI Polish & Responsive Design

**Labels:** `P1` `frontend` `week-2` | **Estimate:** 4h

### Tasks
- [ ] Add loading skeletons for all tables
- [ ] Create empty states with helpful text
- [ ] Mobile responsive (test at 375px)
- [ ] Glass morphism effects on cards/dialogs
- [ ] Smooth transitions and animations
- [ ] Keyboard navigation (tab order, escape closes dialogs)
- [ ] WCAG AA contrast verification
- [ ] Test on iOS Safari and Android Chrome

**Depends on:** All frontend issues

---

## Issue #12: Error Handling & Validation

**Labels:** `P1` `both` `week-2` | **Estimate:** 3h

### Backend:
- [ ] Try-catch all API routes
- [ ] Consistent error response format
- [ ] Handle Supabase errors gracefully
- [ ] Request validation with Zod
- [ ] Rate limiting

### Frontend:
- [ ] Handle network errors
- [ ] User-friendly error messages
- [ ] Retry logic for failed requests
- [ ] Prevent form double-submission

### Edge Cases:
- [ ] Duplicate check-ins
- [ ] Invalid QR codes
- [ ] Scanning without event selection
- [ ] Invalid event dates
- [ ] Network timeouts

**Depends on:** All issues

---

## Issue #13: Environment Setup Instructions

**Labels:** `P2` `both` `week-2` | **Estimate:** 1h

### Tasks
- [ ] Create `/app/api/setup/route.ts` endpoint
- [ ] Check if environment variables are set
- [ ] Verify Supabase connection
- [ ] Test RLS policies
- [ ] Return setup status JSON
- [ ] Add setup page if not configured

**Depends on:** None

---

## Issue #14: End-to-End Testing

**Labels:** `P1` `both` `week-2` | **Estimate:** 4h

### Test Scenarios:
- [ ] Create event flow
- [ ] Edit/delete event
- [ ] Scan QR code (use dev mode UUID input)
- [ ] Verify check-in appears in real-time
- [ ] Try duplicate check-in (should fail)
- [ ] Test with invalid QR code
- [ ] Check-in without selecting event (should prevent)
- [ ] Test on real mobile devices
- [ ] Performance testing (30 min runtime)
- [ ] Test with 50+ check-ins

**Depends on:** All issues

---

## Issue #15: Production Deployment

**Labels:** `P0` `both` `week-2` | **Estimate:** 3h

### Tasks
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Set environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Run production build locally: `npm run build && npm run start`
- [ ] Fix any build errors
- [ ] Deploy: `vercel --prod`
- [ ] Test production deployment
- [ ] Optional: custom domain
- [ ] Optional: Vercel Analytics

**Depends on:** #14 (testing)

---

## Issue #16: Documentation & README

**Labels:** `P2` `both` `week-2` | **Estimate:** 2h

### Tasks
- [ ] Update `README.md`:
  - Project description
  - Features list
  - Setup instructions
  - Environment variables
  - Development commands
  - Deployment steps
- [ ] Create user guide in `/docs/USER_GUIDE.md`:
  - How to create events
  - How to check in participants
  - How to generate QR codes
  - Troubleshooting
- [ ] Document API endpoints (optional)
- [ ] Add screenshots

**Depends on:** #15 (deployment)

---

## 📊 Summary

**Total Issues:** 16  
**Estimated Hours:** 54 hours  
**Timeline:** 2 weeks with 2 developers

### Backend Tasks (24h):
- #2 - Events APIs (4h)
- #4 - Check-in APIs (4h)
- #7 - Real-time (3h)
- #8 - Test Users & QR Codes (2h)
- #10 - Stats API (1.5h)
- #12 - Error Handling (1.5h)
- #13 - Setup endpoint (1h)
- #14 - Testing (2h)
- #15 - Deployment (1.5h)
- #16 - Documentation (1h)

### Frontend Tasks (30h):
- #1 - Sidebar (4h)
- #3 - Events Page (6h)
- #5 - QR Scanner (6h)
- #6 - Check-in Monitor (5h)
- #9 - Participants Page (3h)
- #10 - Stats Display (1.5h)
- #11 - UI Polish (4h)
- #12 - Error Handling (1.5h)
- #14 - Testing (2h)
- #15 - Deployment (1.5h)
- #16 - Documentation (1h)

### Critical Path:
Week 1: #1 → #2 → #3 → #4  
Week 2: #5 → #6 → #7 → #11 → #12 → #14 → #15 → #16

### Parallel Work:
- Backend can work on #2, #4 while frontend works on #1
- Backend can work on #7, #8, #10 while frontend works on #5, #6
- #9 can be done anytime after #1
- #13 is optional but nice to have

---

## 🎯 Implementation Notes

### No Authentication System
- No login/signup pages
- No session management
- No route protection
- Dashboard is publicly accessible
- Focus is on check-in and event management features

### Required Setup
1. Copy `.env.example` to `.env.local`
2. Add Supabase credentials from project: `sloblfvvplbhbgumvpyy`
3. Run `npm install`
4. Run `npm run dev`

### Database Schema (Already in Supabase)
- ✅ `users` table
- ✅ `events` table
- ✅ `checkins` table
- ✅ `teams` table
- ✅ RLS policies enabled

### Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL + Realtime)
- React 19
- Sonner (toasts)
- html5-qrcode (scanner)
- react-datepicker (date picker)
