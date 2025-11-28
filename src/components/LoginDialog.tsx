import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, LoginResponse } from "./api";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRegister?: () => void;
}

const LoginDialog = ({ open, onOpenChange, onOpenRegister }: LoginDialogProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setError("");
  setLoading(true);
  try {
    const result = await login(username, password);
    if (result.success) {
      navigate("/dashboard");
      onOpenChange(false);
    } else {
      setError(result.error || "Невалиден вход");
    }
  } catch {
    setError("Грешка при връзка със сървъра");
  } finally {
    setLoading(false);
  }
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
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Вашето име..." />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Парола</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Вашата парола..." />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <p className="text-sm text-muted-foreground">
            Нямаш профил?{" "}
            <button type="button" className="text-primary font-semibold hover:underline" onClick={() => { onOpenChange(false); onOpenRegister?.(); }}>
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
