import {ChevronLeft, ChevronRight} from "lucide-react";
import clsx from "clsx";

export default function Pagination({meta, onPageChange}) {
    if (!meta || meta.totalPages <= 1) return null;

    const {page, totalPages, total, limit} = meta;

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
                pages.push(i);
            } else if ((i === page - 2 && page > 3) || (i === page + 2 && page < totalPages - 2)) {
                pages.push("...");
            }
        }
        return pages.filter((p, index, arr) => p !== "..." || arr[index - 1] !== "...");
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}</span> to{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{endItem}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{total}</span> results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, i) =>
                        p === "..." ? (
                            <span key={`ellipsis-${i}`} className="px-3 py-2 text-slate-400">
                                ...
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={clsx(
                                    "px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                                    p === page
                                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
                                )}
                            >
                                {p}
                            </button>
                        ),
                    )}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
