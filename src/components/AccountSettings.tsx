import { useRef, useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";

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
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { deactivateMyAccount, linkGoogleAccount } from "@/lib/api";

const AccountSettings = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [googleLinkPassword, setGoogleLinkPassword] = useState("");
  const deactivateCancelRef = useRef<HTMLButtonElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const deactivateAccountMutation = useMutation({
    mutationFn: deactivateMyAccount,
    onSuccess: () => {
      setIsDeactivateDialogOpen(false);
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
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p>Промените по данните за вход могат да прекратят активната ви сесия. Това предпазва профила от неоторизиран достъп.</p>
      </div>
      <ProfileAvatarSettings />
      <AccountCredentialSettings />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="h-fit overflow-hidden transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg">
          <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle>Вход с Google</CardTitle>
            <CardDescription>Свържете Google акаунт със същия имейл. При профили с парола се изисква текущата парола.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm space-y-2.5">
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

      <Card className="overflow-hidden border-destructive/35 bg-destructive/[0.025]">
        <CardHeader className="border-b border-destructive/15 bg-destructive/5">
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />Деактивиране на акаунт</CardTitle>
          <CardDescription>Профилът ще бъде скрит и достъпът до него ще бъде спрян. За повторно активиране се свържете с администратор.</CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog open={isDeactivateDialogOpen} onOpenChange={(open) => {
            if (!deactivateAccountMutation.isPending) setIsDeactivateDialogOpen(open);
          }}>
            <AlertDialogTrigger asChild><Button variant="destructive" className="w-full sm:w-auto">Деактивирай акаунта</Button></AlertDialogTrigger>
            <AlertDialogContent
              aria-labelledby="deactivate-account-title"
              aria-describedby="deactivate-account-description"
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                deactivateCancelRef.current?.focus();
              }}
              onEscapeKeyDown={(event) => {
                if (deactivateAccountMutation.isPending) event.preventDefault();
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle id="deactivate-account-title">Да деактивираме ли акаунта?</AlertDialogTitle>
                <AlertDialogDescription id="deactivate-account-description">Няма да можете да влизате, докато администратор не активира профила отново.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel ref={deactivateCancelRef} disabled={deactivateAccountMutation.isPending}>Отказ</AlertDialogCancel>
                <AlertDialogAction aria-describedby="deactivate-account-description" onClick={(event) => { event.preventDefault(); deactivateAccountMutation.mutate(); }} disabled={deactivateAccountMutation.isPending}>
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
