# Backend Task: Verify & Fix GET /profiles/me for Admin Users

## Context

The PredictiX frontend profile dropdown (navbar) calls `GET /profiles/me` for ALL users
(both ADMIN and USER roles) to display:
- `name` (full_name)
- `email`
- `role`  
- `department` (department name string, or null)
- `warehouse` (warehouse name string, or null)

The frontend `UserProfileData` type expects:
```ts
{
  id: string;
  employee_id: string | null;
  firstName: string;
  lastName: string;
  name: string;           // full_name
  email: string;
  contactNumber: string | null;
  address: string | null;
  department: string | null;   // <-- department NAME string (not ID)
  department_id: string | null;
  warehouse: string | null;    // <-- warehouse NAME string (not ID)
  warehouse_id: string | null;
  role: string;
  status: string;
  assignedAssetsCount: number;
}
```

## Task

In `app/routers/profiles.py` (or wherever `GET /profiles/me` is implemented):

1. **Ensure it works for ADMIN role users** - currently it may only work for USER role.
   Admin users are `Profile` records with `role = "admin"`. The endpoint must return the
   same shape for admin users too.

2. **Ensure `department` and `warehouse` are NAMES (strings), not IDs**.
   - Join with the `Department` table to get `department.name`
   - Join with the `Warehouse` table to get `warehouse.name`
   - If a profile has no department/warehouse, return `null` for those fields.

3. **Ensure `name` field is populated** as `first_name + " " + last_name` (or `full_name`
   column if your model has one). The frontend uses `data.name` to display the user's
   full name in the navbar.

## Expected Response Shape

```json
{
  "id": "uuid-here",
  "employee_id": "EMP-001",
  "firstName": "Dinusha",
  "lastName": "Ekanayake",
  "name": "Dinusha Ekanayake",
  "email": "admin@example.com",
  "contactNumber": "+94771234567",
  "address": "123 Main St, Colombo",
  "department": "Operations",
  "department_id": "uuid-dept",
  "warehouse": "Colombo Main Warehouse",
  "warehouse_id": "uuid-wh",
  "role": "admin",
  "status": "active",
  "assignedAssetsCount": 0
}
```

## Pattern to Follow

Follow the same pattern already used in the existing `GET /profiles/me` endpoint.
If it already returns the correct shape for USER role, just ensure admin profiles
are also handled (they may have `department_id` and `warehouse_id` like users,
or they may not - return `null` gracefully if not).

The frontend gracefully handles `null` for department and warehouse - it simply
won't show those rows in the dropdown.
