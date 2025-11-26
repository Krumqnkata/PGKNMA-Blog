import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold"> Грешка 404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Ахой! Нещо се обърка.</p>
        <p className="mb-4 text-xl text-muted-foreground">Изглежда, че страницата, която търсите, вече не съществува или адресът е грешен.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Върнете се на началната страница
        </a>
      </div>
    </div>
  );
};

export default NotFound;
