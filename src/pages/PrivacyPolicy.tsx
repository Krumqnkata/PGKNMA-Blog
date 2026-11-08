import { useState, useEffect } from "react";
import { getPrivacyPolicy, PrivacyPolicyContent } from "../lib/api";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { InteriorPage, InteriorPageHero, InteriorSection } from "@/components/InteriorPage";
import { Card, CardContent } from "@/components/ui/card";
import { ContentSkeleton, QueryErrorState } from "@/components/query/QueryStates";
import { formatSiteDate } from "@/lib/date-time";

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
      } catch (err: unknown) {
        console.error("Неуспешно извличане на политиката за поверителност:", err);
        setError(err instanceof Error ? err.message : "Възникна грешка при зареждане на Политиката за поверителност.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return formatSiteDate(dateString, options);
  };

  if (loading) {
    return (
      <InteriorPage><InteriorSection containerClassName="max-w-4xl"><ContentSkeleton variant="detail" label="Зареждане на Политиката за поверителност" /></InteriorSection></InteriorPage>
    );
  }

  if (error) {
    return (
      <InteriorPage><InteriorSection containerClassName="max-w-3xl"><QueryErrorState message={error} /></InteriorSection></InteriorPage>
    );
  }

  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Правна информация" title={<>Политика за <span className="text-primary">поверителност</span></>} description="Как събираме, използваме и защитаваме информацията в училищната платформа." art="document" />
      <InteriorSection containerClassName="max-w-4xl">
        <Card className="overflow-hidden">
          {policy && <div className="border-b border-border/60 bg-muted/35 px-5 py-3 text-center text-sm font-semibold text-muted-foreground">Последна актуализация: {formatDate(policy.date)}</div>}
          <CardContent className="p-5 sm:p-8 lg:p-10">{policy ? <MarkdownRenderer content={policy.content} className="prose-lg dark:prose-invert" /> : <p>Не е налична политика за поверителност.</p>}</CardContent>
        </Card>
      </InteriorSection>
    </InteriorPage>
  );
};

export default PrivacyPolicy;
