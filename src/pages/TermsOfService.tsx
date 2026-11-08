import { useState, useEffect } from "react";
import { getTermsOfService, TermsOfServiceContent } from "../lib/api";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { InteriorPage, InteriorPageHero, InteriorSection } from "@/components/InteriorPage";
import { Card, CardContent } from "@/components/ui/card";
import { ContentSkeleton, QueryErrorState } from "@/components/query/QueryStates";
import { formatSiteDate } from "@/lib/date-time";

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
    return formatSiteDate(dateString, options);
  };

  if (loading) {
    return (
      <InteriorPage><InteriorSection containerClassName="max-w-4xl"><ContentSkeleton variant="detail" label="Зареждане на Условията за ползване" /></InteriorSection></InteriorPage>
    );
  }

  if (error) {
    return (
      <InteriorPage><InteriorSection containerClassName="max-w-3xl"><QueryErrorState message={error} /></InteriorSection></InteriorPage>
    );
  }

  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Правна информация" title={<>Условия за <span className="text-primary">ползване</span></>} description="Правилата за отговорно и сигурно използване на училищната платформа." art="document" />
      <InteriorSection containerClassName="max-w-4xl">
        <Card className="overflow-hidden">
          {terms && <div className="border-b border-border/60 bg-muted/35 px-5 py-3 text-center text-sm font-semibold text-muted-foreground">Последна актуализация: {formatDate(terms.date)}</div>}
          <CardContent className="p-5 sm:p-8 lg:p-10">{terms ? <MarkdownRenderer content={terms.content} className="prose-lg dark:prose-invert" /> : <p>Не са налични условия за ползване.</p>}</CardContent>
        </Card>
      </InteriorSection>
    </InteriorPage>
  );
};

export default TermsOfService;
