import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { isDarkTheme } from "@/lib/themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system", resolvedTheme } = useTheme();
  const sonnerTheme: ToasterProps["theme"] = isDarkTheme(theme, resolvedTheme) ? "dark" : "light";

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      offset="calc(var(--site-bottom-clearance) + 1rem)"
      mobileOffset="calc(var(--site-bottom-clearance) + 1rem)"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
