import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import { getTermsOfService, TermsOfServiceContent } from "../lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TermsOfService = () => {
  const [terms, setTerms] = useState<TermsOfServiceContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getTermsOfService();
        if (data) {
          setTerms(data);
        } else {
          setError("Условията за ползване не бяха намерени.");
        }
      } catch (err) {
        console.error("Неуспешно извличане на условията за ползване:", err);
        setError("Възникна грешка при зареждане на Условията за ползване.");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p>Зареждане на Условията за ползване...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="py-12 px-4 md:px-6">
        <div className="container mx-auto prose prose-lg max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">Условия за ползване</h1>

          {terms && (
            <p className="text-center text-gray-600">Последна актуализация: {formatDate(terms.date)}</p>
          )}

          {terms ? (
            <ReactMarkdown children={terms.content} remarkPlugins={[remarkGfm]} />
          ) : (
            <p>Не са налични условия за ползване.</p>
          )}

        </div>
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </div>
  );
};

export default TermsOfService;