# Portyo Security & Permissions Guide

## Overview

This document provides a comprehensive guide to the security architecture implemented in Portyo, covering authentication, authorization, plan-based access control, and resource ownership verification.

## Table of Contents

1. [Backend Security](#backend-security)
2. [Frontend Security](#frontend-security)
3. [API Error Handling](#api-error-handling)
4. [Testing Guide](#testing-guide)
5. [Common Patterns](#common-patterns)

---

## Backend Security

### Middleware System

#### 1. Authentication (`requireAuth`)

**Location:** `backend/src/middlewares/auth.middleware.ts`

**Purpose:** Verify that the user is authenticated.

**Usage:**
```typescript
import { requireAuth } from '../middlewares';

router.get('/protected-route', requireAuth, async (req, res) => {
    // req.user is now available
    console.log(req.user.id, req.user.email, req.user.plan);
});
```

**Throws:**
- `401 Unauthorized` if user is not authenticated

---

#### 2. PRO Plan Verification (`isUserPro`)

**Location:** `backend/src/middlewares/user-pro.middleware.ts`

**Purpose:** Verify that the user has a PRO subscription.

**Usage:**
```typescript
import { requireAuth, isUserPro } from '../middlewares';

router.post('/pro-feature', requireAuth, isUserPro, async (req, res) => {
    // Only PRO users reach here
});
```

**Throws:**
- `401 Unauthorized` if user is not authenticated
- `402 Payment Required` if user plan is not PRO

---

#### 3. Paid Plan Verification (`requirePaidPlan`)

**Location:** `backend/src/middlewares/user-pro.middleware.ts`

**Purpose:** Verify that the user has any paid plan (Standard or PRO).

**Usage:**
```typescript
import { requireAuth, requirePaidPlan } from '../middlewares';

router.post('/paid-feature', requireAuth, requirePaidPlan, async (req, res) => {
    // Standard and PRO users reach here
});
```

**Throws:**
- `401 Unauthorized` if user is not authenticated
- `402 Payment Required` if user plan is free

---

#### 4. Resource Ownership (`requireBioOwner`, `requirePostOwner`, `requireAutomationOwner`)

**Location:** `backend/src/middlewares/resource-owner.middleware.ts`, `backend/src/middlewares/automation-owner.middleware.ts`

**Purpose:** Verify that the user owns the specified resource.

**Usage:**
```typescript
import { requireAuth, requireBioOwner } from '../middlewares';

// Verify bio ownership
router.put('/bio/:id', requireAuth, requireBioOwner, async (req, res) => {
    // User owns this bio
});

// Verify automation ownership
import { requireAutomationOwner } from '../middlewares';
router.delete('/automation/:automationId', requireAuth, isUserPro, requireAutomationOwner, async (req, res) => {
    // User owns this automation
});
```

**Throws:**
- `401 Unauthorized` if user is not authenticated
- `404 Not Found` if resource doesn't exist
- `403 Forbidden` if user doesn't own the resource

---

### Protected Routes Reference

#### Automation Routes (PRO Required)

```typescript
POST   /api/automation/:id                    // Create - Auth + PRO + Bio Owner
GET    /api/automation/bio/:id                // List - Auth + PRO + Bio Owner
GET    /api/automation/:automationId          // Get - Auth + PRO + Automation Owner
PUT    /api/automation/:automationId          // Update - Auth + PRO + Automation Owner
DELETE /api/automation/:automationId          // Delete - Auth + PRO + Automation Owner
POST   /api/automation/:automationId/activate // Activate - Auth + PRO + Automation Owner
POST   /api/automation/:automationId/deactivate // Deactivate - Auth + PRO + Automation Owner
GET    /api/automation/:automationId/executions // Get executions - Auth + PRO + Automation Owner
```

#### Booking Routes (PRO Required)

```typescript
GET    /api/bookings/settings/:bioId  // Get settings - Auth + PRO
PUT    /api/bookings/settings/:bioId  // Update settings - Auth + PRO
GET    /api/bookings/:bioId            // Get bookings - Auth + PRO
```

#### Template Routes (PRO Required)

```typescript
POST   /api/templates/:bioId       // Create - Auth + PRO
GET    /api/templates/:bioId       // List - Auth + PRO
GET    /api/templates/:bioId/:id   // Get - Auth + PRO
PUT    /api/templates/:bioId/:id   // Update - Auth + PRO
DELETE /api/templates/:bioId/:id   // Delete - Auth + PRO
```

#### QR Code Routes (Auth Required)

```typescript
POST /api/qrcode/:id/  // Create - Auth + Bio Owner
GET  /api/qrcode/:id/  // List - Auth + Bio Owner
```

---

## Frontend Security

### AuthorizationGuard Component

**Location:** `frontend/app/contexts/guard.context.tsx`

**Purpose:** Protect routes and components based on authentication and plan requirements.

**Props:**
- `minPlan?: 'free' | 'standard' | 'pro'` - Minimum plan level required
- `requiredPlan?: 'free' | 'standard' | 'pro'` - Exact plan required
- `requiredRole?: number` - Minimum role level required
- `redirectTo?: string` - Where to redirect unauthorized users (default: `/login`)
- `fallback?: ReactNode` - Component to show when unauthorized

**Usage Examples:**

#### 1. Basic Authentication

```tsx
import { AuthorizationGuard } from '~/contexts/guard.context';

export default function DashboardHome() {
    return (
        <AuthorizationGuard>
            {/* Only authenticated users see this */}
            <div>Dashboard Content</div>
        </AuthorizationGuard>
    );
}
```

#### 2. PRO Feature

```tsx
export default function AutomationPage() {
    return (
        <AuthorizationGuard minPlan="pro">
            {/* Only PRO users see this */}
            <div>Automation Builder</div>
        </AuthorizationGuard>
    );
}
```

#### 3. Conditional Rendering

```tsx
import { useAuth } from '~/contexts/auth.context';

export default function FeaturePage() {
    const { isPro, canAccessFeature } = useAuth();

    return (
        <div>
            {isPro ? (
                <PremiumFeature />
            ) : (
                <UpgradePrompt feature="Premium Analytics" />
            )}

            {canAccessFeature('standard') && (
                <StandardFeature />
            )}
        </div>
    );
}
```

---

### AuthContext Helpers

**Location:** `frontend/app/contexts/auth.context.tsx`

#### Available Properties:

```typescript
const {
    user,              // Current user object
    signed,            // Boolean: is user signed in?
    loading,           // Boolean: is auth loading?
    
    // Plan checkers
    isPro,             // Boolean: has PRO plan?
    isStandard,        // Boolean: has Standard plan?
    isFree,            // Boolean: has free plan?
    
    // Helper function
    canAccessFeature,  // Function: can user access a feature requiring specific plan?
    
    // Actions
    login,
    logout,
    register
} = useAuth();
```

#### Example:

```tsx
import { useAuth } from '~/contexts/auth.context';

function MyComponent() {
    const { user, isPro, canAccessFeature } = useAuth();

    return (
        <div>
            <h1>Welcome {user?.fullname}!</h1>
            <p>Plan: {user?.plan}</p>
            
            {isPro && <PROBadge />}
            
            {canAccessFeature('standard') ? (
                <AdvancedFeature />
            ) : (
                <button onClick={showUpgradePrompt}>
                    Unlock Advanced Features
                </button>
            )}
        </div>
    );
}
```

---

### UpgradePrompt Component

**Location:** `frontend/app/components/upgrade-prompt.tsx`

**Purpose:** Display upgrade prompt when users try to access premium features.

**Usage:**
```tsx
import { UpgradePrompt } from '~/components/upgrade-prompt';

function MyComponent() {
    const [showUpgrade, setShowUpgrade] = useState(false);

    return (
        <>
            <button onClick={() => setShowUpgrade(true)}>
                Try Premium Feature
            </button>

            {showUpgrade && (
                <UpgradePrompt 
                    feature="Email Automations"
                    requiredPlan="pro"
                    onClose={() => setShowUpgrade(false)}
                />
            )}
        </>
    );
}
```

---

## API Error Handling

### Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 401 | Unauthorized - Not authenticated | Redirect to login |
| 402 | Payment Required - PRO plan needed | Show upgrade prompt |
| 403 | Forbidden - Not authorized | Show error message |
| 404 | Not Found - Resource doesn't exist | Show not found message |
| 500+ | Server Error | Show generic error |

### API Service Interceptor

The API service (`frontend/app/services/api.ts`) automatically handles these errors:

- **401**: Redirects to `/login`
- **402**: Dispatches `show-upgrade-prompt` event
- **403**: Logs error
- **404**: Logs error
- **500+**: Logs server error

### Listening to Upgrade Events

```tsx
useEffect(() => {
    const handleUpgradePrompt = (event: CustomEvent) => {
        const { feature } = event.detail;
        setUpgradePrompt({ show: true, feature });
    };

    window.addEventListener('show-upgrade-prompt', handleUpgradePrompt as EventListener);
    
    return () => {
        window.removeEventListener('show-upgrade-prompt', handleUpgradePrompt as EventListener);
    };
}, []);
```

---

## Testing Guide

### Backend Testing

#### Test with different user types:

```bash
# As FREE user
curl -b cookies.txt http://localhost:3000/api/automation/123

# Expected: 402 Payment Required

# As PRO user
curl -b pro-cookies.txt http://localhost:3000/api/automation/123

# Expected: 200 OK or 404 Not Found
```

#### Test ownership:

```bash
# Try to access another user's resource
curl -b user-a-cookies.txt http://localhost:3000/api/bio/user-b-bio-id

# Expected: 403 Forbidden
```

### Frontend Testing

#### Test navigation guards:

1. Log out → Try to access `/dashboard/automation` → Should redirect to `/login`
2. Log in as FREE user → Try to access `/dashboard/automation` → Should redirect to `/`
3. Log in as PRO user → Try to access `/dashboard/automation` → Should load successfully

#### Test UI elements:

1. As FREE user, automation buttons should show "Upgrade to PRO"
2. As PRO user, all features should be accessible
3. Click PRO-only features as FREE user → Should show UpgradePrompt

---

## Common Patterns

### Pattern 1: Protecting a new PRO route (Backend)

```typescript
import { Router } from 'express';
import { requireAuth, isUserPro } from '../middlewares';

const router = Router();

router.post('/my-pro-feature', requireAuth, isUserPro, async (req, res) => {
    // Your logic here
});

export default router;
```

### Pattern 2: Protecting a new PRO route (Frontend)

```tsx
import { AuthorizationGuard } from '~/contexts/guard.context';

export default function MyProFeature() {
    return (
        <AuthorizationGuard minPlan="pro">
            <div>PRO Feature Content</div>
        </AuthorizationGuard>
    );
}
```

### Pattern 3: Adding ownership check

```typescript
import { requireAuth, requireBioOwner } from '../middlewares';

router.put('/bio/:id/update', requireAuth, requireBioOwner, async (req, res) => {
    // User owns this bio, safe to update
});
```

### Pattern 4: Conditional UI based on plan

```tsx
import { useAuth } from '~/contexts/auth.context';

function MyComponent() {
    const { isPro, isFree } = useAuth();

    return (
        <div>
            {isPro && <PremiumFeatures />}
            {isFree && <UpgradeBanner />}
        </div>
    );
}
```

---

## Security Checklist

When adding a new feature:

- [ ] Determine if it's FREE, STANDARD, or PRO
- [ ] Add appropriate middleware to backend routes
- [ ] Add ownership verification if modifying resources
- [ ] Wrap frontend components/routes with AuthorizationGuard
- [ ] Test with all user types (unauthenticated, FREE, STANDARD, PRO)
- [ ] Test ownership verification
- [ ] Add upgrade prompts in UI where appropriate
- [ ] Document the new route/feature

---

## FAQ

**Q: How do I make a feature require any paid plan (Standard OR PRO)?**

A: Use `requirePaidPlan` instead of `isUserPro`:

```typescript
router.post('/paid-feature', requireAuth, requirePaidPlan, async (req, res) => {
    // Both Standard and PRO users can access
});
```

**Q: How do I check if a user can access a feature in the frontend?**

A: Use the `canAccessFeature` helper:

```tsx
const { canAccessFeature } = useAuth();

if (canAccessFeature('standard')) {
    // User hasStandard or PRO plan
}
```

**Q: How do I handle 402 errors from the API?**

A: The API service automatically dispatches a `show-upgrade-prompt` event. Listen to it or let the interceptor handle it.

**Q: Can I have multiple middleware on the same route?**

A: Yes! Chain them in order:

```typescript
router.post('/route', 
    requireAuth,           // Must be authenticated
    isUserPro,             // Must have PRO plan
    requireBioOwner,       // Must own the bio
    async (req, res) => {
        // All checks passed
    }
);
```

---

## Support

For questions or issues related to security implementation, please refer to:
- Backend middleware: `backend/src/middlewares/`
- Frontend guards: `frontend/app/contexts/guard.context.tsx`
- API service: `frontend/app/services/api.ts`
