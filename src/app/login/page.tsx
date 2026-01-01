import { login, signup } from "./actions";
import { Zap } from "lucide-react";

export default async function LoginPage({
    searchParams
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    // Await searchParams before access
    const { message, error } = await searchParams;

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
                        <h1 className="text-4xl font-bold text-teal-400 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-400 font-medium">Enter your email and password to sign in</p>
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

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="mail@example.com"
                                className="w-full p-4 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Min. 8 characters"
                                className="w-full p-4 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                                <input type="checkbox" className="rounded text-teal-400 focus:ring-teal-400 border-gray-300" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="font-bold text-teal-400 hover:text-teal-500">Forgot Password?</a>
                        </div>

                        <div className="pt-4 space-y-4">
                            <button formAction={login} className="w-full py-4 bg-teal-400 text-white font-bold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-200 active:scale-95 text-sm uppercase tracking-wider">
                                Sign In
                            </button>
                            <button formAction={signup} className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 text-sm uppercase tracking-wider">
                                Create Account
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-gray-400 text-sm">
                        Don't have an account? <span className="font-bold text-teal-400 cursor-pointer">Sign up free</span>
                    </p>
                </div>

                <div className="absolute bottom-8 left-0 w-full text-center text-xs text-gray-300">
                    &copy; 2024 LeadScout Inc.
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
