import { useEffect } from 'react';
import { Construction } from 'lucide-react';
import logoDark from "/logo-dark.png";

const MaintenancePage = () => {
  useEffect(() => {
    // Force dark theme when this page is active
    document.documentElement.classList.add('dark');

    // Cleanup function to remove the dark theme when the component unmounts
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <img src={logoDark} className="h-auto w-24 mx-auto mb-6" alt="Logo" />
        <Construction className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold mb-2">Сайтът е в поддръжка</h1>
        <p className="text-lg text-muted-foreground">
          В момента извършваме планирана техническа поддръжка на системата, за да подобрим качеството на услугите и да осигурим по-добро потребителско изживяване. Всички функционалности временно са недостъпни, но очакваме поддръжката да приключи скоро. Моля, опитайте да влезете в системата отново след известно време. Извиняваме се искрено за причиненото неудобство и благодарим за разбирането!
        </p>
        <h2 className="mt-6 text-xl font-semibold">Благодарим ви за разбирането!
        </h2>
        <h2 className="mt-6 text-xl font-semibold">Екипът по техническа поддръжка</h2>
      </div>
    </div>
  );
};

export default MaintenancePage;
