"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function ReviewToastContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("review") === "success") {
      toast.success("Thank you for your feedback!", {
        description: "Your review has been submitted successfully.",
      });
      
      // Clean up URL without refreshing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("review");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  return null;
}

export function ReviewToast() {
  return (
    <Suspense fallback={null}>
      <ReviewToastContent />
    </Suspense>
  );
}
