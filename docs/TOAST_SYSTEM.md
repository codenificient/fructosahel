# Toast Notification System

A comprehensive toast notification system for the FructoSahel application, providing user feedback for CRUD operations and other important events.

## Overview

The toast notification system consists of the following components:

- `components/ui/toast.tsx` - Individual toast component with variants
- `components/ui/toaster.tsx` - Toast container that manages multiple toasts
- `lib/hooks/use-toast.ts` - Custom hook for toast state management
- `components/toast-provider.tsx` - Context provider for global toast access

## Features

- **4 Variants**: default, success, error, warning
- **Auto-dismiss**: Configurable duration (default 5 seconds)
- **Manual dismiss**: Close button on each toast
- **Stack limit**: Maximum 3 visible toasts at once
- **Animations**: Smooth slide-in from bottom-right
- **Accessibility**: Proper ARIA attributes
- **Responsive**: Works on all screen sizes
- **Z-index**: Above modals (z-index: 100)

## Installation

The toast system is already integrated into the application through the `ToastProvider` in `app/[locale]/layout.tsx`.

## Usage

### Basic Usage

```typescript
import { useToastContext } from "@/components/toast-provider";

function MyComponent() {
  const { toast } = useToastContext();

  const handleAction = () => {
    toast({
      variant: "success",
      title: "Success",
      description: "Operation completed successfully",
    });
  };

  return <button onClick={handleAction}>Click me</button>;
}
```

### Helper Methods

The hook provides convenience methods for common toast types:

```typescript
const { success, error, warning, info } = useToastContext();

// Success toast
success("Farm Created", "New farm added successfully");

// Error toast
error("Error", "Failed to create farm");

// Warning toast
warning("Warning", "Please check your input");

// Info toast
info("Information", "System update available");
```

### Custom Duration

```typescript
toast({
  variant: "success",
  title: "Quick message",
  description: "This will disappear in 2 seconds",
  duration: 2000, // 2 seconds
});
```

### Manual Dismiss

```typescript
const { toast, dismiss, dismissAll } = useToastContext();

// Show a toast and get its ID
const toastId = toast({
  variant: "warning",
  title: "Processing",
  description: "Please wait...",
  duration: 0, // Won't auto-dismiss
});

// Later, dismiss this specific toast
dismiss(toastId);

// Or dismiss all toasts
dismissAll();
```

## Toast Variants

### Default
- **Use case**: General information
- **Color**: Gray/neutral
- **Example**: "Settings saved"

### Success
- **Use case**: Successful operations
- **Color**: Green
- **Icon**: Checkmark
- **Example**: "Farm created successfully"

### Error
- **Use case**: Failed operations, validation errors
- **Color**: Red
- **Icon**: X mark
- **Example**: "Failed to delete farm"

### Warning
- **Use case**: Warnings, caution messages
- **Color**: Yellow
- **Icon**: Alert triangle
- **Example**: "Please fill in all required fields"

## Integration Examples

### Farms Page
```typescript
const { toast } = useToastContext();

const handleCreateFarm = async () => {
  try {
    await createFarm.mutate(farmData);
    toast({
      variant: "success",
      title: "Farm Created",
      description: `${farmData.name} has been added successfully`,
    });
  } catch (err) {
    toast({
      variant: "error",
      title: "Error",
      description: err.message,
    });
  }
};
```

### Tasks Page
```typescript
const createTask = useCreateTask(() => {
  toast({
    variant: "success",
    title: "Task Created",
    description: "New task has been added successfully",
  });
  refetch();
});
```

### Team Page
```typescript
const handleDeleteMember = async () => {
  try {
    await deleteUser.mutate({ id: selectedUser.id });
    toast({
      variant: "success",
      title: "Team Member Removed",
      description: "Team member has been removed successfully",
    });
  } catch (err) {
    toast({
      variant: "error",
      title: "Error",
      description: "Failed to delete team member",
    });
  }
};
```

