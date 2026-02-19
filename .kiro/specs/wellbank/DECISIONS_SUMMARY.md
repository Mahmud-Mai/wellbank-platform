# WellBank Product and Technical Decisions Summary

> Version: 2.0  
> Date: 2026-02-19  
> Purpose: Single source of truth for implementation

---

## Final Model

### User Roles (4 total)
- `patient` - Seeks healthcare services
- `doctor` - Provides consultations (can be independent)
- `provider_admin` - Creates organizations (hospital/lab/pharmacy/etc)
- `wellbank_admin` - Platform admin (seeded by super admin)

### Organization Types (created by provider_admin)
- `hospital`, `laboratory`, `pharmacy`, `clinic`, `insurance`, `emergency`, `logistics`

### Organization Member Roles (scoped to org)
- `admin`, `doctor`, `pharmacist`, `lab_tech`, `nurse`, `receptionist`, `staff`

### Admin Model
- Super admin: Seeded on server deployment
- Normal admins: Created by super admin in admin dashboard
- Same login, different UI

---

## All Decisions Made

| ID | Decision | Status |
|----|----------|--------|
| DD-001 | User Entity Model: Multi-role hybrid | ✅ DECIDED |
| DD-002 | Organizations: All provider types are organizations | ✅ DECIDED |
| DD-003 | Patient subscription required | ✅ PRD |
| DD-004 | Logistics/Delivery deferred | ✅ Stubs only |
| DD-005 | Patient fields: nationality, LGA, nextOfKin, currentMedications | ✅ PRD |
| DD-006 | Provider document types (~25) | ✅ PRD |
| DD-007 | Bank accounts for provider payouts | ✅ PRD |
| DD-008 | Admin verification workflow | ✅ PRD |
| DD-009 | OTP-based registration flow | ✅ PRD |
| DD-010 | Hospital-linked patients | ✅ PRD |
| DD-011 | Double-entry financial ledger | ✅ DECIDED |
| DD-012 | 3rd-party integrations deferred | ✅ Stubs only |
| HashiCorp | Keep Vault | ✅ DECIDED |

---

## Files to Share with Lovable

| File | Purpose |
|------|---------|
| `LOVABLE_API_CONTRACT.md` | Complete API endpoints, payloads, responses |
| `LOVABLE_CORRECTIONS.md` | Frontend corrections & new tasks |

---

## API Endpoints Reference

See `LOVABLE_API_CONTRACT.md` for full API contract.
