import React, { useMemo, useState } from "react";

export default function ImageGallery({ images = [] }) {
  const ordered = useMemo(() => {
    const main = images.find(i => i.is_main);
    const rest = images.filter(i => !i.is_main);
    return main ? [main, ...rest] : images;
  }, [images]);

  const [active, setActive] = useState(ordered[0]?.image_path);

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {active ? (
          <img src={active} alt="Product" className="w-full h-[420px] object-cover" />
        ) : (
          <div className="h-[420px] flex items-center justify-center text-slate-400">No image</div>
        )}
      </div>

      <div className="flex gap-2 overflow-auto">
        {ordered.map(img => (
          <button
            key={img.id}
            onClick={() => setActive(img.image_path)}
            className={`h-16 w-20 rounded-xl border overflow-hidden ${active === img.image_path ? "border-slate-900" : "border-slate-200"}`}
          >
            <img src={img.image_path} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}