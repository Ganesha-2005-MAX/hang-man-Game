import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, googleProvider, db } from "@/integrations/firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Hangman Game — Login" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const name = username || email.split("@")[0];
        await updateProfile(cred.user, {
          displayName: name,
        });
        await setDoc(doc(db, "profiles", cred.user.uid), {
          username: name,
          email: email,
          created_at: serverTimestamp(),
        });
        toast.success("Account created! Welcome.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = err.message;
      if (err.code === "auth/invalid-credential") {
        message = "Invalid email or password. If you don't have an account, please sign up first.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with this email. Please sign up.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again.";
      }
      toast.error(message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleAuthAction = (targetMode: "login" | "signup") => {
    if (mode !== targetMode) {
      setMode(targetMode);
    } else {
      submit();
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Ensure profile exists in Firestore
      await setDoc(
        doc(db, "profiles", result.user.uid),
        {
          username: result.user.displayName || result.user.email?.split("@")[0] || "player",
          email: result.user.email,
          updated_at: serverTimestamp(),
        },
        { merge: true },
      );

      toast.success("Signed in with Google!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Could not sign in with Google");
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="relative w-full max-w-sm">
        {/* Logo Section */}
        <div className="text-center mb-8 relative">
          <div className="relative inline-block mb-2">
            <div className="absolute -top-4 -left-8 -right-8 -bottom-4 bg-success/10 blur-2xl rounded-full -z-10" />
            <svg
              viewBox="0 0 100 80"
              className="w-24 h-20 text-primary mx-auto mb-2 drop-shadow-sm"
            >
              <line
                x1="35"
                y1="75"
                x2="65"
                y2="75"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="45"
                y1="75"
                x2="45"
                y2="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="45"
                y1="10"
                x2="65"
                y2="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line x1="65" y1="10" x2="65" y2="20" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="65" cy="28" r="5" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <line x1="65" y1="33" x2="65" y2="50" stroke="currentColor" strokeWidth="2.5" />
              <line x1="65" y1="38" x2="58" y2="45" stroke="currentColor" strokeWidth="2.5" />
              <line x1="65" y1="38" x2="72" y2="45" stroke="currentColor" strokeWidth="2.5" />
              <line x1="65" y1="50" x2="58" y2="60" stroke="currentColor" strokeWidth="2.5" />
              <line x1="65" y1="50" x2="72" y2="60" stroke="currentColor" strokeWidth="2.5" />
            </svg>
            <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_0_theme(colors.primary.DEFAULT)] [-webkit-text-stroke:1.5px_theme(colors.primary.DEFAULT)] uppercase">
              Hangman
            </h1>
            <div className="flex items-center justify-center gap-3 text-primary text-sm font-bold tracking-[0.4em] mt-1">
              <div className="h-px w-6 bg-current opacity-40" />
              GAME
              <div className="h-px w-6 bg-current opacity-40" />
            </div>
          </div>
        </div>

        {/* Card Section */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40 shadow-[0_20px_50px_oklch(0.5_0.15_145/0.15)]">
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold group-focus-within:scale-110 transition-transform">
                  @
                </span>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="pl-11 h-14 bg-white/90 border-transparent focus:border-primary/30 rounded-2xl shadow-sm"
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within:scale-110 transition-transform" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="pl-11 h-14 bg-white/90 border-transparent focus:border-primary/30 rounded-2xl shadow-sm"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within:scale-110 transition-transform" />
              <Input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="pl-11 pr-12 h-14 bg-white/90 border-transparent focus:border-primary/30 rounded-2xl shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                type="button"
                disabled={busy}
                className={cn(
                  "h-14 font-black text-lg rounded-2xl transition-all active:scale-95",
                  mode === "login"
                    ? "bg-primary text-white shadow-md hover:bg-primary/90"
                    : "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
                )}
                onClick={() => handleAuthAction("login")}
              >
                {busy && mode === "login" ? "..." : "Login"}
              </Button>
              <Button
                type="button"
                disabled={busy}
                className={cn(
                  "h-14 font-black text-lg rounded-2xl transition-all active:scale-95",
                  mode === "signup"
                    ? "bg-primary text-white shadow-md hover:bg-primary/90"
                    : "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
                )}
                onClick={() => handleAuthAction("signup")}
              >
                {busy && mode === "signup" ? "..." : "Sign Up"}
              </Button>
            </div>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20 -z-10" />
            <span className="bg-transparent px-4 text-xs font-black text-primary/60 tracking-widest uppercase">
              OR
            </span>
          </div>

          <Button
            type="button"
            onClick={signInWithGoogle}
            className="w-full h-14 bg-white/90 border border-input shadow-sm hover:bg-white text-foreground font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-primary/80 font-bold mt-8 drop-shadow-sm">
          Guess smart. Win fast. 🌿
        </p>
      </div>
    </div>
  );
}
