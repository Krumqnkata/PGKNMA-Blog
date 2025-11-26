import { Controller, useForm } from "react-hook-form";
import { Music2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type BellSongFormValues = {
  name: string;
  link: string;
  slot: string;
  note: string;
};

const BellSongForm = () => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BellSongFormValues>({
    defaultValues: {
      name: "",
      link: "",
      slot: "morning",
      note: "",
    },
  });

  const onSubmit = (values: BellSongFormValues) => {
    toast({
      title: "Благодарим за предложението!",
      description: values.link || "Без линк",
    });
    reset();
  };

  const linkValue = watch("link");

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

        <Card className="mx-auto max-w-4xl border-border bg-card/90 shadow-lg">
          <CardHeader>
            <CardTitle>Детайли</CardTitle>
            <CardDescription>Попълнете полетата по-долу и натиснете „Изпрати“.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Име и клас</Label>
                  <Input
                    id="name"
                    placeholder="Мария Петрова, 10Б"
                    {...register("name", { required: "Моля, въведете име или клас." })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="link">Линк към песента (YouTube/Spotify)</Label>
                  <Input id="link" placeholder="https://…" {...register("link")} />
                  <p className="text-xs text-muted-foreground">Добавете YouTube линк за автоматично заглавие.</p>
                </div>

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
                  <Send className="h-4 w-4" />
                  Изпрати
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BellSongForm;
