import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import { getPrivacyPolicy, PrivacyPolicyContent } from "../lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState<PrivacyPolicyContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const data = await getPrivacyPolicy();
        if (data) {
          setPolicy(data);
        } else {
          setError("Политиката за поверителност не беше намерена.");
        }
      } catch (err) {
        console.error("Failed to fetch privacy policy:", err);
        setError("Възникна грешка при зареждане на Политиката за поверителност.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p>Зареждане на Политиката за поверителност...</p>
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
          <h1 className="text-3xl font-bold text-center mb-8">Политика за поверителност</h1>

          {policy && (
            <p className="text-center text-gray-600">Последна актуализация: {formatDate(policy.date)}</p>
          )}

          {policy ? (
            <ReactMarkdown children={policy.content} remarkPlugins={[remarkGfm]} />
          ) : (
            <p>Не е налична политика за поверителност.</p>
          )}

        </div>
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </div>
  );
};

export default PrivacyPolicy;