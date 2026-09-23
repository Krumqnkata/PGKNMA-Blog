import { Button } from "@/components/ui/button";

interface NewsPaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const NewsPagination = ({ currentPage, pageCount, onPageChange }: NewsPaginationProps) => {
  if (pageCount <= 1) return null;

  const nearbyPages = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === pageCount || Math.abs(page - currentPage) <= 1);

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Страници с новини">
      <Button variant="outline" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Предишна
      </Button>
      {nearbyPages.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && page - nearbyPages[index - 1] > 1 && <span aria-hidden="true" className="px-1">…</span>}
          <Button
            variant={currentPage === page ? "default" : "outline"}
            aria-label={`Страница ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => onPageChange(page)}
            className="min-w-10"
          >
            {page}
          </Button>
        </span>
      ))}
      <Button variant="outline" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}>
        Следваща
      </Button>
    </nav>
  );
};

export default NewsPagination;
