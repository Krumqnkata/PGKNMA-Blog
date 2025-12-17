"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

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
});

export function ContactForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
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
              <FormLabel>Име</FormLabel>
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
              <FormLabel>Имейл</FormLabel>
              <FormControl>
                <Input placeholder="Вашият имейл" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Съобщение</FormLabel>
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
    </Form>
  );
}
