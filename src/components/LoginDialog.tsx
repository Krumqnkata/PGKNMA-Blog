import { useState, useEffect } from "react";
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

const LoginDialog = ({ open, onOpenChange, onOpenRegister }) => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 2. Стейт за токена
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Ресет при затваряне
  useEffect(() => {
    if (!open) {
      setTurnstileToken(null);
      setError("");
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
    } catch (err: any) {
      console.error("Неуспешно влизане:", err);
      setError(err?.message || "Грешно потребителско име или парола");
      // Ресетваме токена при грешка, за да се генерира нов за следващия опит
      setTurnstileToken(null);
    } finally {
      setLoading(false);
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
              siteKey="0x4AAAAAACoCbGkI6ACpCd1v" 
              onSuccess={(token) => {
                setTurnstileToken(token);
                setError("");
              }}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;