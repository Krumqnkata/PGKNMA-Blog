import { useEffect, useState } from 'react';
import { Construction, RotateCw } from 'lucide-react';
import logoDark from "/logo-dark.png";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <img src={logoDark} className="h-auto w-24 mx-auto mb-6" alt="Logo" />
        <Construction className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold mb-2">Сайтът е в поддръжка</h1>
        <p className="text-lg text-muted-foreground">
          В момента извършваме планирана техническа поддръжка на системата, за да подобрим качеството на услугите и да осигурим по-добро потребителско изживяване. Всички функционалности временно са недостъпни, но очакваме поддръжката да приключи скоро. Моля, опитайте да влезете в системата отново след известно време. Извиняваме се искрено за причиненото неудобство и благодарим за разбирането!
        </p>
        <p className="mt-2 text-base text-muted-foreground italic">
          {isBackendError ? "Причина: Грешка при връзка със сървъра" : "Причина: Планирана техническа поддръжка"}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Код на грешка: {errorCode}
        </p>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <RotateCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Проверка...' : 'Опитай отново'}
        </button>

        <h2 className="mt-6 text-xl font-semibold">Благодарим ви за разбирането!</h2>
        <h2 className="mt-2 text-xl font-semibold">Екипът по техническа поддръжка</h2>
      </div>
    </div>
  );
};

export default MaintenancePage;