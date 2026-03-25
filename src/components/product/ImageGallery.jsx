import React, { useMemo, useState } from "react";
import { useI18n } from "../../context/I18nContext";
import { resolveMediaUrl } from "../../utils/media";

export default function ImageGallery({ images = [] }) {
  const { pick } = useI18n();
  const ui = pick({
    fr: { product: "Produit", noImage: "Aucune image" },
    en: { product: "Product", noImage: "No image" },
    ar: { product: "منتج", noImage: "لا توجد صورة" },
  });
  const ordered = useMemo(() => {
    const main = images.find(i => i.is_main);
    const rest = images.filter(i => !i.is_main);
    return main ? [main, ...rest] : images;
  }, [images]);

  const [active, setActive] = useState(resolveMediaUrl(ordered[0]?.image_path));

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
        {active ? (
          <div className="flex h-[280px] w-full items-center justify-center p-4 sm:h-[360px] lg:h-[420px] lg:p-6">
            <img src={active} alt={ui.product} className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-slate-400 sm:h-[360px] lg:h-[420px]">{ui.noImage}</div>
        )}
      </div>

      <div className="flex gap-2 overflow-auto">
        {ordered.map(img => (
          <button
            key={img.id}
            onClick={() => setActive(resolveMediaUrl(img.image_path))}
            className={`h-16 w-20 rounded-xl border overflow-hidden bg-slate-50 ${
              active === resolveMediaUrl(img.image_path) ? "border-slate-900" : "border-slate-200"
            }`}
          >
            <img src={resolveMediaUrl(img.image_path)} alt="" className="h-full w-full object-contain p-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
