import { BellRing } from 'lucide-react';

import BrowserPushSettings from '@/components/BrowserPushSettings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function DevicePushSettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="h-auto justify-start gap-2 p-0 text-sm text-[hsl(var(--footer-foreground))]/80 hover:text-primary"
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Известия на устройството
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(90vh,48rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Известия на това устройство</DialogTitle>
          <DialogDescription>
            Включете известията и изберете темите за този браузър. Настройките работят и без регистрация.
          </DialogDescription>
        </DialogHeader>
        <BrowserPushSettings />
      </DialogContent>
    </Dialog>
  );
}
