import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
// 1. Импорт на Turnstile
import { Turnstile } from '@marsidev/react-turnstile';
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { ApiResponseError, resendVerificationEmail } from "@/lib/api";

const LoginDialog = ({ open, onOpenChange, onOpenRegister }) => {
  const { login, loginWithGoogle } = useAuth();
  const { settings } = useSettings();
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
  
  // 2. Стейт за токена
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Responsive Google Button Logic
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState<string>("200");

  useEffect(() => {
    if (!googleContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Ensure it doesn't exceed window width with padding
        const safeWidth = Math.min(
          entry.contentRect.width, 
          window.innerWidth - 48
        );
        const width = Math.min(Math.max(safeWidth, 200), 400);
        setGoogleButtonWidth(Math.floor(width).toString());
      }
    });

    observer.observe(googleContainerRef.current);
    return () => observer.disconnect();
  }, [open]);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    setLoading(true);
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        onOpenChange(false);
        toast({
          title: "Успешен вход",
          description: "Добре дошли в платформата!",
        });
      } else {
        throw new Error("Не бе получен токен от Google.");
      }
    } catch (err: unknown) {
      console.error("Неуспешен вход с Google:", err);
      const errMsg = err instanceof Error ? err.message : "Неуспешно влизане с Google профил";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Грешка при влизане с Google акаунт.");
  };

  // Ресет при затваряне
  useEffect(() => {
    if (!open) {
      setTurnstileToken(null);
      setError("");
      setNeedsEmailVerification(false);
      setVerificationEmail("");
      setResendMessage("");
    }
  }, [open]);

  const handleLogin = async () => {
    setError("");
    
    // 3. Валидация за токен
    if (!turnstileToken) {
      setError("Моля, потвърдете, че не сте робот.");
      return;
    }

    setLoading(true);

    try {
      // Пращаме обекта с включен captcha_answer
      await login({ 
        username, 
        password, 
        captcha_answer: turnstileToken 
      });
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Неуспешно влизане:", err);
      const errMsg = err instanceof Error ? err.message : "Грешно потребителско име или парола";
      setError(errMsg);
      setNeedsEmailVerification(
        err instanceof ApiResponseError && err.code === "email_not_verified"
      );
      // Ресетваме токена при грешка, за да се генерира нов за следващия опит
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

  const handleRegisterClick = () => {
    onOpenChange(false);
    onOpenRegister?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Вход</DialogTitle>
          <DialogDescription>
            Въведете данните си, за да влезете в профила.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Потребителско име</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Вашето име..."
              disabled={loading}
            />
          </div>

          <div className="relative flex flex-col gap-1">
            <label className="text-sm font-medium">Парола</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Вашата парола..."
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* 4. Turnstile компонент */}
          <div className="flex justify-center py-2">
            <Turnstile 
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""} 
              onSuccess={(token) => {
                setTurnstileToken(token);
                setError("");
              }}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          {needsEmailVerification && (
            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm text-muted-foreground">Не получихте писмото?</p>
              <Input
                type="email"
                value={verificationEmail}
                onChange={(event) => setVerificationEmail(event.target.value)}
                placeholder="Имейлът от регистрацията"
                disabled={resendLoading}
              />
              <Button variant="outline" className="w-full" onClick={handleVerificationResend} disabled={resendLoading}>
                {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Изпрати линка отново
              </Button>
              {resendMessage && <p className="text-xs text-muted-foreground">{resendMessage}</p>}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Нямаш профил?{" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={handleRegisterClick}
            >
              Регистрирай се!
            </button>
          </p>

          <Button 
            className="w-full mt-2" 
            onClick={handleLogin} 
            disabled={loading || !turnstileToken}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Влизане..." : "Влез"}
          </Button>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <span className="relative bg-background px-3 text-xs text-muted-foreground uppercase">
              или
            </span>
          </div>

          <div className="flex justify-center w-full max-w-full overflow-hidden" ref={googleContainerRef}>
            <GoogleLogin
              key={googleButtonWidth}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              shape="rectangular"
              text="signin_with"
              locale="bg"
              width={googleButtonWidth}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
