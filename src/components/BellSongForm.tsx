import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Send, FileText } from "lucide-react";
import { SuccessMoment } from "@/components/art/SuccessMoment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { useGoToLogin } from '@/hooks/use-go-to-login';
import { submitBellSongSuggestion } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PDFViewer from "./PDFViewer";
import { SiteArt } from "@/components/art/SiteArt";

type BellSongFormValues = {
  title: string;
  link: string;
  slot: string;
  note: string;
};

const BellSongForm = () => {
  const { isAuthenticated } = useAuth(); // Use AuthContext
  const goToLogin = useGoToLogin();
  const [sentTitle, setSentTitle] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BellSongFormValues>({
    defaultValues: {
      title: "",
      link: "",
      slot: "morning",
      note: "",
    },
  });

  const onSubmit = async (values: BellSongFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Не сте влезли!",
        description: "Моля, влезте, за да направите предложение.",
        variant: "destructive",
      });
      goToLogin();
      return;
    }

    try {
      await submitBellSongSuggestion(values);
      setSentTitle(values.title);
      reset();
    } catch (error: unknown) {
      console.error("Submission error:", error);
      toast({
        title: "Грешка при изпращане!",
        description: error instanceof Error
          ? error.message
          : "Неуспешно изпращане на предложението. Моля, опитайте отново.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="bell-song" className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-primary/10 via-background to-background py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <SiteArt name="bell" className="art-wiggle mx-auto mb-3 block h-14 w-14 drop-shadow-sm sm:h-20 sm:w-20" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Твоят избор в междучасието</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Предложи песен за звънеца</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Споделете любимата си песен за междучасието. Ще я разгледаме и ще ви уведомим при одобрение.
          </p>
          <div className="mt-8">
            <Dialog onOpenChange={(open) => {
              if (!open) {
                // Fallback cleanup for scroll lock
                document.body.style.overflow = 'auto';
                document.body.style.pointerEvents = 'auto';
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 bg-background/70 px-8 backdrop-blur">
                  <FileText className="h-5 w-5" />
                  Регламент за избор на звънец
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <DialogHeader className="p-6 border-b">
                  <DialogTitle>Регламент за избор на звънец</DialogTitle>
                </DialogHeader>
                <div className="flex-grow w-full h-full overflow-hidden">
                  <PDFViewer fileUrl="/bell.pdf" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!isAuthenticated ? (
          <Card className="mx-auto max-w-4xl border-border bg-card/90 shadow-lg p-8 text-center">
            <CardTitle className="mb-4">Влезте, за да предложите песен</CardTitle>
            <CardDescription className="mb-6">
              Само регистрирани и влезли потребители могат да предлагат песни за звънеца.
            </CardDescription>
            <Button onClick={goToLogin}>Вход</Button>
          </Card>
        ) : sentTitle !== null ? (
          <SuccessMoment art="bell" title="Песента ти е при нас!" actionLabel="Предложи още една песен" onAction={() => setSentTitle(null)}>
            „{sentTitle}“ чака одобрение. Ще те уведомим, когато я разгледаме.
          </SuccessMoment>
        ) : (
          <Card className="mx-auto max-w-4xl border-border bg-card/90 shadow-lg">
            <CardHeader>
              <CardTitle>Детайли</CardTitle>
              <CardDescription>Попълнете полетата по-долу и натиснете „Изпрати“.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="link">Линк към песента (YouTube/Spotify)</Label>
                  <Input
                    id="link"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register("link", { required: "Моля, поставете линк." })}
                  />
                  {errors.link && <p className="text-sm text-destructive">{errors.link.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Заглавие на песента</Label>
                  <Input
                    id="title"
                    placeholder="Въведете заглавие на песента"
                    {...register("title", { required: "Заглавието е задължително." })}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Кога да звучи звънецът</Label>
                    <Controller
                      name="slot"
                      control={control}
                      rules={{ required: "Изберете предпочитан момент." }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Изберете момент" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="startClass">Начало на час</SelectItem>
                            <SelectItem value="endClass">Край на час</SelectItem>
                            <SelectItem value="beforeLunch">Преди голямо</SelectItem>
                            <SelectItem value="afterLunch">След голямо</SelectItem>
                            <SelectItem value="morning">Сутрешен звънец</SelectItem>
                            <SelectItem value="special">Специален повод</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.slot && <p className="text-sm text-destructive">{errors.slot.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Кратка причина (по желание)</Label>
                  <Textarea
                    id="note"
                    placeholder="Защо тази песен е подходяща за нашия звънец?"
                    rows={4}
                    {...register("note")}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    С изпращане потвърждавате, че песента е подходяща за училищна среда.
                  </p>
                  <Button type="submit" className="gap-2" disabled={isSubmitting}>
                    {isSubmitting ? "Изчакайте..." : "Изпрати"}
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default BellSongForm;
