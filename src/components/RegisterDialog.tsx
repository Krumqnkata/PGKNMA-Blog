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
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { RegisterCredentials } from '@/lib/api';
import { Loader2, Settings } from "lucide-react"; // Import Settings icon
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/SettingsContext"; // New import

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLogin: () => void;
}

const RegisterDialog = ({ open, onOpenChange, onOpenLogin }: RegisterDialogProps) => { // Updated signature
  const { register, loading: authLoading } = useAuth(); // Removed openLoginDialog
  const { settings } = useSettings(); // Use settings
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState("");

  const isLoading = authLoading || localLoading;

  const handleRegister = async () => {
    setError("");
    // Basic client-side validation
    if (!email || !username || !password || !password2 || !firstName || !lastName) {
      setError("Моля, попълнете всички задължителни полета.");
      return;
    }
    if (password !== password2) {
      setError("Паролите не съвпадат.");
      return;
    }
    // Minimal client-side password length check, backend handles full policy
    if (password.length < 8) { 
        setError("Паролата трябва да е поне 8 символа.");
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
      };
      await register(credentials);
      toast({ title: "Успешна регистрация", description: `Потребител ${username} беше регистриран.` });
      onOpenChange(false);
      setEmail('');
      setUsername('');
      setPassword('');
      setPassword2('');
      setFirstName('');
      setLastName('');
    } catch (err: any) {
      const errorMessage = err.message || "Неуспешна регистрация. Моля, опитайте отново.";
      setError(errorMessage);
      toast({
        title: "Грешка при регистрация",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Регистрация</DialogTitle>
          <DialogDescription>
            {settings?.enable_user_registration
              ? "Попълнете данните си, за да създадете профил."
              : "Регистрациите са временно спрени от администратор."}
          </DialogDescription>
        </DialogHeader>

        {settings?.enable_user_registration ? (
          <div className="flex flex-col gap-4 mt-2">
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
              <Input
                id="reg-username"
                placeholder="Вашето име..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
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

            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <Label htmlFor="reg-password">Парола</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-wrap">
                  <p><strong>Изисквания за парола:</strong></p>
                  <ul className="list-disc list-inside">
                    <li>Вашата парола не може да прилича на останалата Ви лична информация.</li>
                    <li>Вашата парола трябва да съдържа поне 8 символа.</li>
                    <li>Вашата парола не може да бъде често срещана.</li>
                    <li>Вашата парола не може да бъде само от цифри.</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="space-y-1">
              <Label htmlFor="reg-password2">Потвърди паролата</Label>
              <Input
                id="reg-password2"
                type="password"
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

            <Button className="w-full mt-1" onClick={handleRegister} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Регистрация..." : "Регистрация"}
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Вече имаш профил?{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() => { // Corrected syntax
                  onOpenChange(false); // Close register dialog
                  onOpenLogin?.();   // Open login dialog
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
                onClick={() => { // Corrected syntax
                  onOpenChange(false); // Close register dialog
                  onOpenLogin?.();   // Open login dialog
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
