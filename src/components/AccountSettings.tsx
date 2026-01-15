import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation } from '@tanstack/react-query';
import { updateUserPassword, deactivateMyAccount, PasswordChangeData, changeUsername, UsernameChangeData, checkUsername, validatePassword } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.object({
  current_password: z.string().min(1, "Текущата парола е задължителна."),
  new_password: z.string().min(1, "Новата парола е задължителна."),
  new_password_confirm: z.string(),
});

const usernameSchema = z.object({
    current_password: z.string().min(1, "Текущата парола е задължителна."),
    new_username: z.string().min(3, "Потребителското име трябва да е поне 3 символа."),
});

const AccountSettings: React.FC = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State for username validation
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');

  // State for password validation
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirm: '',
    },
    mode: 'onChange',
  });

  const usernameForm = useForm<z.infer<typeof usernameSchema>>({
      resolver: zodResolver(usernameSchema),
      defaultValues: {
          current_password: '',
          new_username: '',
      },
      mode: 'onChange',
  });

  const newUsernameValue = usernameForm.watch('new_username');
  const newPasswordValue = passwordForm.watch('new_password');
  const newPasswordConfirmValue = passwordForm.watch('new_password_confirm');


  // Debounced Username Check
  useEffect(() => {
    if (!newUsernameValue) return;
    if (user && newUsernameValue.toLowerCase() === user.username.toLowerCase()) {
        setIsUsernameAvailable(true);
        setUsernameError('');
        return;
    }

    const checkUsernameAvailability = async () => {
      if (newUsernameValue.trim().length < 3) {
        setIsUsernameAvailable(null);
        setUsernameError('');
        return;
      }

      setIsCheckingUsername(true);
      setIsUsernameAvailable(null);
      setUsernameError('');

      try {
        const response = await checkUsername(newUsernameValue);
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

    return () => {
      clearTimeout(timerId);
    };
  }, [newUsernameValue, user]);


    // Debounced Password Check
    useEffect(() => {
        if (!newPasswordValue) return;
        const validate = async () => {
            if (newPasswordValue.trim() === '') {
                setIsPasswordValid(null);
                setPasswordErrors([]);
                return;
            }

            setIsCheckingPassword(true);
            try {
                const response = await validatePassword(newPasswordValue);
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
    }, [newPasswordValue]);

    // Check if passwords match
    useEffect(() => {
        if (newPasswordValue && newPasswordConfirmValue) {
            setPasswordsMatch(newPasswordValue === newPasswordConfirmValue);
        } else if (newPasswordConfirmValue) { // Only show error if confirm is touched
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(null);
        }
    }, [newPasswordValue, newPasswordConfirmValue]);


  const passwordMutation = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => {
      toast({
        title: "Успех!",
        description: "Паролата ви беше сменена успешно. Моля, влезте отново.",
      });
      passwordForm.reset();
      setTimeout(() => logout(), 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при смяната на паролата.",
        variant: "destructive",
      });
    },
  });

  const usernameMutation = useMutation({
      mutationFn: changeUsername,
      onSuccess: () => {
          toast({
              title: "Успех!",
              description: "Потребителското ви име беше сменено успешно. Моля, влезте отново.",
          });
          usernameForm.reset();
          setTimeout(() => logout(), 1000);
      },
      onError: (error: Error) => {
          toast({
              title: "Грешка",
              description: error.message || "Възникна грешка при смяната на потребителското име.",
              variant: "destructive",
          });
      },
  });

  const deactivateAccountMutation = useMutation({
    mutationFn: deactivateMyAccount,
    onSuccess: () => {
      toast({
        title: "Профилът е деактивиран",
        description: "Вашият профил беше деактивиран успешно. Ще бъдете отписани.",
      });
      setTimeout(() => {
        logout();
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването на профила.",
        variant: "destructive",
      });
      setIsAlertOpen(false);
    },
  });

  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    if (canChangePassword) {
        passwordMutation.mutate(values);
    } else {
        toast({
            title: "Грешка",
            description: "Моля, поправете грешките във формата.",
            variant: "destructive"
        });
    }
  };

  const onUsernameSubmit = (values: z.infer<typeof usernameSchema>) => {
      if (canChangeUsername) {
        usernameMutation.mutate(values);
      } else {
        toast({
            title: "Грешка",
            description: "Моля, изберете налично потребителско име.",
            variant: "destructive"
        });
      }
  };

  const handleDeactivateAccount = () => {
    deactivateAccountMutation.mutate();
  };

  const canChangeUsername = isUsernameAvailable === true && !isCheckingUsername;
  const canChangePassword = isPasswordValid === true && passwordsMatch === true && !isCheckingPassword;

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Смяна на потребителско име</CardTitle>
                <CardDescription>Променете вашето потребителско име тук. Ще трябва да въведете текущата си парола, за да потвърдите промяната. След успешна смяна, ще бъдете отписани.</CardDescription>
            </CardHeader>
            <Form {...usernameForm}>
                <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={usernameForm.control}
                            name="new_username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ново потребителско име</FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                            <Input
                                                type="text"
                                                {...field}
                                                className={usernameError ? "border-red-500" : (isUsernameAvailable === true ? "border-green-500" : "")}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                                {isUsernameAvailable === true && newUsernameValue.length > 2 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                {isUsernameAvailable === false && newUsernameValue.length > 2 && <XCircle className="h-4 w-4 text-red-500" />}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage>
                                      {usernameError && <span className="text-red-500">{usernameError}</span>}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={usernameForm.control}
                            name="current_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Текуща парола</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} placeholder="••••••••" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={usernameMutation.isPending || !canChangeUsername}>
                            {usernameMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Смени потребителско име
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Смяна на парола</CardTitle>
          <CardDescription>Променете вашата парола тук. След успешна смяна, ще бъдете отписани от системата с цел сигурност.</CardDescription>
        </CardHeader>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Текуща парола</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder="••••••••" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нова парола</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                {...field}
                                placeholder="••••••••"
                                className={isPasswordValid === false && field.value ? "border-red-500" : (isPasswordValid === true ? "border-green-500" : "")}
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
                    </FormControl>
                    <FormMessage>
                        {passwordErrors.length > 0 && (
                            <ul className="text-xs text-red-500 mt-1 list-disc list-inside">
                                {passwordErrors.map((err, index) => <li key={index}>{err}</li>)}
                            </ul>
                        )}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="new_password_confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Потвърди новата парола</FormLabel>
                    <FormControl>
                        <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            placeholder="••••••••"
                            className={passwordsMatch === false && field.value ? "border-red-500" : (passwordsMatch === true && field.value ? "border-green-500" : "")}
                        />
                    </FormControl>
                     <FormMessage>
                        {passwordsMatch === false && newPasswordConfirmValue && <span className="text-red-500">Паролите не съвпадат.</span>}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={passwordMutation.isPending || !canChangePassword}>
                {passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Смени паролата
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Деактивиране на акаунт</CardTitle>
          <CardDescription>
            Можете да деактивирате акаунта си, вместо да го изтриете. Вашият акаунт ще бъде скрит и няма да можете да влизате в него. Можете да го активирате отново по всяко време, като се свържете с администратор.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Деактивирай акаунта си</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Наистина ли искате да деактивирате акаунта си?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вашият акаунт ще бъде деактивиран и няма да имате достъп до него. Можете да го активирате отново по-късно.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отказ</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeactivateAccount} disabled={deactivateAccountMutation.isPending}>
                  {deactivateAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Да, деактивирай акаунта ми
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSettings;
