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
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp, 
    Star, 
    ArrowRight,
    ShieldCheck,
    Globe,
    Check
} from "lucide-react";
import { authClient, signInWithGoogle } from "@/lib/auth-client";

// Wrap the main component to handle useSearchParams
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
                setError(signInError.message || "Failed to sign in. Please verify your credentials.");
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

            // Auto sign-in after signup
            router.push(redirect);
        } catch {
            setError("An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#fafbfc] font-sans selection:bg-teal-500 selection:text-white">
            {/* Left Side - Auth Form */}
            <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 relative bg-white border-r border-gray-100 shadow-sm">
                {/* Brand Navigation */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform active:scale-95">
                        <div className="w-9 h-9 bg-gradient-to-tr from-teal-500 to-teal-400 rounded-xl text-white flex items-center justify-center shadow-md shadow-teal-500/25 group-hover:shadow-teal-500/35 transition-all">
                            <Zap size={18} className="fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg text-gray-900 tracking-tight leading-none">LeadScout</span>
                            <span className="text-[10px] font-semibold text-teal-600 tracking-wider uppercase mt-0.5">Intelligence Engine</span>
                        </div>
                    </Link>

                    <Link 
                        href="/" 
                        className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors hidden sm:block"
                    >
                        Back to Home →
                    </Link>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-7">
                    {/* Segmented Auth Mode Switch */}
                    <div className="bg-gray-100/80 p-1 rounded-xl flex items-center text-xs font-bold border border-gray-200/60 shadow-inner">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(false);
                                setError("");
                                setMessage("");
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
                                !isSignUp 
                                    ? "bg-white text-gray-900 shadow-sm shadow-gray-300/40" 
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(true);
                                setError("");
                                setMessage("");
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg transition-all text-center ${
                                isSignUp 
                                    ? "bg-white text-gray-900 shadow-sm shadow-gray-300/40" 
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Titles */}
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {isSignUp ? "Get started free" : "Welcome back"}
                        </h1>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {isSignUp
                                ? "Start scouting high-value leads and audits with zero friction."
                                : "Enter your credentials to access your agency dashboard."}
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={async () => {
                            setIsGoogleLoading(true);
                            setError("");
                            try {
                                await signInWithGoogle(redirect);
                            } catch {
                                setError("Failed to authenticate with Google. Please try again.");
                                setIsGoogleLoading(false);
                            }
                        }}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all active:scale-[0.99] text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-sm hover:bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : (
                            <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
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
                        <span className="text-gray-700 font-medium">Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-3 bg-white text-gray-400 font-semibold tracking-wider">or with email</span>
                        </div>
                    </div>

                    {/* Feedback Banners */}
                    {message && (
                        <div className="p-3.5 bg-teal-50/80 border border-teal-200/60 text-teal-800 text-xs rounded-xl flex items-start gap-2.5 shadow-xs animate-in fade-in">
                            <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" />
                            <span className="font-medium leading-relaxed">{message}</span>
                        </div>
                    )}
                    {error && (
                        <div className="p-3.5 bg-red-50/80 border border-red-200/60 text-red-700 text-xs rounded-xl flex items-start gap-2.5 shadow-xs animate-in fade-in">
                            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <span className="font-medium leading-relaxed">{error}</span>
                        </div>
                    )}

                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 tracking-wide">Your Name</label>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3.5 text-gray-400 pointer-events-none" size={17} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Sarah Connor"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 tracking-wide">Work Email</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3.5 text-gray-400 pointer-events-none" size={17} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="sarah@agency.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700 tracking-wide">Password</label>
                                {!isSignUp && (
                                    <a href="#" className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                                        Forgot?
                                    </a>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3.5 text-gray-400 pointer-events-none" size={17} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder={isSignUp ? "Min. 8 characters" : "••••••••"}
                                    className="w-full pl-10 pr-11 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-gray-400 text-sm text-gray-900 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {!isSignUp && (
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        defaultChecked 
                                        className="rounded border-gray-300 text-teal-500 focus:ring-teal-400 h-4 w-4" 
                                    />
                                    <span className="text-xs font-medium text-gray-500">Remember this device for 30 days</span>
                                </label>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/35 active:scale-[0.99] text-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                ) : (
                                    <>
                                        <span>{isSignUp ? "Create Free Account" : "Sign In to Dashboard"}</span>
                                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Toggle */}
                    <div className="pt-2 text-center">
                        <p className="text-xs text-gray-500">
                            {isSignUp ? (
                                <>
                                    Already have an account?{" "}
                                    <button 
                                        type="button"
                                        onClick={() => setIsSignUp(false)} 
                                        className="font-bold text-teal-600 hover:text-teal-700 transition-colors ml-1"
                                    >
                                        Sign in
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button 
                                        type="button"
                                        onClick={() => setIsSignUp(true)} 
                                        className="font-bold text-teal-600 hover:text-teal-700 transition-colors ml-1"
                                    >
                                        Sign up for free
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Bottom Trust & Copyright */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-teal-500" />
                        256-Bit Encrypted
                    </span>
                    <span>&copy; {new Date().getFullYear()} LeadScout Inc.</span>
                </div>
            </div>

            {/* Right Side - Interactive Showcase Panel (The 100/100 Visual) */}
            <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-gradient-to-br from-[#0c1f28] via-[#0d2a33] to-[#0a1820] relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-white">
                {/* Background Ambient Glows & Grid Pattern */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-teal-300 text-xs font-semibold">
                        <Sparkles size={13} className="text-teal-300 animate-pulse" />
                        <span>AI-Powered Local Lead Scouting</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-teal-200/70">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        Live Data Feed
                    </div>
                </div>

                {/* Center Showcase: Floating Glassmorphism Lead Discovery Widget */}
                <div className="relative z-10 my-auto py-6 max-w-lg mx-auto w-full">
                    {/* Live Lead Card */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-teal-400/40 hover:shadow-teal-500/10 group">
                        {/* Top Ticker */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">Qualified Prospect</span>
                            </div>
                            <span className="text-gray-400 text-[11px]">Discovered just now</span>
                        </div>

                        {/* Business Summary */}
                        <div className="mt-4 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                                    Horizon Dental & Orthodontics
                                </h3>
                                <p className="text-xs text-gray-300 flex items-center gap-1.5 mt-1">
                                    <Globe size={12} className="text-teal-400" />
                                    horizondental.com • Austin, TX
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                                    <Star size={11} fill="currentColor" /> 4.9 (142)
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1">Google Maps</span>
                            </div>
                        </div>

                        {/* Audit Indicators */}
                        <div className="mt-5 space-y-2.5">
                            <div className="flex items-center justify-between text-xs text-gray-300">
                                <span className="font-medium">Lead Conversion Score</span>
                                <span className="font-bold text-teal-300">94 / 100 • High Priority</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full w-[94%]" />
                            </div>
                        </div>

                        {/* Audit Tags */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-1">
                                ⚠ No Mobile SSL
                            </span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                                ⚡ PageSpeed: 42/100
                            </span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center gap-1">
                                ✓ Verified Owner Found
                            </span>
                        </div>

                        {/* AI Generated Pitch Snippet */}
                        <div className="mt-4 p-3 rounded-xl bg-black/25 border border-white/5 text-xs text-gray-300">
                            <div className="flex items-center gap-1.5 text-teal-400 font-bold mb-1 text-[11px]">
                                <Sparkles size={12} /> AI Personalized Outreach Drafted:
                            </div>
                            <p className="line-clamp-2 text-gray-300/90 italic font-mono text-[11px] leading-relaxed">
                                &ldquo;Hi Dr. Evans, noticed your mobile site loads in 4.2s causing ~30% bounce on booking requests. Here is our 1-click audit...&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Mini Floating Metric Badge */}
                    <div className="mt-4 -mb-2 flex items-center justify-between gap-4 bg-teal-950/60 backdrop-blur-md border border-teal-500/30 rounded-xl px-4 py-2.5 text-xs shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                                <TrendingUp size={15} />
                            </div>
                            <div>
                                <div className="font-bold text-white">+5,280 Leads Generated</div>
                                <div className="text-[10px] text-teal-300/70">Across agencies this week</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                ↑ 38% Faster Close
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Social Proof & Features */}
                <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-300">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <img className="w-7 h-7 rounded-full border-2 border-[#0d2a33]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" alt="Avatar" />
                            <img className="w-7 h-7 rounded-full border-2 border-[#0d2a33]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" alt="Avatar" />
                            <img className="w-7 h-7 rounded-full border-2 border-[#0d2a33]" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=64&h=64&fit=crop&crop=faces" alt="Avatar" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={11} fill="currentColor" />
                                ))}
                                <span className="text-white font-bold ml-1">4.9/5</span>
                            </div>
                            <span className="text-[11px] text-gray-400">Trusted by 1,200+ marketing agencies</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400 text-[11px]">
                        <span className="flex items-center gap-1">
                            <Check size={12} className="text-teal-400" /> No credit card required
                        </span>
                        <span className="flex items-center gap-1">
                            <Check size={12} className="text-teal-400" /> Cancel anytime
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
    );
}

// Default export with Suspense to handle useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginForm />
        </Suspense>
    );
}

