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
    ShieldCheck
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

            // Auto sign-in after signup
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
        <div className="min-h-screen w-full flex bg-[#fafbfc] overflow-x-hidden relative font-sans selection:bg-[#00bdaa] selection:text-white">
            
            {/* Panel A: Auth Form (Slides from Left to Right when switching to SignUp on desktop) */}
            <div 
                className={`w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 bg-white z-20 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSignUp 
                        ? "lg:translate-x-full lg:border-l lg:border-gray-100" 
                        : "lg:translate-x-0 lg:border-r lg:border-gray-100"
                }`}
            >
                {/* Brand Navigation (Back to Home removed as requested) */}
                <div className="flex items-center">
                    <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform active:scale-95">
                        <div className="w-9 h-9 bg-[#00bdaa] rounded-xl text-white flex items-center justify-center shadow-md shadow-[#00bdaa]/25 group-hover:shadow-[#00bdaa]/35 transition-all">
                            <Zap size={18} className="fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg text-gray-900 tracking-tight leading-none">LeadScout</span>
                            <span className="text-[10px] font-semibold text-[#00bdaa] tracking-wider uppercase mt-0.5">Intelligence Engine</span>
                        </div>
                    </Link>
                </div>

                {/* Form Body Container */}
                <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight transition-all">
                            {isSignUp ? "Create your account" : "Welcome back"}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                            {isSignUp 
                                ? "Start uncovering high-value local prospects in seconds." 
                                : "Enter your credentials to access your agency workspace."}
                        </p>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all active:scale-[0.99] text-xs flex items-center justify-center gap-2.5 shadow-xs hover:shadow-sm hover:bg-gray-50/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
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
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-[11px] uppercase">
                            <span className="px-3 bg-white text-gray-400 font-semibold tracking-wider">or with email</span>
                        </div>
                    </div>

                    {/* Feedback Banners */}
                    {message && (
                        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-start gap-2 shadow-xs">
                            <CheckCircle2 size={15} className="text-[#00bdaa] shrink-0 mt-0.5" />
                            <span className="font-medium">{message}</span>
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 shadow-xs">
                            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-bold text-gray-700 tracking-wide">Full Name</label>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3.5 text-gray-400 pointer-events-none" size={16} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Alex Mercer"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00bdaa] focus:ring-4 focus:ring-[#00bdaa]/10 outline-none transition-all placeholder:text-gray-400 text-xs text-gray-900 font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 tracking-wide">Work Email</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3.5 text-gray-400 pointer-events-none" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="alex@agency.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00bdaa] focus:ring-4 focus:ring-[#00bdaa]/10 outline-none transition-all placeholder:text-gray-400 text-xs text-gray-900 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-700 tracking-wide">Password</label>
                                {!isSignUp && (
                                    <a href="#" className="text-[11px] font-semibold text-[#00bdaa] hover:underline transition-colors">
                                        Forgot?
                                    </a>
                                )}
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3.5 text-gray-400 pointer-events-none" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
                                    className="w-full pl-10 pr-11 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00bdaa] focus:ring-4 focus:ring-[#00bdaa]/10 outline-none transition-all placeholder:text-gray-400 text-xs text-gray-900 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {!isSignUp && (
                            <div className="flex items-center justify-between pt-0.5">
                                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        defaultChecked 
                                        className="rounded border-gray-300 text-[#00bdaa] focus:ring-[#00bdaa] h-3.5 w-3.5" 
                                    />
                                    <span className="text-xs text-gray-500">Remember this device</span>
                                </label>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-[#00bdaa] hover:bg-[#00a897] text-white font-bold rounded-xl transition-all shadow-md shadow-[#00bdaa]/25 hover:shadow-lg hover:shadow-[#00bdaa]/35 active:scale-[0.99] text-xs flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                ) : (
                                    <>
                                        <span>{isSignUp ? "Create Free Account" : "Sign In to Dashboard"}</span>
                                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Quick Mode Toggle Link */}
                    <div className="pt-2 text-center">
                        <p className="text-xs text-gray-500">
                            {isSignUp ? (
                                <>
                                    Already have an account?{" "}
                                    <button 
                                        type="button"
                                        onClick={() => toggleMode(false)} 
                                        className="font-bold text-[#00bdaa] hover:underline transition-colors ml-1"
                                    >
                                        Sign in
                                    </button>
                                </>
                            ) : (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button 
                                        type="button"
                                        onClick={() => toggleMode(true)} 
                                        className="font-bold text-[#00bdaa] hover:underline transition-colors ml-1"
                                    >
                                        Sign up for free
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-[#00bdaa]" />
                        256-Bit Encrypted
                    </span>
                    <span>&copy; {new Date().getFullYear()} LeadScout Inc.</span>
                </div>
            </div>

            {/* Panel B: Minimalist Brand Showcase (Slides from Right to Left when switching to SignUp on desktop) */}
            <div 
                className={`hidden lg:flex lg:w-1/2 min-h-screen flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-[#061821] via-[#09252f] to-[#06151c] text-white relative overflow-hidden z-10 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSignUp 
                        ? "lg:-translate-x-full" 
                        : "lg:translate-x-0"
                }`}
            >
                {/* Ambient Glows with #00bdaa */}
                <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#00bdaa]/15 rounded-full blur-[130px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00bdaa]/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Top: Logo with #00bdaa */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#00bdaa] text-white flex items-center justify-center shadow-lg shadow-[#00bdaa]/30">
                        <Zap size={22} className="fill-white" />
                    </div>
                    <div>
                        <span className="font-extrabold text-xl text-white tracking-tight leading-none block">LeadScout</span>
                        <span className="text-[10px] font-semibold text-[#00bdaa] tracking-wider uppercase">Intelligence Engine</span>
                    </div>
                </div>

                {/* Center Content: Clean & Direct Message as Requested */}
                <div className="relative z-10 my-auto py-8 max-w-md space-y-5">
                    <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                        Automate Your <br />
                        <span className="text-[#00bdaa]">Agency Growth</span>
                    </h2>
                    
                    <p className="text-base text-gray-300/90 leading-relaxed font-normal">
                        LeadScout helps you find qualified leads, audit their digital presence, and generate personalized outreach in seconds.
                    </p>
                </div>

                {/* Bottom Interactive Smooth-Switch Card */}
                <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-white">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                            {isSignUp ? "Sign in to access your dashboard." : "Create one in under a minute."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleMode(!isSignUp)}
                        className="py-2.5 px-5 rounded-xl bg-[#00bdaa]/20 hover:bg-[#00bdaa]/30 border border-[#00bdaa]/40 text-[#00bdaa] hover:text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-md"
                    >
                        <span>{isSignUp ? "Sign In" : "Sign Up Free"}</span>
                        <ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
            <Loader2 className="h-8 w-8 animate-spin text-[#00bdaa]" />
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