### Finance Page
```typescript
const handleCreateTransaction = () => {
  if (!transactionForm.category) {
    toast({
      variant: "error",
      title: "Validation Error",
      description: "Please fill in all required fields",
    });
    return;
  }

  createTransaction.mutate(transactionForm);
};
```

## Best Practices

1. **Title + Description**: Always provide both for clarity
   ```typescript
   // Good
   toast({
     variant: "success",
     title: "Farm Created",
     description: "Sahel Farm has been added successfully"
   });

   // Avoid
   toast({ title: "Success" }); // Too vague
   ```

2. **Specific Messages**: Make descriptions informative
   ```typescript
   // Good
   error("Validation Error", "Please fill in all required fields");

   // Avoid
   error("Error", "Something went wrong");
   ```

3. **Use Appropriate Variants**:
   - Success: CRUD operations completed
   - Error: Failed operations, API errors
   - Warning: Validation errors, cautionary messages
   - Default: General notifications

4. **Duration Guidelines**:
   - Success: 3-5 seconds (default)
   - Error: 5-7 seconds (users need time to read)
   - Warning: 5-7 seconds
   - Info: 3-5 seconds

5. **Avoid Spam**: Don't show multiple toasts for the same action
   ```typescript
   // Good
   try {
     await Promise.all([action1(), action2(), action3()]);
     toast({ variant: "success", title: "All operations completed" });
   } catch {
     toast({ variant: "error", title: "Some operations failed" });
   }

   // Avoid - creates toast spam
   await action1(); toast({ title: "1 done" });
   await action2(); toast({ title: "2 done" });
   await action3(); toast({ title: "3 done" });
   ```

## Styling

The toast system uses Tailwind CSS and supports dark mode automatically. Colors are defined in the `variantStyles` object in `toast.tsx`.

## Accessibility

- ARIA live regions for screen readers
- Keyboard accessible close buttons
- Focus management
- Semantic HTML structure

## Technical Details

### State Management
- Uses React Context for global state
- Custom hook (`useToast`) manages toast lifecycle
- Automatic cleanup on unmount

### Animation
- CSS transitions for smooth animations
- Slide-in from bottom-right
- Configurable via Tailwind classes

### Performance
- Maximum 3 visible toasts (older ones are hidden)
- Automatic cleanup of dismissed toasts
- No re-renders on unrelated state changes

## Migration from Old System

If you have existing notification code, replace it as follows:

**Before:**
```typescript
const [notification, setNotification] = useState({ show: false, message: "" });

const showNotification = (type, message) => {
  setNotification({ show: true, type, message });
  setTimeout(() => setNotification({ show: false }), 5000);
};

// JSX
{notification.show && <div className="notification">{notification.message}</div>}
```

**After:**
```typescript
const { toast } = useToastContext();

toast({
  variant: type,
  title: "Action Complete",
  description: message,
});

// No JSX needed - ToastProvider handles rendering
```

## Troubleshooting

**Toasts not appearing:**
- Ensure `ToastProvider` is in your layout
- Check z-index conflicts
- Verify import paths

**Toasts not auto-dismissing:**
- Check if duration is set to 0
- Verify timeout cleanup

**Multiple toasts overlapping:**
- System automatically limits to 3 toasts
- Check if you're calling toast multiple times

## Files Modified

- `app/[locale]/layout.tsx` - Added ToastProvider
- `app/[locale]/dashboard/farms/page.tsx` - Integrated toast notifications
- `app/[locale]/dashboard/tasks/page.tsx` - Integrated toast notifications
- `app/[locale]/dashboard/team/page.tsx` - Integrated toast notifications
- `app/[locale]/dashboard/finance/page.tsx` - Integrated toast notifications

## Future Enhancements

- [ ] Toast position configuration (top-left, top-right, etc.)
- [ ] Custom toast icons
- [ ] Progress bar for auto-dismiss
- [ ] Toast groups/categories
- [ ] Persist toasts across page navigation
- [ ] Sound notifications (optional)
