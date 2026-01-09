"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { submitContactForm, ContactFormData } from "@/lib/api";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Името трябва да е поне 2 символа.",
  }),
  email: z.string().email({
    message: "Моля, въведете валиден имейл адрес.",
  }),
  message: z.string().min(10, {
    message: "Съобщението трябва да е поне 10 символа.",
  }),
  reason: z.string({
    required_error: "Моля, изберете причина за контакт.",
  }),
});

export function ContactForm() {
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
      toast({
        title: "Успех!",
        description: response.detail,
        variant: "default",
      });
      form.reset(); // Clear form on success
    },
    onError: (error) => {
      toast({
        title: "Грешка при изпращане",
        description: error.message || "Възникна грешка при изпращане на съобщението.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    mutate(data); // Call the mutation function
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Изпращане..." : "Изпращане"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        Полетата отбелязани със * са задължителни.
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        Препоръчително е да не споделяте лична информация в съобщението си.
        Също така е добре да сте влезли с вашия акаунт, за да можем да ви отговорим по-лесно.
      </p>
    </Form>
  );
}
