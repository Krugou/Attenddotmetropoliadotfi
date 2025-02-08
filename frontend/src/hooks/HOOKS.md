# Custom React Hooks

This directory contains custom React hooks used throughout the application.

## useIsMobile

A responsive design hook that detects whether the current viewport is in mobile width.

### Usage

```tsx
import { useIsMobile } from './hooks/useIsMobile';

function MyComponent() {
  const isMobile = useIsMobile(768);

  return (
    <div>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  );
}
```

### Parameters

- `breakpoint` (optional): Number of pixels to use as the mobile breakpoint. Defaults to 768px.

### Return Value

Returns a boolean that is:

- `true` when viewport width is less than the breakpoint
- `false` when viewport width is greater than or equal to the breakpoint

### Notes

- The hook automatically updates when the window is resized
- Cleans up event listeners on component unmount
- Uses the standard React hooks pattern for state management
