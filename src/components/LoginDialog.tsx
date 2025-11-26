import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    // Demo login validation (replace with your logic)
    if (username === "admin" && password === "1234") {
      navigate("/dashboard");
      onOpenChange(false);
    } else {
      setError("Невалидни данни за вход.");
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
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Вашето име..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Парола</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Вашата парола..."
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium">{error}</div>
          )}
          <p>Нямаш профил? <a href="/register">Регистрирай се!</a></p>
          <Button className="w-full mt-2" onClick={handleLogin}>
            Влез
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
