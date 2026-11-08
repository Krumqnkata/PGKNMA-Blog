import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import type { CredentialResponse } from "@react-oauth/google";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ApiResponseError, resendVerificationEmail } from "@/lib/api";

interface LoginFormProps {
  /** Only where nothing else offers registration, such as the session-expired dialog. */
  registerHref?: string;
  /** Lets a surrounding dialog close when the visitor leaves for registration. */
  onRegisterClick?: () => void;
}

export function LoginForm({ registerHref, onRegisterClick }: LoginFormProps) {
  const { login, loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState("200");

  useEffect(() => {
    if (!googleContainerRef.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const safeWidth = Math.min(entry.contentRect.width, window.innerWidth - 48);
      setGoogleButtonWidth(Math.floor(Math.min(Math.max(safeWidth, 200), 400)).toString());
    });

    observer.observe(googleContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    setLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error("Не бе получен токен от Google.");
      await loginWithGoogle(credentialResponse.credential);
      toast({
        title: "Успешен вход",
        description: "Добре дошли в платформата!",
      });
    } catch (err: unknown) {
      console.error("Неуспешен вход с Google:", err);
      setError(err instanceof Error ? err.message : "Неуспешно влизане с Google профил");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!turnstileToken) {
      setError("Моля, потвърдете, че не сте робот.");
      return;
    }

    setLoading(true);
    try {
      await login({ username, password, captcha_answer: turnstileToken });
    } catch (err: unknown) {
      console.error("Неуспешно влизане:", err);
      setError(err instanceof Error ? err.message : "Грешно потребителско име или парола");
      setNeedsEmailVerification(err instanceof ApiResponseError && err.code === "email_not_verified");
      // A token works only once, so the next attempt needs a new one.
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationResend = async () => {
    if (!verificationEmail.trim()) {
      setResendMessage("Въведете имейл адреса от регистрацията.");
      return;
    }
    setResendLoading(true);
    setResendMessage("");
    try {
      const response = await resendVerificationEmail(verificationEmail.trim());
      setResendMessage(response.detail);
    } catch (err: unknown) {
      setResendMessage(err instanceof Error ? err.message : "Неуспешно повторно изпращане.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleLogin}>
      <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Защитен вход към ученическия портал</div>
      <div className="flex flex-col gap-1">
        <label htmlFor="login-username" className="text-sm font-semibold">Потребителско име</label>
        <Input
          id="login-username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Вашето име..."
          disabled={loading}
        />
      </div>

      <div className="relative flex flex-col gap-1">
        <label htmlFor="login-password" className="text-sm font-semibold">Парола</label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Вашата парола..."
            disabled={loading}
            aria-invalid={Boolean(error)}
            className="pr-11"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex max-w-full justify-center overflow-x-auto py-2">
        <Turnstile
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
          onSuccess={(token) => {
            setTurnstileToken(token);
            setError("");
          }}
          onExpire={() => setTurnstileToken(null)}
        />
      </div>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm font-semibold leading-relaxed text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{error}</div>}

      {needsEmailVerification && (
        <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-sm text-muted-foreground">Не получихте писмото?</p>
          <Input
            type="email"
            autoComplete="email"
            value={verificationEmail}
            onChange={(event) => setVerificationEmail(event.target.value)}
            placeholder="Имейлът от регистрацията"
            disabled={resendLoading}
          />
          <Button type="button" variant="outline" className="w-full" onClick={handleVerificationResend} disabled={resendLoading}>
            {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Изпрати линка отново
          </Button>
          {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading || !turnstileToken}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Влизане..." : "Влез"}
      </Button>

      <div className="relative my-1 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <span className="relative bg-card px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          или
        </span>
      </div>

      <div className="flex w-full max-w-full justify-center overflow-hidden" ref={googleContainerRef}>
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Грешка при влизане с Google акаунт.")}
          theme="filled_blue"
          shape="rectangular"
          text="signin_with"
          width={googleButtonWidth}
        />
      </div>

      {registerHref && (
        <p className="text-center text-sm text-muted-foreground">
          Нямаш профил?{" "}
          <Link to={registerHref} onClick={onRegisterClick} className="font-semibold text-primary hover:underline">Регистрирай се!</Link>
        </p>
      )}
    </form>
  );
}
