import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMutation } from '@tanstack/react-query';
import { updateUserPassword, deleteMyAccount, PasswordChangeData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const passwordSchema = z.object({
  current_password: z.string().min(1, "Текущата парола е задължителна."),
  new_password: z.string().min(8, "Новата парола трябва да е поне 8 символа."),
  new_password_confirm: z.string(),
}).refine(data => data.new_password === data.new_password_confirm, {
  message: "Паролите не съвпадат.",
  path: ["new_password_confirm"],
});

const AccountSettings: React.FC = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: () => {
      toast({
        title: "Успех!",
        description: "Паролата ви беше сменена успешно.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при смяната на паролата.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      toast({
        title: "Профилът е изтрит",
        description: "Вашият профил беше изтрит успешно. Ще бъдете отписани.",
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
    passwordMutation.mutate(values);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Смяна на парола</CardTitle>
          <CardDescription>Променете вашата парола тук. След успешна смяна, ще бъдете отписани от системата с цел сигурност.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPasswordSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Текуща парола</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нова парола</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="new_password_confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Потвърди новата парола</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Смени паролата
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Изтриване на акаунт</CardTitle>
          <CardDescription>
            Това действие е необратимо. Всички ваши данни, включително публикации, коментари и предложения, ще бъдат изтрити завинаги.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Изтрий акаунта си</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Наистина ли сте сигурни?</AlertDialogTitle>
                <AlertDialogDescription>
                  Това действие не може да бъде отменено. Вашият акаунт и цялото свързано съдържание ще бъдат изтрити перманентно.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отказ</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteAccountMutation.isPending}>
                  {deleteAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Да, изтрий акаунта ми
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
