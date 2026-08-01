import { useMutation } from '@tanstack/react-query';
import { Download, Loader2, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { downloadMyPersonalData } from '@/lib/api';


const PersonalDataExportCard = () => {
  const { toast } = useToast();
  const exportMutation = useMutation({
    mutationFn: downloadMyPersonalData,
    onSuccess: ({ filename }) => toast({
      title: 'Експортът е готов',
      description: `Файлът ${filename} беше изтеглен.`,
    }),
    onError: (error: Error) => toast({
      title: 'Експортът е неуспешен',
      description: error.message,
      variant: 'destructive',
    }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <CardTitle>Моите лични данни</CardTitle>
            <CardDescription>
              Изтеглете машинно четимо JSON копие на данните, свързани с профила ви.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Файлът съдържа профилни данни, ваши коментари и публикации, отговори,
          съгласия и наличната история на входовете.
        </p>
        <p>
          Пароли и токени никога не се включват. Валентинките използват отделен
          профил и не могат безопасно да бъдат свързани автоматично с този акаунт.
        </p>
        <p className="font-medium text-foreground">
          Пазете изтегления файл — той може да съдържа IP адреси и друга лична информация.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={exportMutation.isPending}
          onClick={() => exportMutation.mutate()}
        >
          {exportMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {exportMutation.isPending ? 'Подготвяне…' : 'Изтегли личните ми данни'}
        </Button>
      </CardFooter>
    </Card>
  );
};


export default PersonalDataExportCard;
