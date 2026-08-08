import { useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import AccountCredentialSettings from "@/components/account/AccountCredentialSettings";
import PersonalDataExportCard from "@/components/PersonalDataExportCard";
import ProfileAvatarSettings from "@/components/ProfileAvatarSettings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { deactivateMyAccount, linkGoogleAccount } from "@/lib/api";

const AccountSettings = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [googleLinkPassword, setGoogleLinkPassword] = useState("");
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const deactivateAccountMutation = useMutation({
    mutationFn: deactivateMyAccount,
    onSuccess: () => {
      toast({ title: "Профилът е деактивиран", description: "Профилът ви беше деактивиран. Ще бъдете отписани." });
      window.setTimeout(() => void logout(), 2000);
    },
    onError: (error: Error) => {
      toast({ title: "Грешка", description: error.message, variant: "destructive" });
      setIsDeactivateDialogOpen(false);
    },
  });

  const googleLinkMutation = useMutation({
    mutationFn: ({ credential, currentPassword }: { credential: string; currentPassword: string }) => linkGoogleAccount(credential, currentPassword),
    onSuccess: (data) => {
      setGoogleLinkPassword("");
      toast({ title: "Google е свързан", description: data.detail || "Вече можете да влизате и с Google." });
    },
    onError: (error: Error) => toast({ title: "Грешка", description: error.message, variant: "destructive" }),
  });

  const handleGoogleLink = (response: CredentialResponse) => {
    if (!response.credential) {
      toast({ title: "Грешка", description: "Не бе получен токен от Google.", variant: "destructive" });
      return;
    }
    googleLinkMutation.mutate({ credential: response.credential, currentPassword: googleLinkPassword });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <ProfileAvatarSettings />
      <AccountCredentialSettings />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-fit transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Вход с Google</CardTitle>
            <CardDescription>Свържете Google акаунт със същия имейл. При профили с парола се изисква текущата парола.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm space-y-2">
              <label htmlFor="google-link-password" className="text-sm font-medium">Текуща парола</label>
              <Input id="google-link-password" type="password" autoComplete="current-password" value={googleLinkPassword} onChange={(event) => setGoogleLinkPassword(event.target.value)} placeholder="••••••••" />
            </div>
            <div className="max-w-full overflow-hidden">
              {googleClientId ? (
                <GoogleLogin onSuccess={handleGoogleLink} onError={() => toast({ title: "Грешка", description: "Неуспешно удостоверяване с Google.", variant: "destructive" })} theme="filled_blue" shape="rectangular" text="continue_with" locale="bg" width="300" />
              ) : (
                <p className="text-sm text-muted-foreground">Входът с Google още не е конфигуриран.</p>
              )}
            </div>
            {googleLinkMutation.isPending && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Свързване с Google…</p>}
          </CardContent>
        </Card>

        <PersonalDataExportCard />
      </div>

      <Card className="border-destructive/50 bg-destructive/[0.03]">
        <CardHeader>
          <CardTitle>Деактивиране на акаунт</CardTitle>
          <CardDescription>Профилът ще бъде скрит и достъпът до него ще бъде спрян. За повторно активиране се свържете с администратор.</CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
            <AlertDialogTrigger asChild><Button variant="destructive" className="w-full sm:w-auto">Деактивирай акаунта</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Да деактивираме ли акаунта?</AlertDialogTitle>
                <AlertDialogDescription>Няма да можете да влизате, докато администратор не активира профила отново.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отказ</AlertDialogCancel>
                <AlertDialogAction onClick={() => deactivateAccountMutation.mutate()} disabled={deactivateAccountMutation.isPending}>
                  {deactivateAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Да, деактивирай
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
