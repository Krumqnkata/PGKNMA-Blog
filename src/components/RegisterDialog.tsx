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
import { Loader2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RegisterDialog = ({ open, onOpenChange }: RegisterDialogProps) => {
  const { register, loading: authLoading } = useAuth(); // Use useAuth hook
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // Add confirm password state
  const [firstName, setFirstName] = useState(""); // Add first name state
  const [lastName, setLastName] = useState("");   // Add last name state
  const [localLoading, setLocalLoading] = useState(false); // Local loading for this component
  const [error, setError] = useState("");

  const isLoading = authLoading || localLoading; // Combine auth loading with local loading

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

    setLocalLoading(true); // Start local loading
    try {
      const credentials: RegisterCredentials = {
        email,
        username,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
      };
      await register(credentials); // Call the register function from AuthContext
      toast({ title: "Успешна регистрация", description: `Потребител ${username} беше регистриран.` });
      onOpenChange(false); // Close dialog on successful registration
      // Optionally, you might want to automatically log in the user here
      // Or just clear the form
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
      setLocalLoading(false); // End local loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Регистрация</DialogTitle>
          <DialogDescription>
            Попълнете данните си, за да създадете профил.
          </DialogDescription>
        </DialogHeader>

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

          <div className="grid grid-cols-2 gap-4"> {/* Layout for first and last name */}
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
          </div> {/* End grid */}

          <TooltipProvider> {/* Tooltip for password field */}
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
          </TooltipProvider> {/* End Tooltip */}

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
