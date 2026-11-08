"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SuccessMoment } from "@/components/art/SuccessMoment";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { submitContactForm, type ContactFormData } from "@/lib/api";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Името е твърде кратко. Нужни са поне 2 букви.",
  }),
  email: z.string().email({
    message: "Този имейл изглежда непълен. Провери за @ и домейн.",
  }),
  message: z.string().min(10, {
    message: "Разкажи ни малко повече. Нужни са поне 10 символа.",
  }),
  reason: z.string().min(1, "Избери за какво ни пишеш, за да стигне до правилния човек."),
});

export function ContactForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      reason: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ContactFormData) => submitContactForm(data),
    onSuccess: (response) => {
      setSentMessage(response.detail || "Съобщението е изпратено успешно.");
      form.reset(); // Clear form on success
    },
    onError: (error) => {
      setErrorMessage(error.message || "Съобщението не беше изпратено. Опитайте отново.");
      toast({
        title: "Грешка при изпращане",
        description: error.message || "Възникна грешка при изпращане на съобщението.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setErrorMessage(null);
    // The schema guarantees every API field at runtime. The explicit boundary
    // type is needed while this project still compiles without strict null checks.
    mutate(data as ContactFormData);
  }

  if (sentMessage !== null) {
    return (
      <SuccessMoment art="envelope" title="Съобщението ти е при нас!" actionLabel="Изпрати още едно съобщение" onAction={() => setSentMessage(null)}>
        {sentMessage}
      </SuccessMoment>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-5">
        {errorMessage && (
          <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Име *</FormLabel>
              <FormControl>
                <Input placeholder="Вашето име" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имейл *</FormLabel>
              <FormControl>
                <Input placeholder="Вашият имейл" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Причина за контакт *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Изберете причина..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">Общо запитване</SelectItem>
                  <SelectItem value="suggestion">Предложение за блога</SelectItem>
                  <SelectItem value="technical_issue">Технически проблем</SelectItem>
                  <SelectItem value="event_question">Въпрос за събитие</SelectItem>
                  <SelectItem value="bug_report">Открит бъг</SelectItem>
                  <SelectItem value="partnership">Партньорство/Сътрудничество</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Съобщение *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Напишете вашето съобщение тук."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Изпращане..." : "Изпращане"}
        </Button>
      </form>
      <div className="mt-5 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">Полетата със * са задължителни. Не споделяйте чувствителна лична информация в съобщението.</div>
    </Form>
  );
}
