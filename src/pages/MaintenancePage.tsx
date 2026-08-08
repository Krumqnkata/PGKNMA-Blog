import { useEffect, useState } from 'react';
import { Construction, RotateCw } from 'lucide-react';
import logoDark from "/logo-dark.png";
import { Button } from '@/components/ui/button';

interface MaintenancePageProps {
  isBackendError?: boolean;
}

const MaintenancePage = ({ isBackendError = false }: MaintenancePageProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Force dark theme when this page is active
    const hadDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.add('dark');
    // Cleanup function to restore original theme state when the component unmounts
    return () => {
      if (!hadDark) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  const errorCode = isBackendError ? "CONNECTION_ERROR" : "MAINTENANCE_MODE";

  const handleRetry = () => {
    setIsRetrying(true);
    // Кратко забавяне, за да се вижда spinner-а и retry-то да не изглежда мигновено/неработещо
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_90%_80%,hsl(210_100%_55%/0.10),transparent_36%)]" aria-hidden="true" />
      <div className="relative max-w-2xl rounded-3xl border border-border/70 bg-card/90 p-7 text-center shadow-2xl backdrop-blur-xl sm:p-12">
        <img src={logoDark} className="mx-auto mb-6 h-auto w-24" alt="ПГКНМА" />
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Construction className="h-8 w-8" aria-hidden="true" /></div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Техническо известие</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Сайтът е в поддръжка</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          В момента извършваме планирана техническа поддръжка на системата, за да подобрим качеството на услугите и да осигурим по-добро потребителско изживяване. Всички функционалности временно са недостъпни, но очакваме поддръжката да приключи скоро. Моля, опитайте да влезете в системата отново след известно време. Извиняваме се искрено за причиненото неудобство и благодарим за разбирането!
        </p>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {isBackendError ? "Причина: Грешка при връзка със сървъра" : "Причина: Планирана техническа поддръжка"}
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Код на грешка: {errorCode}
        </p>

        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="mt-7"
        >
          <RotateCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Проверка...' : 'Опитай отново'}
        </Button>

        <p className="mt-7 text-sm text-muted-foreground">Благодарим ви за разбирането — екипът по техническа поддръжка.</p>
      </div>
    </div>
  );
};

export default MaintenancePage;
