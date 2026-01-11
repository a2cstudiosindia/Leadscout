"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
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
                setError(signInError.message || "Failed to sign in");
                setIsLoading(false);
                return;
            }

            router.push(redirect);
        } catch (err) {
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
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
                setError(signUpError.message || "Failed to create account");
                setIsLoading(false);
                return;
            }

            // Auto sign-in after signup
            router.push(redirect);
        } catch (err) {
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Form */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-24 relative">
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="p-1.5 bg-teal-400 rounded-lg text-white">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <span className="font-bold text-lg text-gray-800 tracking-tight">LeadScout</span>
                </div>

                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-teal-400 tracking-tight">
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </h1>
                        <p className="text-gray-400 font-medium">
                            {isSignUp
                                ? "Enter your details to create an account"
                                : "Enter your email and password to sign in"}
                        </p>
                    </div>

                    {message && (
                        <div className="p-4 bg-teal-50 border border-teal-100 text-teal-700 text-sm rounded-xl flex items-center gap-2">
                            <span className="font-bold">Info:</span> {message}
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
                        {isSignUp && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full p-4 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="mail@example.com"
                                className="w-full p-4 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Min. 8 characters"
                                className="w-full p-4 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>

                        {!isSignUp && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                                    <input type="checkbox" className="rounded text-teal-400 focus:ring-teal-400 border-gray-300" />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="font-bold text-teal-400 hover:text-teal-500">Forgot Password?</a>
                            </div>
                        )}

                        <div className="pt-4 space-y-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-teal-400 text-white font-bold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-200 active:scale-95 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSignUp ? "Create Account" : "Sign In"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError("");
                                    setMessage("");
                                }}
                                className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 text-sm uppercase tracking-wider"
                            >
                                {isSignUp ? "Back to Sign In" : "Create Account"}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 font-medium">or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={async () => {
                            setIsGoogleLoading(true);
                            setError("");
                            try {
                                await signInWithGoogle(redirect);
                            } catch (err) {
                                setError("Failed to sign in with Google");
                                setIsGoogleLoading(false);
                            }
                        }}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                        Continue with Google
                    </button>

                    <p className="text-center text-gray-400 text-sm">
                        {isSignUp ? (
                            <>
                                Already have an account?{" "}
                                <span onClick={() => setIsSignUp(false)} className="font-bold text-teal-400 cursor-pointer">
                                    Sign in
                                </span>
                            </>
                        ) : (
                            <>
                                Don&apos;t have an account?{" "}
                                <span onClick={() => setIsSignUp(true)} className="font-bold text-teal-400 cursor-pointer">
                                    Sign up free
                                </span>
                            </>
                        )}
                    </p>
                </div>

                <div className="absolute bottom-8 left-0 w-full text-center text-xs text-gray-300">
                    &copy; 2026 LeadScout Inc.
                </div>
            </div>

            {/* Right Side - Image/Pattern */}
            <div className="hidden md:block w-1/2 bg-teal-400 relative overflow-hidden">
                {/* Abstract Shapes or Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center p-12">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-8 flex items-center justify-center">
                        <Zap size={48} fill="currentColor" />
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Automate Your Agency Growth</h2>
                    <p className="text-lg text-teal-50 opacity-90 max-w-md mx-auto leading-relaxed">
                        LeadScout helps you find qualified leads, audit their digital presence, and generate personalized outreach in seconds.
                    </p>
                </div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-900 opacity-10 rounded-full blur-3xl" />
            </div>
        </div>
    );
}

// Loading fallback for Suspense
function LoginLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
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

