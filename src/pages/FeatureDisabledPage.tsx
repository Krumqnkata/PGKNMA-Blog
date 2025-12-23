import { Settings } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from 'react-router-dom';

const FeatureDisabledPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
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
        <Footer />
    </div>
  );
};

export default FeatureDisabledPage;
