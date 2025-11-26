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

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RegisterDialog = ({ open, onOpenChange }: RegisterDialogProps) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = () => {
    setError("");
    if (!email || !username || !password || !className) {
      setError("Моля, попълнете всички полета.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Успешна регистрация", description: `${username} • ${className}` });
      onOpenChange(false);
    }, 700);
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
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-username">Потребителско име</Label>
            <Input
              id="reg-username"
              placeholder="Вашето име..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-password">Парола</Label>
            <Input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="reg-class">Клас</Label>
            <Input
              id="reg-class"
              placeholder="10Б, 11А..."
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <Button className="w-full mt-1" onClick={handleRegister} disabled={isLoading}>
            {isLoading ? "Зареждане..." : "Регистрация"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
