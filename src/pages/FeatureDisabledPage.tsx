import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureDisabledPage = () => {
  return (
    <div className="flex min-h-[65vh] flex-col bg-background text-foreground">
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <Settings className="mx-auto h-24 w-24 text-primary mb-6" />
            <h1 className="text-4xl font-bold mb-3">Функционалността е изключена</h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
                Тази функционалност е временно изключена от администратора. Моля, проверете отново по-късно.
            </p>
            <Link to="/" className="text-primary hover:underline">
                Върни се към началната страница
            </Link>
        </main>
    </div>
  );
};

export default FeatureDisabledPage;
