import { useState } from "react";
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
import { useSettings } from "@/contexts/SettingsContext"; // New import
import { useToast } from "@/components/ui/use-toast"; // New import
import { Eye, EyeOff } from "lucide-react";

const LoginDialog = ({ open, onOpenChange, onOpenRegister }) => {
  const { login } = useAuth();
  const { settings } = useSettings(); // Use settings
  const { toast } = useToast(); // Use toast

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login({ username, password });
      onOpenChange(false); // Close dialog on success
    } catch (err: any) {
      console.error("Неуспешно влизане:", err);
      setError(err?.message || "Грешка при връзка със сървъра");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    onOpenChange(false); // Close login dialog
    onOpenRegister?.();   // Open register dialog
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
            />
          </div>

          <div className="relative flex flex-col gap-1">
            <label className="text-sm font-medium">Парола</label>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Вашата парола..."
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-7 h-7 w-7"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <p className="text-sm text-muted-foreground">
            Нямаш профил?{" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={handleRegisterClick} // Use new handler
            >
              Регистрирай се!
            </button>
          </p>

          <Button className="w-full mt-2" onClick={handleLogin} disabled={loading}>
            {loading ? "Влизане..." : "Влез"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
