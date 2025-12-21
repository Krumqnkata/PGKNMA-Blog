import { Controller, useForm } from "react-hook-form";
import { Music2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { submitBellSongSuggestion, BellSongSuggestionData } from '@/lib/api';


type BellSongFormValues = {
  title: string;
  link: string;
  slot: string;
  note: string;
};

const BellSongForm = () => {
  const { isAuthenticated, openLoginDialog } = useAuth(); // Use AuthContext

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
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
      openLoginDialog();
      return;
    }

    try {
      await submitBellSongSuggestion(values);
      toast({
        title: "Успех!",
        description: `Вашето предложение за песен "${values.title}" беше изпратено за одобрение.`,
      });
      reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Грешка при изпращане!",
        description: "Неуспешно изпращане на предложението. Моля, опитайте отново.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="bell-song" className="border-b border-border bg-secondary/40 py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Music2 className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">Формуляр за предложение на песни за звънеца</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Споделете любимата си песен за междучасието. Ще я разгледаме и ще ви уведомим при одобрение.
          </p>
        </div>

        {!isAuthenticated ? (
          <Card className="mx-auto max-w-4xl border-border bg-card/90 shadow-lg p-8 text-center">
            <CardTitle className="mb-4">Влезте, за да предложите песен</CardTitle>
            <CardDescription className="mb-6">
              Само регистрирани и влезли потребители могат да предлагат песни за звънеца.
            </CardDescription>
            <Button onClick={openLoginDialog}>Вход</Button>
          </Card>
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
