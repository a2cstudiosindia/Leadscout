"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Zap, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { authClient, signInWithGoogle } from "@/lib/auth-client";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-zinc-800 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-foreground font-semibold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/60 focus-visible:border-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

interface AuthFormInnerProps {
  redirectUrl: string;
  onError: (err: string) => void;
  onSuccess: (msg: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

function SignInForm({ redirectUrl, onError, onSuccess, isLoading, setIsLoading }: AuthFormInnerProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    onError("");
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        onError(error.message || "Failed to sign in. Please verify your credentials.");
        setIsLoading(false);
        return;
      }
      onSuccess("Signed in successfully. Redirecting...");
      router.push(redirectUrl);
    } catch {
      onError("Authentication error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your credentials below to access your dashboard</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input id="signin-email" name="email" type="email" placeholder="you@agency.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="default" className="mt-2" disabled={isLoading}>
          {isLoading ? <><Loader2 className="animate-spin size-4" /> Signing in...</> : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({ redirectUrl, onError, onSuccess, isLoading, setIsLoading }: AuthFormInnerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      onError("Password must be at least 8 characters long.");
      return;
    }
    setIsLoading(true);
    onError("");
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0],
      });
      if (error) {
        onError(error.message || "Sign up failed. Please try again.");
        setIsLoading(false);
        return;
      }
      onSuccess("Account created successfully. Redirecting...");
      router.push(redirectUrl);
    } catch {
      onError("Registration error. Please retry.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">Start discovering high-ticket local leads in seconds</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input id="signup-name" name="name" type="text" placeholder="Alex Morgan" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" name="email" type="email" placeholder="alex@agency.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <PasswordInput name="password" label="Password (min 8 chars)" required autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="default" className="mt-2" disabled={isLoading}>
          {isLoading ? <><Loader2 className="animate-spin size-4" /> Creating account...</> : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  redirectUrl,
}: {
  isSignIn: boolean;
  onToggle: () => void;
  redirectUrl: string;
}) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle(redirectUrl);
    } catch {
      setError("Google authentication error.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-[380px] gap-4">
      {/* Brand Header */}
      <div className="flex justify-center mb-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Zap className="size-5 fill-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-foreground">LeadScout</span>
        </Link>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-zinc-800" />
          <span>{message}</span>
        </div>
      )}

      {isSignIn ? (
        <SignInForm
          redirectUrl={redirectUrl}
          onError={setError}
          onSuccess={setMessage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        <SignUpForm
          redirectUrl={redirectUrl}
          onError={setError}
          onSuccess={setMessage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      <div className="text-center text-sm text-muted-foreground mt-2">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError("");
            setMessage("");
            onToggle();
          }}
          className="font-semibold text-foreground underline-offset-4 hover:underline ml-1"
        >
          {isSignIn ? "Create one" : "Sign in"}
        </button>
      </div>

      <div className="relative my-2 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-3 text-muted-foreground uppercase tracking-wider font-semibold">Or continue with</span>
      </div>

      <Button
        variant="outline"
        type="button"
        onClick={handleGoogle}
        disabled={isGoogleLoading || isLoading}
        className="w-full h-11 font-medium"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin mr-2" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continue with Google
      </Button>

      <p className="text-center text-xs text-muted-foreground/80 mt-2">
        By continuing, you agree to LeadScout&apos;s{" "}
        <Link href="/privacy-policy" className="underline hover:text-foreground">
          Terms & Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export interface AuthContentProps {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

export interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
  defaultMode?: "signin" | "signup";
  redirectUrl?: string;
}

const defaultSignInContent: Required<AuthContentProps> = {
  image: {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    alt: "Modern architectural 3D minimalism"
  },
  quote: {
    text: "Automate your lead discovery. Close higher-value contracts with technical proof.",
    author: "LeadScout Platform"
  }
};

const defaultSignUpContent: Required<AuthContentProps> = {
  image: {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1964&auto=format&fit=crop",
    alt: "Sophisticated interior workspace design"
  },
  quote: {
    text: "Transform local web audits into predictable recurring agency revenue.",
    author: "LeadScout Engine"
  }
};

export function AuthUI({
  signInContent = {},
  signUpContent = {},
  defaultMode = "signin",
  redirectUrl = "/dashboard",
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(defaultMode === "signin");
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2 bg-background text-foreground selection:bg-zinc-800 selection:text-white">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex min-h-screen items-center justify-center p-6 md:p-12 lg:p-16">
        <AuthFormContainer
          isSignIn={isSignIn}
          onToggle={toggleForm}
          redirectUrl={redirectUrl}
        />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-8 pb-14 text-center">
          <blockquote className="max-w-md space-y-3">
            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-white drop-shadow-md">
              &ldquo;
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={45}
              />
              &rdquo;
            </p>
            <cite className="block text-sm font-medium text-zinc-300 not-italic tracking-wide">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export function DemoOne() {
  return <AuthUI />;
}

export { Button, Input, PasswordInput, Label, buttonVariants, labelVariants };
