/**
 * Toast Notification Examples
 *
 * This file demonstrates various ways to use the toast notification system
 * in the FructoSahel application.
 */

"use client";

import { useToastContext } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ToastExamples() {
  const { toast, success, error, warning, info, dismiss, dismissAll } = useToastContext();

  // Example 1: Basic success toast
  const showSuccessToast = () => {
    success("Operation Successful", "The action was completed successfully");
  };

  // Example 2: Error toast with longer message
  const showErrorToast = () => {
    error(
      "Failed to Save",
      "There was an error saving your changes. Please try again later."
    );
  };

  // Example 3: Warning toast
  const showWarningToast = () => {
    warning(
      "Missing Information",
      "Please fill in all required fields before submitting"
    );
  };

  // Example 4: Info toast
  const showInfoToast = () => {
    info("System Update", "A new version of the app is available");
  };

  // Example 5: Custom toast with all options
  const showCustomToast = () => {
    toast({
      variant: "success",
      title: "Farm Created",
      description: "Sahel Farm has been added to your portfolio",
      duration: 7000, // 7 seconds
    });
  };

  // Example 6: Toast that doesn't auto-dismiss
  const showPersistentToast = () => {
    const toastId = toast({
      variant: "warning",
      title: "Processing",
      description: "Please wait while we process your request...",
      duration: 0, // Won't auto-dismiss
    });

    // Simulate async operation
    setTimeout(() => {
      dismiss(toastId);
      success("Complete", "Processing finished successfully");
    }, 5000);
  };

  // Example 7: Multiple toasts
  const showMultipleToasts = () => {
    success("Step 1", "Farm data validated");
    setTimeout(() => {
      success("Step 2", "Saving to database");
    }, 1000);
    setTimeout(() => {
      success("Step 3", "Farm created successfully");
    }, 2000);
  };

  // Example 8: Form validation example
  const handleFormSubmit = () => {
    const formData = {
      name: "",
      location: "",
      size: 0,
    };

    if (!formData.name || !formData.location || formData.size <= 0) {
      error(
        "Validation Error",
        "Please fill in all required fields with valid values"
      );
      return;
    }

    success("Form Submitted", "Your farm has been created successfully");
  };

  // Example 9: API error handling
  const handleApiCall = async () => {
    try {
      // Simulated API call
      const response = await fetch("/api/farms", {
        method: "POST",
        body: JSON.stringify({ name: "Test Farm" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create farm");
      }

      success("Farm Created", "Your farm has been added successfully");
    } catch (err) {
      error(
        "Error",
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  // Example 10: Dismiss all toasts
  const handleDismissAll = () => {
    dismissAll();
    info("Cleared", "All notifications have been dismissed");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Toast Notification Examples</h1>
        <p className="text-muted-foreground mt-2">
          Click the buttons below to see different toast notification styles
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Basic Variants</CardTitle>
            <CardDescription>Standard toast notification types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={showSuccessToast} variant="default" className="w-full">
              Show Success Toast
            </Button>
            <Button onClick={showErrorToast} variant="destructive" className="w-full">
              Show Error Toast
            </Button>
            <Button onClick={showWarningToast} variant="outline" className="w-full">
              Show Warning Toast
            </Button>
            <Button onClick={showInfoToast} variant="secondary" className="w-full">
              Show Info Toast
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Examples</CardTitle>
            <CardDescription>Custom configurations and behaviors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={showCustomToast} variant="default" className="w-full">
              Custom Duration (7s)
            </Button>
            <Button onClick={showPersistentToast} variant="default" className="w-full">
              Persistent Toast
            </Button>
            <Button onClick={showMultipleToasts} variant="default" className="w-full">
              Multiple Toasts
            </Button>
            <Button onClick={handleDismissAll} variant="outline" className="w-full">
              Dismiss All
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-World Examples</CardTitle>
            <CardDescription>Common use cases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleFormSubmit} variant="default" className="w-full">
              Form Validation
            </Button>
            <Button onClick={handleApiCall} variant="default" className="w-full">
              API Call Example
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Basic Success Toast</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`const { success } = useToastContext();

success("Operation Successful", "The action was completed successfully");`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Error Handling</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`const { error } = useToastContext();

try {
  await createFarm(data);
} catch (err) {
  error("Error", err.message);
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Custom Configuration</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`const { toast } = useToastContext();

toast({
  variant: "success",
  title: "Farm Created",
  description: "Your farm has been added",
  duration: 7000, // 7 seconds
});`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
