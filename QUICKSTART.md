# Quick Start Guide - Backend Integration

## Prerequisites
- Backend server running at `http://localhost:8000`
- Backend has `/api` endpoints as specified in [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)
- Frontend running on `http://localhost:3000` (Next.js default)

## Environment Variables
Create `.env.local` in the project root if you need to customize the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Then update [lib/api.ts](lib/api.ts) to use:
```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  // ...
})
```

## Running the Application

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
# or
yarn install
```

### 2. Start Development Server
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### 3. Ensure Backend is Running
Make sure your backend API is running and accessible at `http://localhost:8000`

## First Login

1. Navigate to `http://localhost:3000/login`
2. Enter valid credentials from your backend database
3. You'll be redirected to the appropriate dashboard based on user role:
   - Admin → `/dashboard/admin`
   - Petugas → `/dashboard/petugas`
   - Peminjam → `/dashboard/peminjam`

## What's Working

✅ **Authentication**
- Login with real backend credentials
- Token stored in localStorage & cookies
- Automatic logout on 401 errors
- Protected routes

✅ **Dashboard**
- Stats from backend API
- Recent borrowings & activity logs
- All data from database

✅ **Admin Features**
- User management (list, create, edit, delete)
- Inventory management (tools & categories)
- Activity logs
- Dashboard statistics

✅ **Petugas Features**
- Approve/reject borrowing requests
- Return confirmation
- Report generation with data from backend

✅ **Peminjam Features**
- View personal borrowings
- Browse available tools
- Create borrowing requests
- Track borrowing status

## Removing Demo Accounts

Edit [app/login/page.tsx](app/login/page.tsx) and remove the "Akun Demo" section if you don't need it:

```tsx
// Find and delete this section:
{/* Demo accounts */}
<div className="mt-6 pt-6 border-t border-neutral-800">
  <p className="text-sm text-neutral-400 mb-3">Akun Demo:</p>
  {/* ... rest of demo code ... */}
</div>
```

## API Endpoint Testing

You can test API endpoints using cURL, Postman, or API client:

### Login Example
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Get Users (requires token)
```bash
curl http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### "Cannot find module '@/components/auth-guard'"
The auth-guard component was just created. If you get this error:
1. Clear Next.js cache: `rm -rf .next`
2. Restart development server

### "401 Unauthorized" on API calls
- Check that token is being sent in Authorization header
- Verify token is still valid (not expired)
- Try logging in again

### "Cannot reach backend"
- Verify backend is running on `http://localhost:8000`
- Check if CORS is enabled on backend for `http://localhost:3000`
- Check browser console for network errors

### "Redirected to login unexpectedly"
- Check browser cookies - auth-token cookie should be present
- Verify localStorage has auth-storage data
- Check that user token is valid on backend

## Next Steps

1. **Customize UI**
   - Modify colors and styling in Tailwind config
   - Update logo and branding

2. **Add More Features**
   - Notifications/alerts system
   - Email confirmations
   - Export/import functionality

3. **Performance**
   - Implement infinite scroll for large lists
   - Add pagination to data tables
   - Optimize bundle size

4. **Security**
   - Implement CSRF protection
   - Add rate limiting
   - Secure sensitive data in transit

5. **Monitoring**
   - Add error tracking (Sentry, etc.)
   - Implement analytics
   - Monitor API response times

## Support

For issues related to:
- **Backend integration**: Check [lib/api.ts](lib/api.ts)
- **Authentication**: Check [lib/store.ts](lib/store.ts)
- **Protected routes**: Check [middleware.ts](middleware.ts)
- **Components**: Check [components/auth-guard.tsx](components/auth-guard.tsx)
- **Detailed info**: See [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)

## Production Deployment

Before deploying to production:

1. **Environment Variables**
   - Set `NEXT_PUBLIC_API_URL` to production backend URL
   - Ensure CORS is properly configured

2. **Security**
   - Enable HTTPS
   - Set secure cookie flags
   - Configure CORS properly

3. **Build**
   ```bash
   pnpm build
   pnpm start
   ```

4. **Testing**
   - Test all authentication flows
   - Verify all CRUD operations work
   - Test error handling
   - Test with different user roles

---

**Last Updated**: January 17, 2026
**Status**: ✅ Ready for Backend Integration
