# User Profile Enhancement Implementation Guide

## Overview
This document describes the enhanced user profile management system for PredictiX Frontend. The implementation includes a dynamic profile form with validation, loading states, and a modern UI following the established design patterns.

## Components Created

### 1. UserProfileForm Component
**Location:** `src/components/user/UserProfileForm.tsx`

#### Features
- **Dual Mode Interface:**
  - **Read Mode:** Displays user information with icons in a clean grid layout
  - **Edit Mode:** Interactive form with real-time validation
  
- **Form Fields:**
  - First Name (required, 2-50 characters)
  - Last Name (required, 2-50 characters)
  - Phone Number (optional, validates format)
  - Address (optional, max 200 characters with counter)

- **Validation Rules:**
  ```
  First Name:
  - Required field
  - Minimum 2 characters
  - Maximum 50 characters
  
  Last Name:
  - Required field
  - Minimum 2 characters
  - Maximum 50 characters
  
  Phone Number:
  - Optional field
  - Supports formats: +1 (555) 123-4567, 555-123-4567, 5551234567, etc.
  - Uses regex: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
  
  Address:
  - Optional field
  - Maximum 200 characters
  - Character counter provided
  ```

- **UI Elements:**
  - Avatar with user initials on gradient background
  - Role and status badges
  - Icon-based information cards
  - Error messages with icons
  - Loading states
  - Toast notifications

#### Props
```typescript
interface UserProfileFormProps {
  initialProfile: UserProfileData;
  onProfileUpdated?: (updatedProfile: UserProfileData) => void;
}
```

#### Usage
```typescript
import { UserProfileForm } from "@/components/user/UserProfileForm";

<UserProfileForm
  initialProfile={profileData}
  onProfileUpdated={(updated) => {
    // Handle profile update
  }}
/>
```

### 2. Profile Page
**Location:** `src/app/(user)/user/profile/page.tsx`

#### Features
- Loads user profile on mount
- Displays loading state with spinner
- Handles and displays errors
- Integrates UserProfileForm component
- Updates profile seamlessly

#### Route
- **URL:** `/user/profile`
- **Access:** Through user navigation or by redirect from `/user/dashboard`

### 3. Skeleton Component
**Location:** `src/components/ui/skeleton.tsx`

A reusable skeleton/placeholder component for loading states using Tailwind's animate-pulse.

## API Integration

### Endpoints Used
- `GET /user-profile/me` - Fetch current user profile
- `PUT /user-profile/me` - Update user profile

### API Functions
From `lib/api/userProfileApi.ts`:
- `fetchMyProfile()` - Get profile data
- `updateMyProfile(data)` - Update profile with validation

## Design Patterns & Styling

### Color & Spacing
- Uses Tailwind CSS v4 with CVA (class-variance-authority)
- Consistent spacing: `gap-3`, `gap-4`, `gap-6`
- Rounded corners: `rounded-lg`, `rounded-xl`, `rounded-2xl`

### Form Field Styling
- Label: `text-sm font-medium text-foreground`
- Input with error state: border-destructive
- Error message: `text-xs text-destructive` with AlertCircle icon
- Disabled state support with visual feedback

### Card Components
- Header with title and optional description
- Content padding `pt-6` or custom
- Separator divider for sections

### Icons Used
- `Mail` - Email
- `Phone` - Contact number
- `MapPin` - Address
- `Briefcase` - Department
- `Building2` - Warehouse
- `User` - Employee ID
- `AlertCircle` - Error indicator

### Responsive Design
- Mobile-first approach
- 1-column layout on mobile
- 2-column layout on desktop (md breakpoint)
- Full-width form fields on small screens

## Error Handling

### Form Validation
- Real-time validation on input change
- Errors clear when user starts typing
- Visual error indicators with icons
- Helpful error messages for each field

### API Error Handling
- Try-catch blocks for API calls
- Toast notifications for success/error
- Fallback to mock data if API fails
- Loading and error states in UI

## State Management

