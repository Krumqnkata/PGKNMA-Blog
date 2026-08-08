import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface NewsPaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const NewsPagination = ({ currentPage, pageCount, onPageChange }: NewsPaginationProps) => {
  if (pageCount <= 1) return null;

  return (
    <Pagination className="mt-12" aria-label="Страници с новини">
      <PaginationContent className="max-w-full flex-wrap">
        <PaginationItem>
          <PaginationPrevious
            href="#news-results"
            onClick={(event) => {
              event.preventDefault();
              onPageChange(Math.max(1, currentPage - 1));
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === 1}
          >
            <span className="hidden sm:inline">Предишна</span>
          </PaginationPrevious>
        </PaginationItem>

        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <PaginationItem key={page} className={pageCount > 7 && Math.abs(page - currentPage) > 2 ? "hidden sm:list-item" : undefined}>
            <PaginationLink
              href="#news-results"
              isActive={currentPage === page}
              onClick={(event) => {
                event.preventDefault();
                onPageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#news-results"
            onClick={(event) => {
              event.preventDefault();
              onPageChange(Math.min(pageCount, currentPage + 1));
            }}
            className={currentPage === pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
            aria-disabled={currentPage === pageCount}
          >
            <span className="hidden sm:inline">Следваща</span>
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default NewsPagination;
