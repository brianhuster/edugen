# Hydration Error Fix

## Issue
React Hydration Error: Attributes of server-rendered HTML didn't match client properties.

Error showed `className="mdl-js"` being added to `<html>` tag unexpectedly.

## Root Causes

1. **Browser Extensions**: Some browser extensions (like Material Design Lite, ad blockers, etc.) modify the HTML before React hydrates
2. **Client-side only code**: Code that runs differently on server vs client (like `useSession` hooks)
3. **Dynamic content**: Content that changes between server render and client render

## Solutions Applied

### 1. Add `suppressHydrationWarning` to Layout (app/layout.tsx)
```tsx
<html lang="vi" suppressHydrationWarning>
  <body suppressHydrationWarning>
    <AuthProvider>{children}</AuthProvider>
  </body>
</html>
```

This tells React to ignore hydration mismatches on these elements, which is safe when:
- The mismatch is caused by browser extensions
- The mismatch is temporary and will be corrected after hydration

### 2. Add Mounted State to Home Page (app/page.tsx)
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <LoadingUI />; // Same UI for server and initial client
}
```

This ensures:
- Server and client render the same HTML initially
- Client-side only logic (like session check) only runs after mount
- Prevents hydration mismatch from `useSession` hook

## Why This Happens

### Browser Extensions
- Material Design Lite extension adds `mdl-js` class
- Other extensions may inject scripts, modify HTML, or add tracking pixels
- This happens AFTER server render but BEFORE React hydration

### NextAuth Session
- `useSession()` returns different values on server vs client
- Server: Always returns null/loading
- Client: May return actual session data
- This can cause content mismatch

## Alternative Solutions

If you still see hydration errors:

### Option 1: Disable Browser Extensions
Test in incognito mode or with extensions disabled

### Option 2: Use Dynamic Import
For components that have hydration issues:
```tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'), {
  ssr: false
});
```

### Option 3: Move Client Logic to useEffect
Ensure any client-specific logic only runs in `useEffect`:
```tsx
useEffect(() => {
  // Client-only code here
}, []);
```

## Testing

1. Clear browser cache
2. Test in incognito mode
3. Disable browser extensions
4. Reload the page multiple times
5. Check browser console for hydration warnings

## References

- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
