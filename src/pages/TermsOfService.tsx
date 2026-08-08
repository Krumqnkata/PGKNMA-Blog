import { useState, useEffect } from "react";
import { getTermsOfService, TermsOfServiceContent } from "../lib/api";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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
      } catch (err: unknown) {
        console.error("Неуспешно извличане на условията за ползване:", err);
        setError(err instanceof Error ? err.message : "Възникна грешка при зареждане на Условията за ползване.");
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
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <p>Зареждане на Условията за ползване...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <main className="py-12 px-4 md:px-6">
        <div className="container mx-auto prose prose-lg max-w-4xl dark:prose-invert">
          <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Условия за ползване</h1>

          {terms && (
            <p className="text-center text-muted-foreground">Последна актуализация: {formatDate(terms.date)}</p>
          )}

          {terms ? (
            <MarkdownRenderer content={terms.content} />
          ) : (
            <p>Не са налични условия за ползване.</p>
          )}

        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
