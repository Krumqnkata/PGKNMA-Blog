import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, UserRoundPen, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getPasswordsMatch, usePasswordValidation, useUsernameValidation } from "@/hooks/use-credential-validation";
import { useToast } from "@/hooks/use-toast";
import { changeUsername, updateUserPassword, type PasswordChangeData, type UsernameChangeData } from "@/lib/api";

const passwordSchema = z.object({
  current_password: z.string().min(1, "Текущата парола е задължителна."),
  new_password: z.string().min(1, "Новата парола е задължителна."),
  new_password_confirm: z.string(),
});

const usernameSchema = z.object({
  current_password: z.string().min(1, "Текущата парола е задължителна."),
  new_username: z.string().min(3, "Потребителското име трябва да е поне 3 символа."),
});

const AccountCredentialSettings = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", new_password_confirm: "" },
    mode: "onChange",
  });
  const usernameForm = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { current_password: "", new_username: "" },
    mode: "onChange",
  });

  const newUsername = usernameForm.watch("new_username");
  const newPassword = passwordForm.watch("new_password");
  const passwordConfirmation = passwordForm.watch("new_password_confirm");
  const usernameValidation = useUsernameValidation(newUsername, user?.username);
  const passwordValidation = usePasswordValidation(newPassword);
  const passwordsMatch = getPasswordsMatch(newPassword, passwordConfirmation);
  const canChangeUsername = usernameValidation.isValid === true && !usernameValidation.isChecking;
  const canChangePassword = passwordValidation.isValid === true && passwordsMatch === true && !passwordValidation.isChecking;

  const usernameMutation = useMutation({
    mutationFn: changeUsername,
    onSuccess: () => {
      toast({ title: "Успех!", description: "Потребителското ви име беше сменено. Моля, влезте отново." });
      usernameForm.reset();
      window.setTimeout(() => void logout(), 1000);
    },
    onError: (error: Error) => toast({ title: "Грешка", description: error.message, variant: "destructive" }),
  });
  const passwordMutation = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => {
      toast({ title: "Успех!", description: "Паролата ви беше сменена. Моля, влезте отново." });
      passwordForm.reset();
      window.setTimeout(() => void logout(), 1000);
    },
    onError: (error: Error) => toast({ title: "Грешка", description: error.message, variant: "destructive" }),
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="h-fit overflow-hidden transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-blue-500/10 to-transparent">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300"><UserRoundPen className="h-5 w-5" aria-hidden="true" /></div>
          <CardTitle>Смяна на потребителско име</CardTitle>
          <CardDescription>След успешна промяна ще бъдете отписани с цел сигурност.</CardDescription>
        </CardHeader>
        <Form {...usernameForm}>
          <form onSubmit={usernameForm.handleSubmit((values) => usernameMutation.mutate(values as UsernameChangeData))}>
            <CardContent className="space-y-4">
              <FormField control={usernameForm.control} name="new_username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ново потребителско име</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} autoComplete="username" aria-invalid={usernameValidation.isValid === false} className={usernameValidation.isValid === true ? "border-emerald-500 pr-10 ring-emerald-500/10" : "pr-10"} />
                      <ValidationIcon isChecking={usernameValidation.isChecking} isValid={usernameValidation.isValid} />
                    </div>
                  </FormControl>
                  <FormMessage>{usernameValidation.errors[0]}</FormMessage>
                </FormItem>
              )} />
              <FormField control={usernameForm.control} name="current_password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Текуща парола</FormLabel>
                  <FormControl><Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
            <CardFooter>
              <Button className="w-full sm:w-auto" type="submit" disabled={usernameMutation.isPending || !canChangeUsername}>
                {usernameMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Смени потребителското име
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="h-fit overflow-hidden transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><KeyRound className="h-5 w-5" aria-hidden="true" /></div>
          <CardTitle>Смяна на парола</CardTitle>
          <CardDescription>Изберете силна нова парола. След промяната ще бъдете отписани.</CardDescription>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values as PasswordChangeData))}>
            <CardContent className="space-y-4">
              <FormField control={passwordForm.control} name="current_password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Текуща парола</FormLabel>
                  <FormControl><Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="new_password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Нова парола</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showNewPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" aria-invalid={passwordValidation.isValid === false} className={passwordValidation.isValid === true ? "border-emerald-500 pr-20 ring-emerald-500/10" : "pr-20"} {...field} />
                      <ValidationIcon isChecking={passwordValidation.isChecking} isValid={passwordValidation.isValid} className="right-10" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => setShowNewPassword((visible) => !visible)} aria-label={showNewPassword ? "Скрий паролата" : "Покажи паролата"}>
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage>{passwordValidation.errors.length > 0 && <span>{passwordValidation.errors.join(" ")}</span>}</FormMessage>
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="new_password_confirm" render={({ field }) => (
                <FormItem>
                  <FormLabel>Потвърди новата парола</FormLabel>
                  <FormControl><Input type={showNewPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" aria-invalid={passwordsMatch === false} className={passwordsMatch === true ? "border-emerald-500 ring-emerald-500/10" : undefined} {...field} /></FormControl>
                  <FormMessage>{passwordsMatch === false ? "Паролите не съвпадат." : undefined}</FormMessage>
                </FormItem>
              )} />
            </CardContent>
            <CardFooter>
              <Button className="w-full sm:w-auto" type="submit" disabled={passwordMutation.isPending || !canChangePassword}>
                {passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Смени паролата
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

interface ValidationIconProps {
  isChecking: boolean;
  isValid: boolean | null;
  className?: string;
}

const ValidationIcon = ({ isChecking, isValid, className = "right-3" }: ValidationIconProps) => (
  <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${className}`} aria-hidden="true">
    {isChecking ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : isValid === true ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : isValid === false ? <XCircle className="h-4 w-4 text-destructive" /> : null}
  </span>
);

export default AccountCredentialSettings;
