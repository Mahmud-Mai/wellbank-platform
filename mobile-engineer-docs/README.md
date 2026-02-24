# WellBank Mobile Engineer Documentation

## Overview
This package contains everything you need to build the WellBank mobile app with mock data while the backend is being developed.

## Files Included

| File | Description |
|------|-------------|
| `api-endpoints.md` | Complete API specification with all endpoints, payloads, and responses |
| `design-decisions.md` | Architectural decisions that differ from the PRD |
| `interfaces.ts` | TypeScript interfaces for all data models |
| `enums.ts` | TypeScript enums (roles, statuses, types) |
| `validation.ts` | Zod validation schemas |

## Key Points

### Differences from PRD
- Multi-role user model (user can have multiple roles)
- Organizations for hospitals/labs/pharmacies (not user roles)
- OTP-based registration flow (10 steps)
- Subscription required for patients

### Stubbed Integrations
All 3rd-party integrations return mock success:
- Dojah (KYC) - returns mock verified
- BudPay (Payments) - returns mock success
- SMS - returns mock sent
- Video (WebRTC) - returns mock URL
- Logistics/Delivery - returns mock tracking

### API Base URL
```
http://localhost:35432/api/v1
```

### Authentication
- Bearer token in Authorization header
- Tokens returned from login endpoint

## Response Format
All responses follow this structure:
```json
{
  "status": "success" | "fail" | "error",
  "message": "string",
  "data": {},
  "errors": []
}
```

## Common Error Codes
- `VALIDATION_ERROR` - Invalid request data
- `EMAIL_EXISTS` - Duplicate email
- `INVALID_CREDENTIALS` - Wrong password
- `MFA_REQUIRED` - Needs MFA code
- `RATE_LIMIT_EXCEEDED` - Too many attempts
- `SLOT_UNAVAILABLE` - Booking slot taken
- `INSUFFICIENT_BALANCE` - Not enough wallet funds
- `ACCESS_DENIED` - Permission denied

## Next Steps
1. Use `api-endpoints.md` to build mock responses
2. Match response formats exactly from the spec
3. Build UI components using interfaces in `interfaces.ts`
4. When backend is ready, swap mock API for real calls
