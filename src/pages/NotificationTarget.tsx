import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BellOff, Home, Newspaper } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { InteriorPage, InteriorSection } from "@/components/InteriorPage";
import { ContentSkeleton, QueryErrorState } from "@/components/query/QueryStates";
import { Button } from "@/components/ui/button";
import { getNotificationTarget } from "@/lib/api";
import { useSEO } from "@/hooks/use-seo";

const NotificationTarget = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const validId = Boolean(id && /^\d+$/.test(id));
  const targetQuery = useQuery({
    queryKey: ["notification-target", id],
    queryFn: () => getNotificationTarget(id!),
    enabled: validId,
    retry: 1,
    staleTime: 0,
  });

  useSEO({
    title: "Отваряне на известие",
    description: "Проверка дали съдържанието от известието все още е налично.",
  });

  useEffect(() => {
    const actionUrl = targetQuery.data?.available
      ? targetQuery.data.action_url
      : "";
    if (!actionUrl || actionUrl === `/notification/${id}`) return;
    if (actionUrl.startsWith("/") && !actionUrl.startsWith("//")) {
      navigate(actionUrl, { replace: true });
      return;
    }
    if (/^https:\/\//i.test(actionUrl)) {
      window.location.replace(actionUrl);
    }
  }, [id, navigate, targetQuery.data]);

  const unavailable = !validId
    || targetQuery.data?.available === false
    || targetQuery.data?.action_url === `/notification/${id}`;

  return (
    <InteriorPage>
      <InteriorSection className="flex min-h-[68vh] items-center py-10">
        {targetQuery.isLoading ? (
          <ContentSkeleton
            variant="detail"
            label="Проверка на съдържанието от известието"
            className="max-w-2xl"
          />
        ) : targetQuery.error ? (
          <QueryErrorState
            className="mx-auto w-full max-w-2xl"
            title="Известието не може да се провери"
            message={targetQuery.error.message}
            onRetry={() => void targetQuery.refetch()}
          />
        ) : unavailable ? (
          <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-border/70 bg-card p-7 text-center shadow-xl shadow-primary/5 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <BellOff className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-balance text-3xl font-black tracking-tight sm:text-4xl">
              Съдържанието вече не е налично
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              То може да е било изтрито, скрито или срокът му да е изтекъл. Самото известие няма да води към невалидна страница.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="outline" size="lg">
                <Link to="/"><Home className="h-5 w-5" />Към началото</Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/news"><Newspaper className="h-5 w-5" />Актуални новини</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ContentSkeleton
            variant="detail"
            label="Отваряне на съдържанието"
            className="max-w-2xl"
          />
        )}
      </InteriorSection>
    </InteriorPage>
  );
};

export default NotificationTarget;

