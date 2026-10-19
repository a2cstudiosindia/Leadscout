"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
    Zap, 
    Loader2, 
    Mail, 
    Lock, 
    User, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight,
    ShieldCheck,
    Check
} from "lucide-react";
import { authClient, signInWithGoogle } from "@/lib/auth-client";

// Main Login/Signup Form Component
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";
    const messageParam = searchParams.get("message");
    const errorParam = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState(messageParam || "");
    const [error, setError] = useState(errorParam || "");
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const toggleMode = (signUpMode: boolean) => {
        setIsSignUp(signUpMode);
        setError("");
        setMessage("");
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            const { error: signInError } = await authClient.signIn.email({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message || "Failed to sign in. Please check your email and password.");
                setIsLoading(false);
                return;
            }

            router.push(redirect);
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters");
            setIsLoading(false);
            return;
        }

        try {
            const { error: signUpError } = await authClient.signUp.email({
                email,
                password,
                name: name || email.split("@")[0],
            });

            if (signUpError) {
                setError(signUpError.message || "Failed to create account.");
                setIsLoading(false);
                return;
            }

            router.push(redirect);
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsGoogleLoading(true);
        setError("");
        try {
            await signInWithGoogle(redirect);
        } catch {
            setError("Failed to authenticate with Google. Please try again.");
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[var(--canvas)] overflow-x-hidden relative font-sans">
            
            {/* Panel A: Auth Form */}
            <div 
                className={`w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 bg-[var(--surface)] z-20 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSignUp 
                        ? "lg:translate-x-full lg:border-l lg:border-[var(--border)]" 
                        : "lg:translate-x-0 lg:border-r lg:border-[var(--border)]"
                }`}
            >
                {/* Brand Navigation */}
                <div className="flex items-center">
                    <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform active:scale-95">
                        <div className="w-8 h-8 bg-[var(--brand-500)] rounded-[var(--r-md)] text-white flex items-center justify-center shadow-xs">
                            <Zap size={16} className="fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base text-[var(--ink-primary)] tracking-tight leading-none">LeadScout</span>
                            <span className="text-[10px] font-semibold text-[var(--brand-600)] tracking-wider uppercase mt-0.5">Central Hub</span>
                        </div>
                    </Link>
                </div>

                {/* Form Body Container */}
                <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-5">
                    {/* Header */}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink-primary)] tracking-tight">
                            {isSignUp ? "Create your agency account" : "Welcome back"}
                        </h1>
                        <p className="text-xs text-[var(--ink-tertiary)] mt-1 leading-relaxed">
                            {isSignUp 
                                ? "Discover high-value prospects, close client retainers, and exchange leads." 
                                : "Sign in to access your agency workspace and pipeline."}
                        </p>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full py-2.5 px-4 bg-[var(--surface)] border border-[var(--border-strong)] hover:bg-[var(--neutral-50)] text-[var(--ink-primary)] font-medium rounded-[var(--r-md)] transition-all active:scale-[0.99] text-xs flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-muted)]" />
                        ) : (
                            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]"></div>
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase">
                            <span className="px-3 bg-[var(--surface)] text-[var(--ink-muted)] font-medium tracking-wider">or email</span>
                        </div>
                    </div>

                    {/* Feedback Banners */}
                    {message && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[var(--r-md)] flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-medium">{message}</span>
                        </div>
                    )}
                    {error && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-[var(--r-md)] flex items-start gap-2">
                            <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3.5">
                        {isSignUp && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-[var(--ink-primary)]">Full Name</label>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3 text-[var(--ink-muted)] pointer-events-none" size={15} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Alex Mercer"
                                        className="input pl-9"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-[var(--ink-primary)]">Work Email</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 text-[var(--ink-muted)] pointer-events-none" size={15} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="alex@youragency.com"
                                    className="input pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-[var(--ink-primary)]">Password</label>
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 text-[var(--ink-muted)] pointer-events-none" size={15} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="input pl-9 pr-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full justify-center py-2.5"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                ) : (
                                    <>
                                        <span>{isSignUp ? "Create Agency Account" : "Sign In to Dashboard"}</span>
                                        <ArrowRight size={13} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Mode Toggle Link */}
                    <div className="pt-2 text-center">
                        <p className="text-xs text-[var(--ink-tertiary)]">
                            {isSignUp ? (
                                <>
                                    Already have an account?{" "}
                                    <button 
                                        type="button"
                                        onClick={() => toggleMode(false)} 
                                        className="font-semibold text-[var(--brand-600)] hover:underline ml-1"
                                    >
                                        Sign in
                                    </button>
                                </>
                            ) : (
                                <>
                                    Need an agency account?{" "}
                                    <button 
                                        type="button"
                                        onClick={() => toggleMode(true)} 
                                        className="font-semibold text-[var(--brand-600)] hover:underline ml-1"
                                    >
                                        Create one free
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] pt-4 border-t border-[var(--border)]">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        Enterprise Encrypted
                    </span>
                    <span>&copy; {new Date().getFullYear()} LeadScout Central Hub</span>
                </div>
            </div>

            {/* Panel B: Minimalist Brand Showcase */}
            <div 
                className={`hidden lg:flex lg:w-1/2 min-h-screen flex-col justify-between p-12 xl:p-16 bg-[var(--neutral-950)] text-white relative overflow-hidden z-10 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSignUp 
                        ? "lg:-translate-x-full" 
                        : "lg:translate-x-0"
                }`}
            >
                {/* Subtle Brand Glow */}
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[var(--brand-500)]/10 rounded-full blur-[140px] pointer-events-none" />

                {/* Top: Logo */}
                <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[var(--r-md)] bg-[var(--brand-500)] text-white flex items-center justify-center shadow-xs">
                        <Zap size={18} className="fill-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg text-white tracking-tight leading-none block">LeadScout</span>
                        <span className="text-[10px] font-semibold text-[var(--brand-300)] tracking-wider uppercase">Central Hub</span>
                    </div>
                </div>

                {/* Center Content: Clean & Direct Message */}
                <div className="relative z-10 my-auto py-8 max-w-md space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Central Agency Hub
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Find Leads. Close Deals. <br />
                        <span className="text-[var(--brand-400)]">Manage Retainers.</span>
                    </h2>
                    
                    <p className="text-sm text-white/70 leading-relaxed font-normal">
                        The all-in-one platform for digital agencies to uncover underperforming local websites, generate client pitch reports, track sales pipelines, and monetize referral deals.
                    </p>

                    <div className="space-y-2 pt-2 text-xs text-white/80">
                        <div className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-400" />
                            <span>Automated Google Places lead scoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-400" />
                            <span>Shareable interactive web audit links</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-400" />
                            <span>Active Clients Hub & MRR tracking</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Interactive Smooth-Switch Card */}
                <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-white">
                            {isSignUp ? "Already have an account?" : "Ready to scale your agency?"}
                        </p>
                        <p className="text-[11px] text-white/50">
                            {isSignUp ? "Sign in to access your dashboard." : "Create an account in 30 seconds."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleMode(!isSignUp)}
                        className="btn btn-sm bg-white/10 hover:bg-white/15 text-white border border-white/20"
                    >
                        <span>{isSignUp ? "Sign In" : "Sign Up Free"}</span>
                        <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-500)]" />
        </div>
    );
}

// Default export wrapped in Suspense for useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginForm />
        </Suspense>
    );
}
