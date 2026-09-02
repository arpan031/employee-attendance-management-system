
import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Pagination = ({
  page,
  pages,
  onPageChange
}) => {
  if (!pages || pages <= 1) {
    return null;
  }

  const getPages = () => {
    const items = [];

    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);

    if (start > 1) {
      items.push(1);

      if (start > 2) {
        items.push("...");
      }
    }

    for (let i = start; i <= end; i += 1) {
      items.push(i);
    }

    if (end < pages) {
      if (end < pages - 1) {
        items.push("...");
      }

      items.push(pages);
    }

    return items;
  };

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={17} />
        Previous
      </button>

      <div className="pagination-pages">
        {getPages().map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="pagination-ellipsis"
            >
              ...
            </span>
          ) : (
            <button
              type="button"
              key={item}
              className={`pagination-number ${
                item === page ? "active" : ""
              }`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pagination-button"
        disabled={page === pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight size={17} />
      </button>
    </div>
  );
};

export default Pagination;