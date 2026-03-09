import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { CatalogAPI } from "../api/catalog";

const FALLBACK_HERO_IMAGE =
  "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=1600";

const HERO_SLIDES = [
  {
    id: 1,
    badge: "NEW COLLECTION",
    title: "Create bolder art with pro essentials.",
    desc: "Premium brushes, paints and paper selected for reliable studio results.",
    ctaText: "Shop collection",
    ctaLink: "/products",
    image:
      "https://images.pexels.com/photos/1672850/pexels-photo-1672850.jpeg?auto=compress&cs=tinysrgb&w=1600",
    leftClass: "from-[#0a1229] via-[#1e2a49] to-[#2f3f5f]",
  },
  {
    id: 2,
    badge: "READY KITS",
    title: "Build your studio in one order.",
    desc: "Complete acrylic, watercolor and drawing kits made for fast setup.",
    ctaText: "Explore kits",
    ctaLink: "/products",
    image:
      "https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=1600",
    leftClass: "from-[#0b1324] via-[#1b253d] to-[#233252]",
  },
  {
    id: 3,
    badge: "BESTSELLERS",
    title: "Tools you can trust every day.",
    desc: "High pigment quality, strong surfaces and smooth control for better output.",
    ctaText: "Shop bestsellers",
    ctaLink: "/products",
    image:
      "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=1600",
    leftClass: "from-[#31190a] via-[#5f2f11] to-[#84411e]",
  },
];

const INTENTS = [
  {
    title: "Start with acrylic",
    desc: "Fast-drying paints, brush sets and mixing tools.",
    href: "/products?q=acrylic",
    bg: "from-[#fff7ed] to-[#ffedd5]",
  },
  {
    title: "Watercolor setup",
    desc: "Paper blocks, pans and precision round brushes.",
    href: "/products?q=watercolor",
    bg: "from-[#eff6ff] to-[#dbeafe]",
  },
  {
    title: "Drawing basics",
    desc: "Sketch pads, graphite and clean line tools.",
    href: "/products?q=drawing",
    bg: "from-[#f0fdf4] to-[#dcfce7]",
  },
];

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-slate-100 py-6 md:py-8">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`${
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              } absolute inset-0 transition-opacity duration-700 ease-out`}
            >
              <div className="grid h-full min-h-[480px] md:min-h-[540px] md:grid-cols-2">
                <div className={`bg-gradient-to-br ${slide.leftClass} p-7 text-white md:p-12`}>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/70">{slide.badge}</div>
                  <h1 className="mt-5 text-4xl font-black leading-[1.05] md:text-6xl">{slide.title}</h1>
                  <p className="mt-5 max-w-xl text-lg text-white/90 md:text-2xl">{slide.desc}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link to={slide.ctaLink}>
                      <Button>{slide.ctaText}</Button>
                    </Link>
                    <Link to="/my-orders">
                      <Button variant="soft">My orders</Button>
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[240px] md:min-h-full">
                  <img
                    className="h-full w-full object-cover"
                    src={slide.image}
                    alt={slide.title}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.dataset.fallbackApplied) return;
                      e.currentTarget.dataset.fallbackApplied = "true";
                      e.currentTarget.src = FALLBACK_HERO_IMAGE;
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/15" />
                </div>
              </div>
            </div>
          ))}

          <div
            className="pointer-events-none grid h-full min-h-[480px] opacity-0 md:min-h-[540px] md:grid-cols-2"
            aria-hidden
          >
            <div />
            <div />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2">
            <div className="flex items-center gap-3">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    idx === currentSlide ? "bg-blue-600" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    setProductsLoading(true);
    CatalogAPI.products({ per_page: 8 })
      .then((data) => setProducts(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  return (
    <>
      <HeroSection />

      <Container className="py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-black md:text-2xl">Featured products</h2>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            View all
            <ArrowRight size={14} className="shrink-0" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {productsLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-[360px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="mt-6 h-10 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          {!productsLoading && products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </Container>

      <section className="pb-12">
        <Container>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2 text-slate-800">
              <Sparkles size={16} className="text-amber-500" />
              <h3 className="text-lg font-black md:text-xl">Shop by intent</h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {INTENTS.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${item.bg} p-4 transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="text-base font-bold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.desc}</div>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                    Explore
                    <ArrowRight size={14} className="shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
