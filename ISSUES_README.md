

## 🏷️ Labels to Create

First, create these labels in your GitHub repository:

- `P0-critical` (red #d73a4a) - Must complete for MVP
- `P1-high` (orange #fb8c00) - Important for full functionality  
- `P2-medium` (yellow #fef2c0) - Nice to have
- `backend` (green #0e8a16) - Backend work
- `frontend` (blue #1d76db) - Frontend work
- `fullstack` (purple #5319e7) - Both backend and frontend

---

## Week 1 Issues (7 issues, 35 hours)

### Issue #1: Database Schema Setup & Migrations
**Labels:** `P0-critical` `backend` `week-1`  
**Estimate:** 6 hours  
**Dependencies:** None

**Description:**  
Set up complete PostgreSQL database schema in Supabase with Row Level Security (RLS) policies.

**Tasks:**
- Create `users` table (id, email, name, role, team_id, qr_code, created_at)
- Create `events` table (id, title, starts_at, ends_at, location, capacity, created_at)
- Create `checkins` table (id, user_id, event_id, user_name, created_at)
- Create `teams` table (id, name, project_name, repo_link, created_at)
- Set up RLS policies (organizers: full access, hackers: limited read)
- Create helper functions (is_organizer, prevent_duplicate_checkin)
- Enable Realtime for checkins table
- Create indexes for performance optimization
- Write migration file in `/supabase/migrations/`
- Document schema in README

**Acceptance Criteria:**
- All tables created with proper constraints (starts_at < ends_at, unique on user_id+event_id)
- RLS policies tested and working
- Realtime enabled on checkins
- Migration is idempotent and reversible

---

### Issue #2: Authentication System - Backend
**Labels:** `P0-critical` `backend` `week-1`  
**Estimate:** 5 hours  
**Dependencies:** #1

**Description:**  
Implement complete authentication system with signup, login, logout, and session management using Supabase Auth.

**Tasks:**
- Create `/app/api/auth/signup/route.ts` (POST)
  - Validate email, password (≥8 chars), name, role
  - Organizer signup requires secret: "casehacks2026!"
  - Create auth user and user record with UUID qr_code
- Create `/app/api/auth/login/route.ts` (POST)
  - Validate credentials, check role="organizer"
  - Return session tokens
- Create `/app/api/auth/logout/route.ts` (POST)
- Create `/app/api/auth/session/route.ts` (GET)
- Create `middleware.ts` for route protection
  - Protect: /dashboard/*, /events/*, /participants/*
  - Allow public: /, /login
- Use HTTP-only cookies for session storage
- Implement proper error handling (401, 403)

**Acceptance Criteria:**
- Organizers can sign up with secret password
- Hackers blocked from organizer routes
- Sessions persist across page refreshes
- Middleware blocks unauthenticated access
- Logout clears session completely

---

### Issue #3: Authentication System - Frontend
**Labels:** `P0-critical` `frontend` `week-1`  
**Estimate:** 6 hours  
**Dependencies:** #2

**Description:**  
Build login and signup UI with form validation, error handling, and session management.

**Tasks:**
- Create `/app/login/page.tsx`
  - Tab interface: Login | Signup
  - Login form: email, password
  - Signup form: name, email, password, confirm password, role selector
  - Organizer role shows secret password field
  - Form validation with inline errors
- Create `/app/providers/AuthProvider.tsx`
  - Global auth state management
  - Provide useAuth() hook
  - Handle session refresh
- Update `/app/layout.tsx` with AuthProvider and Toaster
- Add logout button to dashboard
- Style with glassmorphism (bg-white/80 backdrop-blur-lg)
- Loading states and toast notifications

**Acceptance Criteria:**
- Login form validates before submission
- Signup requires matching passwords
- Organizer signup shows secret field
- Success shows toast and redirects to dashboard
- Errors show user-friendly messages
- Hard redirects after auth changes (window.location.href)

---

### Issue #4: Dashboard Sidebar & Navigation
**Labels:** `P0-critical` `frontend` `week-1`  
**Estimate:** 4 hours  
**Dependencies:** #3

**Description:**  
Create persistent sidebar navigation component for all dashboard pages.

**Tasks:**
- Install `lucide-react` for icons
- Create `/components/layout/Sidebar.tsx`
  - Logo and "CaseHacks Organizer Portal" branding
  - Navigation links with Lucide icons:
    - 📊 Check-in Monitor → /dashboard
    - 📅 Events → /events
    - 👥 Participants → /participants
  - Active route highlighting with usePathname()
  - User profile section at bottom (name, role, logout button)
- Update `/app/dashboard/layout.tsx` with sidebar
- Create `/app/events/layout.tsx` using same layout
- Mobile responsive: hamburger menu with drawer
- Style: bg-white/50 backdrop-blur-sm border-r

**Acceptance Criteria:**
- Sidebar visible on all dashboard pages
- Active link highlighted correctly
- User info shows real data from database
- Logout button works and redirects
- Mobile responsive with drawer
- Smooth hover transitions

---

### Issue #5: Events API Endpoints
**Labels:** `P0-critical` `backend` `week-1`  
**Estimate:** 4 hours  
**Dependencies:** #1

**Description:**  
Create full CRUD API for events management with validation.

**Tasks:**
- Create `/app/api/events/route.ts`
  - **GET**: Fetch all events (order by starts_at ASC)
  - **POST**: Create event with validation
    - Required: title, starts_at, ends_at
    - Validate: starts_at < ends_at
    - Return 400 for validation errors, 201 on success
- Create `/app/api/events/[id]/route.ts`
  - **PATCH**: Update event (validate changes)
  - **DELETE**: Delete event (CASCADE handles checkins)
- Add Zod validation schemas (EventCreateSchema, EventUpdateSchema)
- Use createAdminClient() to bypass RLS
- Consistent error handling with try-catch
- Return format: `{ error: string }` for errors

**Acceptance Criteria:**
- GET /api/events returns all events sorted by date
- POST creates event with proper validation
- PATCH validates only changed fields
- DELETE removes event and cascades to check-ins
- Validation errors return 400 with clear messages
- Server errors return 500

---

### Issue #6: Events Management Page
**Labels:** `P0-critical` `frontend` `week-1`  
**Estimate:** 6 hours  
**Dependencies:** #4, #5

**Description:**  
Build complete events management UI with create, read, update, delete operations.

**Tasks:**
- Install dependencies:
  - `react-datepicker @types/react-datepicker`
  - `@radix-ui/react-dialog @radix-ui/react-select`
- Create `/app/events/page.tsx`
  - Page title: "Events Management"
  - "Create Event" button (opens dialog)
  - Events table: Title | Start | End | Location | Capacity | Actions
  - Format dates: "Jan 15, 2026 at 2:00 PM"
  - Edit button (opens prefilled dialog)
  - Delete button (opens confirmation)
- Create `/components/events/EventDialog.tsx`
  - Fields: Title*, Start DateTime*, End DateTime*, Location, Capacity
  - Use react-datepicker for date/time selection
  - Client-side validation
  - Loading states, toast notifications
  - Modes: "create" or "edit"
- Create `/components/events/DeleteDialog.tsx`
- Create `/styles/datepicker.css` for custom styling
- Loading skeleton and empty state
- Auto-refresh table after operations

**Acceptance Criteria:**
- Table displays all events with correct formatting
- Create dialog validates inputs before submission
- Edit dialog prefills existing data
- Delete requires confirmation
- Success shows toast, table updates immediately
- Validation errors show inline

---

### Issue #7: Check-in API Endpoints
**Labels:** `P0-critical` `backend` `week-1`  
**Estimate:** 4 hours  
**Dependencies:** #1, #5

**Description:**  
Create API endpoints for check-in operations, user lookups, and duplicate prevention.

**Tasks:**
- Create `/app/api/admin/checkin/route.ts` (POST)
  - Accept: `{ userId: string, eventId: string }`
  - Validate UUID formats
  - Check user and event exist
  - Check for duplicate (unique constraint on user_id + event_id)
  - Fetch user.name for denormalization
  - Insert check-in with user_name
  - Return 201 on success, 409 for duplicates, 404 if not found
- Create `/app/api/admin/checkins/route.ts` (GET)
  - Optional query param: `?eventId={id}`
  - Fetch with joins (users, events)
  - Order by created_at DESC, limit 100
  - Return: `{ id, user_name, event_title, created_at }[]`
- Create `/app/api/admin/user/route.ts` (GET)
  - Accept: `?qrCode={code}` or `?id={uuid}`
  - Fetch user by qr_code or id
  - Return 404 if not found
- Use admin client for all operations
- Optional: Rate limiting (max 10 check-ins per second per IP)

**Acceptance Criteria:**
- POST validates all inputs
- Duplicate check-ins return 409 error
- GET returns formatted data with joins
- Event filter works correctly
- User lookup by QR code works
- All endpoints use service role key

---

## Week 2 Issues (9 issues, 34 hours)

### Issue #8: QR Scanner Component
**Labels:** `P1-high` `frontend` `week-2`  
**Estimate:** 6 hours  
**Dependencies:** #7

**Description:**  
Build QR code scanner component with camera access, validation, and dev mode.

**Tasks:**
- Install `html5-qrcode` library
- Create `/components/qr-scanner/QrScanner.tsx`
  - Props: onScan(userId), onError(error), eventId
  - Use html5-qrcode for camera scanning
  - Prefer rear camera on mobile
  - 300x300px camera feed container
  - Parse QR data: JSON `{"user_id": "uuid"}` or plain UUID
  - Validate UUID format
- Add dev mode toggle with manual UUID input
  - Text input + Submit button
  - For testing without camera
- Lifecycle management with useCallback and useRef
  - Start camera when dialog opens
  - Stop camera on unmount
  - Prevent restart loops
- Visual feedback: scanning animation, success/error flashes
- Error handling: permissions, invalid QR, user not found, duplicates

**Acceptance Criteria:**
- Camera starts automatically when opened
- Successfully parses UUID from QR codes
- Dev mode allows manual UUID entry
- Scanner stops when dialog closes
- Permission errors show clear messages
- No camera restart loops
- Works on iOS Safari and Android Chrome

---

### Issue #9: Check-in Monitor - Frontend
**Labels:** `P0-critical` `frontend` `week-2`  
**Estimate:** 5 hours  
**Dependencies:** #4, #7, #8

**Description:**  
Complete the check-in monitor dashboard with event selection, QR scanning, and real-time updates.

**Tasks:**
- Update `/app/dashboard/page.tsx` with "use client"
- Event selector dropdown
  - Fetch events from /api/events
  - Required before scanning
- "Scan QR Code" button (disabled if no event selected)
  - Opens Dialog with QR Scanner
- Check-ins table
  - Columns: Name | Event | Time
  - Fetch from /api/admin/checkins
  - Format: "2 minutes ago" or "Jan 15 at 2:00 PM"
  - Show latest 20 check-ins
  - Auto-scroll to top on new check-in
- Handle scan result
  - Call POST /api/admin/checkin
  - On success: close dialog, toast, update table
  - On error: show toast, keep dialog open
- Update stats cards with real data
  - Total check-ins, Events today, Total participants
- Loading skeletons and empty states

**Acceptance Criteria:**
- Must select event before scanning
- QR scanner opens in modal
- Successful scan adds check-in immediately
- Duplicate check-ins show error toast
- Stats cards show real data
- Table updates without page refresh

---

### Issue #10: Real-time Check-in Subscriptions
**Labels:** `P1-high` `fullstack` `week-2`  
**Estimate:** 4 hours  
**Dependencies:** #1, #9

**Description:**  
Implement real-time updates for check-ins using Supabase Realtime so all organizers see updates instantly.

**Tasks:**
- Create `/lib/realtime.ts` helper
  - Function: subscribeToCheckins(callback)
  - Set up Supabase Realtime channel
  - Listen for INSERT events on checkins table
  - Handle reconnection with exponential backoff
  - Return unsubscribe function
- Create `/hooks/useRealtimeCheckins.ts`
  - Hook: useRealtimeCheckins(eventId?)
  - Subscribe to checkins channel
  - Filter by eventId if provided
  - Prepend new check-ins to state
  - Cleanup on unmount
- Update `/app/dashboard/page.tsx`
  - Use useRealtimeCheckins hook
  - Merge real-time updates with initial data
  - Prevent duplicates (check by id)
  - Show toast notification on new check-in
- Add connection status indicator (green/red dot)
- Fallback polling if Realtime fails (every 5 seconds)

**Acceptance Criteria:**
- Check-ins appear instantly without refresh
- Multiple organizers see same updates
- Connection issues handled gracefully
- No duplicate check-ins in list
- Fallback polling works if Realtime unavailable
- Subscriptions cleaned up properly

---

### Issue #11: Generate Test Users & QR Codes
**Labels:** `P1-high` `backend` `week-2`  
**Estimate:** 3 hours  
**Dependencies:** #1

**Description:**  
Create tools to generate test users with QR codes for development and testing.

**Tasks:**
- Install `qrcode` package: `npm install qrcode @types/qrcode`
- Create `/app/api/admin/generate-test-users/route.ts` (POST)
  - Accept: `{ count: number }` (default 10)
  - Generate users:
    - name: "Test User 1", "Test User 2", etc.
    - email: "test1@casehacks.com", etc.
    - role: "hacker"
    - qr_code: unique UUID
  - Insert into users table
  - Return array of created users
- Create `/scripts/generate-qr-codes.ts`
  - Read users from database
  - Generate QR code PNG for each (encode user.id)
  - Save to `/public/qr-codes/`
  - Filename: `{name-slug}.png`
  - Create printable HTML with all QR codes (name under each)
- Optional: Create `/app/admin/qr-codes/page.tsx` for viewing/printing
- Document seeding process in README

**Acceptance Criteria:**
- API creates users with valid UUID qr_codes
- Script generates scannable QR code images
- QR codes encode user_id correctly
- Printable page is well-formatted
- Test users can be checked in successfully

---

### Issue #12: UI Polish & Responsive Design
**Labels:** `P1-high` `frontend` `week-2`  
**Estimate:** 4 hours  
**Dependencies:** All frontend issues

**Description:**  
Polish UI with loading states, empty states, animations, and ensure mobile responsiveness.

**Tasks:**
- Create reusable components in `/components/ui/`
  - LoadingSkeleton (shimmer effect)
  - EmptyState (icon + message + CTA)
  - StatCard (stat display)
  - DataTable (reusable table)
- Add loading skeletons to all tables and cards
- Add helpful empty states
  - "No events yet. Create your first event!"
  - "No check-ins yet. Start scanning QR codes!"
- Apply glassmorphism consistently
  - Cards: bg-white/50 backdrop-blur-sm
  - Dialogs: bg-white/80 backdrop-blur-lg
  - Sidebar: bg-white/40 backdrop-blur-md
  - All with rounded-xl
- Smooth animations (transitions, dialog open/close)
- Mobile responsive testing (375px iPhone SE, 768px iPad)
  - Touch-friendly buttons (44px min)
  - Readable text sizes
- Keyboard navigation (tab order, ESC closes dialogs, ENTER submits)
- Accessibility (WCAG AA): contrast ≥4.5:1, alt text, ARIA labels

**Acceptance Criteria:**
- Loading states show before data loads
- Empty states are helpful and actionable
- Glassmorphism applied consistently
- Animations smooth (60fps)
- Mobile layout works on iPhone and Android
- Keyboard navigation works throughout
- Passes WAVE accessibility check

---

## Summary

### By Priority
- **P0 (Critical):** 8 issues - Must complete for MVP
  - #1, #2, #3, #4, #5, #6, #7, #9, #15
- **P1 (High):** 7 issues - Important for quality
  - #8, #10, #11, #12, #13, #14
- **P2 (Medium):** 1 issue - Polish
  - #16

### By Type
- **Backend:** 6 issues (#1, #2, #5, #7, #11, part of #13)
- **Frontend:** 7 issues (#3, #4, #6, #8, #9, #12, part of #13)
- **Fullstack:** 3 issues (#10, #13, #14, #15, #16)

### By Week
- **Week 1:** Issues #1-7 (35 hours) - Foundation
- **Week 2:** Issues #8-16 (34 hours) - Features & Deployment

### Critical Path
The following must be completed in order:
1. Database (#1) → Auth Backend (#2) → Auth Frontend (#3) → Sidebar (#4)
2. Events API (#5) → Events Page (#6)
3. Check-in API (#7) → QR Scanner (#8) → Check-in Monitor (#9)
4. Testing (#14) → Deployment (#15) → Documentation (#16)

### Parallel Work
- Backend can work on #5, #7 while frontend works on #4
- Backend can work on #10, #11 while frontend works on #8, #9, #12
- #13 can be done continuously throughout

---

## Next Steps

1. **Set up GitHub repository** (if not done)
2. **Create labels** in GitHub
3. **Create all 16 issues** in GitHub (copy titles and content above)
4. **Start with Issue #1** - Database Schema
5. **Follow the dependency chain** for smooth progress

---

## Notes

- This is the MVP scope - does NOT include announcements, applications review, teams management, or advanced admin tools
- Estimated times are for experienced developers; add 25-50% buffer for unknowns
- Real-time (#10) has fallback polling, so it's not blocking if it fails
- QR scanner (#8) has dev mode, so camera issues won't block testing
- All times assume pair programming or code review is included

**Ready to build? Create these issues and start coding!** 🚀
