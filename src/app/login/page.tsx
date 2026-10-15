"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthUI } from "@/components/ui/auth-ui";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  return <AuthUI redirectUrl={redirect} defaultMode={mode} />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
