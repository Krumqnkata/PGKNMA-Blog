import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

type RegisterForm = {
  email: string;
  username: string;
  password: string;
  className: string;
};

const Register = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    username: "",
    password: "",
    className: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Регистрация изпратена", description: `${formData.username} • ${formData.email}` });
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-white bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_35%),_radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.04),_transparent_35%),_#0b1b1d]">
      <Header />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border border-border/60 bg-[hsl(var(--background))]/92 shadow-2xl">
          <CardHeader className="text-left">
            <CardTitle className="text-2xl text-[hsl(var(--header-foreground))]">Регистрация</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Попълнете данните си, за да създадете профил в портала.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Имейл</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@school.bg"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Потребителско име</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Вашето име..."
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Парола</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="className">Клас</Label>
                <Input
                  id="className"
                  name="className"
                  placeholder="10Б, 11А..."
                  value={formData.className}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50/80 p-2 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90"
              >
                {isLoading ? "Зареждане..." : "Регистрация"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Вече имаш профил?{" "}
                <a href="/login" className="text-primary font-semibold hover:underline">
                  Вход
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Register;