### Component State
```typescript
- isEditing: boolean (toggle edit mode)
- isLoading: boolean (during API calls)
- formData: object (firstName, lastName, contactNumber, address)
- errors: object (validation errors by field)
```

### Page State
```typescript
- profile: UserProfileData | null
- isLoading: boolean
- error: string | null
```

## User Experience Features

1. **Edit Toggle:** Clean button to switch between view and edit modes
2. **Toast Notifications:** Visual feedback for success/error
3. **Save/Cancel:** User can discard changes without saving
4. **Character Counter:** For address field (current/max)
5. **Loading States:** Spinner during initial load
6. **Error Recovery:** Clear error messages with reload capability
7. **Disabled States:** Buttons and inputs disabled during save
8. **Icon Indicators:** Visual cues for different information types

## Styling Classes Used

### Layout
- `w-full` - Full width
- `max-w-2xl` - Maximum width container
- `mx-auto` - Center alignment
- `grid grid-cols-1 md:grid-cols-2` - Responsive grid

### Spacing
- `space-y-*` - Vertical spacing
- `gap-*` - Gap between flex/grid items
- `px-4 py-3.5` - Internal padding

### Text
- `text-sm`, `text-xs` - Font sizes
- `font-bold`, `font-semibold`, `font-medium` - Font weights
- `text-muted-foreground` - Subtle text color
- `text-destructive` - Error text color

### States
- `aria-invalid` - Accessibility indicator
- `disabled` - Disabled elements
- `animate-pulse` - Loading animation

## Accessibility

- Input fields have `aria-invalid` attribute for validation state
- Error messages use `AlertCircle` icon with text for visibility
- Labels clearly associated with inputs
- Proper semantic HTML structure (form elements)
- Clear contrast and readable typography

## Testing Recommendations

1. **Form Validation:**
   - Test all validation rules
   - Test empty field submission
   - Test character limits
   - Test phone format validation

2. **API Integration:**
   - Test successful profile update
   - Test error handling
   - Test network timeout scenario
   - Test mock data fallback

3. **UI/UX:**
   - Test responsive design on different screen sizes
   - Test loading states
   - Test error states
   - Test smooth transitions between modes

4. **Accessibility:**
   - Test keyboard navigation
   - Test screen reader compatibility
   - Test color contrast ratios

## Future Enhancements

1. **Additional Fields:**
   - Birthday date
   - Preferences (language, theme)
   - Notification settings

2. **Advanced Validation:**
   - Email verification
   - Phone number country code support
   - Address autocomplete integration

3. **Media:**
   - Profile picture upload
   - Avatar customization

4. **History:**
   - Profile update history
   - Audit log of changes

5. **Integration:**
   - Two-factor authentication
   - Password change functionality
   - Session management

## Troubleshooting

### Common Issues

1. **Validation not clearing:**
   - Errors clear automatically when user types
   - Check that error state is properly managed

2. **Profile not loading:**
   - Check API endpoint availability
   - Verify authentication token in localStorage
   - Check browser console for errors

3. **Changes not saving:**
   - Verify PUT endpoint is working
   - Check form validation passes
   - Verify toast notification shows error message

4. **Styling issues:**
   - Ensure Tailwind CSS is properly configured
   - Check for class name conflicts
   - Verify dark mode is not affecting colors

## Performance Notes

- Component uses memoization for profile data
- Form validation is debounced on input
- API calls use proper error handling
- Loading states prevent multiple submissions
- Toast notifications auto-dismiss after 3 seconds

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses CSS Flexbox and Grid
- Supports responsive design features
- Toast notifications require Sonner library

## Dependencies

```json
{
  "react": "^18",
  "next": "^14",
  "tailwindcss": "^4",
  "class-variance-authority": "^0.7",
  "lucide-react": "latest",
  "sonner": "latest"
}
```

## Support & Contact

For issues or feature requests related to the profile management system, please:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify API endpoint availability
4. Contact development team with details

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Ready for Production
