import type { ArticleCategory } from "@/features/actualites/types/article";
import { CATEGORY_TAG_CLASSES } from "@/features/actualites/data/articles";

export function CategoryTag({ category }: { category: ArticleCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${CATEGORY_TAG_CLASSES[category]}`}
    >
      {category}
    </span>
  );
}
