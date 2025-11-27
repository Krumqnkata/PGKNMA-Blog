import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import WeeklyPollComponent from "@/components/WeeklyPoll";
import { Badge } from "@/components/ui/badge";

const WeeklyPoll = () => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-3">Седмична анкета</Badge>
          <h1 className="text-4xl font-bold sm:text-5xl">Код на седмицата</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Получавайте малко предизвикателство по програмиране всяка седмица и споделяйте решенията си във форума или чата.
          </p>
        </div>

        <WeeklyPollComponent />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default WeeklyPoll;
