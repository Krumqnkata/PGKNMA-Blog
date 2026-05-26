import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { RegisterCredentials, checkUsername, validatePassword } from '@/lib/api';
import { Loader2, Settings, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/SettingsContext";
// 1. Импорт на Turnstile
import { Turnstile } from '@marsidev/react-turnstile';
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLogin: () => void;
}

const RegisterDialog = ({ open, onOpenChange, onOpenLogin }: RegisterDialogProps) => {
  const { register, loginWithGoogle, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 2. Новият стейт за Cloudflare Токена
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

  // State for username validation
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');

  // State for password validation
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  const isLoading = authLoading || localLoading;

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    setLocalLoading(true);
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        onOpenChange(false);
        toast({
          title: "Успешна регистрация / вход",
          description: "Добре дошли в платформата!",
        });
      } else {
        throw new Error("Не бе получен токен от Google.");
      }
    } catch (err: unknown) {
      console.error("Неуспешна регистрация с Google:", err);
      const errMsg = err instanceof Error ? err.message : "Неуспешно влизане с Google профил";
      setError(errMsg);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Грешка при влизане с Google акаунт.");
  };

  // Ресет на токена при затваряне/отваряне на диалога
  useEffect(() => {
    if (!open) {
      setTurnstileToken(null);
      setError("");
    }
  }, [open]);

  // Debounced Username Check
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (username.trim().length < 3) {
        setIsUsernameAvailable(null);
        setUsernameError('');
        return;
      }

      // Проверка за латиница (английски букви), цифри и долна черта
      const isEnglishOnly = /^[a-zA-Z0-9_]+$/.test(username);
      if (!isEnglishOnly) {
        setIsUsernameAvailable(false);
        setUsernameError('Потребителското име може да съдържа само латински букви, цифри и долна черта.');
        return;
      }

      setIsCheckingUsername(true);
      setIsUsernameAvailable(null);
      setUsernameError('');

      try {
        const response = await checkUsername(username);
        if (response.is_available) {
          setIsUsernameAvailable(true);
          setUsernameError('');
        } else {
          setIsUsernameAvailable(false);
          setUsernameError('Потребителското име е заето.');
        }
      } catch (err) {
        setIsUsernameAvailable(false);
        setUsernameError('Грешка при проверката на името.');
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timerId = setTimeout(() => {
      checkUsernameAvailability();
    }, 500);

    return () => clearTimeout(timerId);
  }, [username]);

  // Debounced Password Check
  useEffect(() => {
    const validate = async () => {
        if (password.trim() === '') {
            setIsPasswordValid(null);
            setPasswordErrors([]);
            return;
        }

        setIsCheckingPassword(true);
        try {
            const response = await validatePassword(password);
            if (response.is_valid) {
                setIsPasswordValid(true);
                setPasswordErrors([]);
            } else {
                setIsPasswordValid(false);
                setPasswordErrors(response.errors || []);
            }
        } catch (err) {
            setIsPasswordValid(false);
            setPasswordErrors(['Грешка при валидация на паролата.']);
        } finally {
            setIsCheckingPassword(false);
        }
    };
    const timerId = setTimeout(validate, 500);

    return () => clearTimeout(timerId);
  }, [password]);

  // Check if passwords match
  useEffect(() => {
    if (password && password2) {
      setPasswordsMatch(password === password2);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, password2]);

  const handleRegister = async () => {
    setError("");
    if (isUsernameAvailable === false) {
      setError("Моля, изберете друго потребителско име.");
      return;
    }
     if (isPasswordValid === false) {
      setError("Паролата не отговаря на изискванията.");
      return;
    }
    if (passwordsMatch === false) {
      setError("Паролите не съвпадат.");
      return;
    }
    if (!email || !username || !password || !password2 || !firstName || !lastName) {
      setError("Моля, попълнете всички задължителни полета.");
      return;
    }
    
    // 3. Проверка дали Cloudflare е потвърдил човека
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
        // Пращаме токена в полето за captcha_answer
        captcha_answer: turnstileToken, 
      };

      await register(credentials);
      toast({ title: "Успешна регистрация", description: `Потребител ${username} беше регистриран. Сега можете да влезете в профила си.`, variant: "default" });
      onOpenChange(false);
      
      // Изчистване на формата
      setEmail('');
      setUsername('');
      setPassword('');
      setPassword2('');
      setFirstName('');
      setLastName('');
      setTurnstileToken(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Неуспешна регистрация. Моля, опитайте отново.";
      setError(errorMessage);
      toast({
        title: "Грешка при регистрация",
        description: errorMessage,
        variant: "destructive",
      });
      // При грешка е добре да ресетнем токена, за да се генерира нов
      setTurnstileToken(null);
    } finally {
      setLocalLoading(false);
    }
  };

  const canSubmit = !isLoading && isUsernameAvailable === true && isPasswordValid === true && passwordsMatch === true && turnstileToken !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Добавени max-h-[90dvh] и overflow-y-auto тук */}
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Регистрация</DialogTitle>
          <DialogDescription>
            {settings?.enable_user_registration
              ? "Попълнете данните си, за да създадете профил."
              : "Регистрациите са временно спрени от администратор."}
          </DialogDescription>
        </DialogHeader>

        {settings?.enable_user_registration ? (
          <div className="flex flex-col gap-4 mt-2 px-1">
            {/* Добавен px-1 тук */}
            <div className="space-y-1">
              <Label htmlFor="reg-email">Имейл</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="example@school.bg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-username">Потребителско име</Label>
              <div className="relative">
                <Input
                  id="reg-username"
                  placeholder="Вашето потребителско име..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className={usernameError ? "border-red-500" : (isUsernameAvailable === true ? "border-green-500" : "")}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {isUsernameAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {isUsernameAvailable === false && username.length > 2 && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="reg-firstName">Име</Label>
                <Input
                  id="reg-firstName"
                  placeholder="Вашето име"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-lastName">Фамилия</Label>
                <Input
                  id="reg-lastName"
                  placeholder="Вашата фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-password">Парола</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={isPasswordValid === false ? "border-red-500" : (isPasswordValid === true ? "border-green-500" : "")}
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
               {passwordErrors.length > 0 && (
                <ul className="text-xs text-red-500 mt-1 list-disc list-inside">
                  {passwordErrors.map((err, index) => <li key={index}>{err}</li>)}
                </ul>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-password2">Потвърди паролата</Label>
              <Input
                id="reg-password2"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={isLoading}
                className={passwordsMatch === false ? "border-red-500" : (passwordsMatch === true ? "border-green-500" : "")}
              />
              {passwordsMatch === false && <p className="text-xs text-red-500 mt-1">Паролите не съвпадат.</p>}
            </div>

            {/* 4. Секцията с Cloudflare Turnstile */}
            <div className="flex justify-center py-2">
              <Turnstile 
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""} 
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setError("");
                }}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setError("Грешка при проверката за сигурност.")}
              />
            </div>

            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

            <p className="text-xs text-muted-foreground text-center mb-2">
              С натискането на бутона „Регистрация“, Вие се съгласявате с нашите{" "}
              <Link to="/terms-of-service" target="_blank" className="text-primary hover:underline font-medium">
                Общи условия
              </Link>{" "}
              и{" "}
              <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">
                Политика за поверителност
              </Link>
              .
            </p>

            <Button className="w-full mt-1" onClick={handleRegister} disabled={!canSubmit}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Регистрация..." : "Регистрация"}
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
                text="signup_with"
                locale="bg"
                width={googleButtonWidth}
              />
            </div>
            
            <p className="text-sm text-muted-foreground text-center mt-2">
              Вече имаш профил?{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() => {
                  onOpenChange(false);
                  onOpenLogin?.();
                }}
              >
                Вход
              </button>
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Settings className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
                Регистрациите на нови потребители са временно изключени.
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Вече имаш профил?{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() => {
                  onOpenChange(false);
                  onOpenLogin?.();
                }}
              >
                Вход
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
