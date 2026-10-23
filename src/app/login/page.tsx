"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthUI } from "@/components/ui/auth-ui";
import { useSession } from "@/lib/auth-client";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session?.user && !isPending) {
      router.replace(redirect);
    }
  }, [session, isPending, redirect, router]);

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
