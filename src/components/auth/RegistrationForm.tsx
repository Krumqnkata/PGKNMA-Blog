import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Turnstile } from "@marsidev/react-turnstile";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPasswordsMatch,
  usePasswordValidation,
  useUsernameValidation,
} from "@/hooks/use-credential-validation";
import type { RegisterCredentials, RegistrationResponse } from "@/lib/api";

interface RegistrationFormProps {
  onClose: () => void;
  onOpenLogin: () => void;
  onRegistered: (result: RegistrationResponse) => void;
}

export function RegistrationForm({
  onClose,
  onOpenLogin,
  onRegistered,
}: RegistrationFormProps) {
  const { register, loginWithGoogle, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState("200");

  const usernameValidation = useUsernameValidation(username);
  const passwordValidation = usePasswordValidation(password);
  const passwordsMatch = getPasswordsMatch(password, password2);
  const isLoading = authLoading || localLoading;
  const canSubmit =
    !isLoading &&
    usernameValidation.isValid === true &&
    passwordValidation.isValid === true &&
    passwordsMatch === true &&
    turnstileToken !== null;

  useEffect(() => {
    const container = googleContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const safeWidth = Math.min(entry.contentRect.width, window.innerWidth - 48);
      setGoogleButtonWidth(Math.floor(Math.min(Math.max(safeWidth, 200), 400)).toString());
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const openLogin = () => {
    onClose();
    onOpenLogin();
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    setError("");
    setLocalLoading(true);
    try {
      if (!response.credential) throw new Error("Не бе получен токен от Google.");
      await loginWithGoogle(response.credential);
      onClose();
      toast({
        title: "Успешна регистрация / вход",
        description: "Добре дошли в платформата!",
      });
    } catch (caughtError: unknown) {
      console.error("Неуспешна регистрация с Google:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Неуспешно влизане с Google профил",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !username || !password || !password2 || !firstName || !lastName) {
      setError("Моля, попълнете всички задължителни полета.");
      return;
    }
    if (usernameValidation.isValid !== true) {
      setError("Моля, изберете друго потребителско име.");
      return;
    }
    if (passwordValidation.isValid !== true) {
      setError("Паролата не отговаря на изискванията.");
      return;
    }
    if (passwordsMatch !== true) {
      setError("Паролите не съвпадат.");
      return;
    }
    if (!turnstileToken) {
      setError("Моля, потвърдете, че не сте робот.");
      return;
    }

    setLocalLoading(true);
    try {
      const credentials: RegisterCredentials = {
        email,
        username,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        captcha_answer: turnstileToken,
      };
      const result = await register(credentials);
      onRegistered(result);
      toast({
        title: result.verification_required ? "Проверете имейла си" : "Профилът е готов",
        description: result.detail,
      });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Неуспешна регистрация. Моля, опитайте отново.";
      setError(message);
      setTurnstileToken(null);
      toast({ title: "Грешка при регистрация", description: message, variant: "destructive" });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form className="mt-2 flex flex-col gap-4 px-1" onSubmit={handleRegister}>
      <div className="space-y-1">
        <Label htmlFor="reg-email">Имейл</Label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="example@school.bg"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="reg-username">Потребителско име</Label>
        <div className="relative">
          <Input
            id="reg-username"
            autoComplete="username"
            placeholder="Вашето потребителско име..."
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isLoading}
            className={
              usernameValidation.errors.length
                ? "border-destructive pr-10"
                : usernameValidation.isValid === true
                  ? "border-green-500 pr-10"
                  : "pr-10"
            }
            required
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {usernameValidation.isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {usernameValidation.isValid === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {usernameValidation.isValid === false && username.length > 2 && <XCircle className="h-4 w-4 text-destructive" />}
          </div>
        </div>
        {usernameValidation.errors[0] && (
          <p className="mt-1 text-xs text-destructive">{usernameValidation.errors[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="reg-firstName">Име</Label>
          <Input id="reg-firstName" autoComplete="given-name" placeholder="Вашето име" value={firstName} onChange={(event) => setFirstName(event.target.value)} disabled={isLoading} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="reg-lastName">Фамилия</Label>
          <Input id="reg-lastName" autoComplete="family-name" placeholder="Вашата фамилия" value={lastName} onChange={(event) => setLastName(event.target.value)} disabled={isLoading} required />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="reg-password">Парола</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
            className={`${passwordValidation.isValid === false ? "border-destructive" : passwordValidation.isValid === true ? "border-green-500" : ""} pr-10`}
            required
          />
          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {passwordValidation.errors.length > 0 && (
          <ul className="mt-1 list-inside list-disc text-xs text-destructive">
            {passwordValidation.errors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="reg-password2">Потвърди паролата</Label>
        <Input id="reg-password2" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={password2} onChange={(event) => setPassword2(event.target.value)} disabled={isLoading} className={passwordsMatch === false ? "border-destructive" : passwordsMatch === true ? "border-green-500" : ""} required />
        {passwordsMatch === false && <p className="mt-1 text-xs text-destructive">Паролите не съвпадат.</p>}
      </div>

      <div className="flex max-w-full justify-center overflow-x-auto py-2">
        <Turnstile
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
          onSuccess={(token) => { setTurnstileToken(token); setError(""); }}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setError("Грешка при проверката за сигурност.")}
        />
      </div>

      {error && <div role="alert" className="text-sm font-medium text-destructive">{error}</div>}

      <p className="mb-2 text-center text-xs text-muted-foreground">
        С натискането на бутона „Регистрация“, Вие се съгласявате с нашите{" "}
        <Link to="/terms-of-service" target="_blank" className="font-medium text-primary hover:underline">Общи условия</Link>{" "}
        и{" "}<Link to="/privacy-policy" target="_blank" className="font-medium text-primary hover:underline">Политика за поверителност</Link>.
      </p>

      <Button className="mt-1 w-full" type="submit" disabled={!canSubmit}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Регистрация..." : "Регистрация"}
      </Button>

      <div className="relative my-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
        <span className="relative bg-background px-3 text-xs uppercase text-muted-foreground">или</span>
      </div>

      <div className="flex w-full max-w-full justify-center overflow-hidden" ref={googleContainerRef}>
        <GoogleLogin key={googleButtonWidth} onSuccess={handleGoogleSuccess} onError={() => setError("Грешка при влизане с Google акаунт.")} theme="filled_blue" shape="rectangular" text="signup_with" locale="bg" width={googleButtonWidth} />
      </div>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        Вече имаш профил?{" "}
        <button type="button" className="font-semibold text-primary hover:underline" onClick={openLogin}>Вход</button>
      </p>
    </form>
  );
}
