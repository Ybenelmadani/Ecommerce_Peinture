import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Palette, ShieldCheck, Truck } from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { CatalogAPI } from "../api/catalog";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const fallbackHeroImage =
    "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=1600";

  useEffect(() => {
    CatalogAPI.products().then((data) => setProducts(data.slice(0, 8))).catch(() => {});
  }, []);

  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        badge: "NOUVELLE COLLECTION",
        title: "Fournitures d'art premium, commande simple.",
        desc: "Découvrez des pinceaux, peintures et accessoires sélectionnés pour artistes débutants et pros.",
        ctaText: "Découvrir les produits",
        ctaLink: "/products",
        image:
          "https://images.pexels.com/photos/1672850/pexels-photo-1672850.jpeg?auto=compress&cs=tinysrgb&w=1600",
        leftClass: "from-[#0a1229] via-[#1e2a49] to-[#2f3f5f]",
      },
      {
        id: 2,
        badge: "EDITION LIMITEE",
        title: "Kits créatifs prêts à livrer chez vous.",
        desc: "Composez votre atelier avec des packs complets pour acrylique, aquarelle et dessin.",
        ctaText: "Voir les packs",
        ctaLink: "/products",
        image:
          "https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=1600",
        leftClass: "from-[#090909] via-[#131313] to-[#222222]",
      },
      {
        id: 3,
        badge: "TOP VENTES",
        title: "Qualité pro pour chaque création.",
        desc: "Pigments riches, papiers résistants et outils fiables pour un rendu précis.",
        ctaText: "Shop now",
        ctaLink: "/products",
        image:
          "https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=1600",
        leftClass: "from-[#31190a] via-[#5f2f11] to-[#84411e]",
      },
    ],
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const highlights = [
    { title: "Curated materials", icon: Palette },
    { title: "Fast delivery", icon: Truck },
    { title: "Trusted quality", icon: ShieldCheck },
  ];

  return (
    <>
      <section className="bg-slate-100 py-8 md:py-10">
        <Container>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                } absolute inset-0 transition-opacity duration-700 ease-out`}
              >
                <div className="grid md:grid-cols-2 h-full min-h-[560px]">
                  <div className={`bg-gradient-to-br ${slide.leftClass} p-8 md:p-14 text-white`}>
                    <div className="text-xs md:text-sm uppercase tracking-[0.28em] text-white/70">{slide.badge}</div>
                    <h1 className="mt-6 text-4xl md:text-6xl font-black leading-[1.05]">{slide.title}</h1>
                    <p className="mt-6 text-lg md:text-2xl text-white/90 max-w-xl">{slide.desc}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link to={slide.ctaLink}>
                        <Button>{slide.ctaText}</Button>
                      </Link>
                      <Link to="/my-orders">
                        <Button variant="soft">Mes commandes</Button>
                      </Link>
                    </div>
                  </div>

                  <div className="relative min-h-[270px] md:min-h-full">
                    <img
                      className="h-full w-full object-cover"
                      src={slide.image}
                      alt={slide.title}
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.dataset.fallbackApplied) return;
                        e.currentTarget.dataset.fallbackApplied = "true";
                        e.currentTarget.src = fallbackHeroImage;
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/15" />
                  </div>
                </div>
              </div>
            ))}

            <div className="grid md:grid-cols-2 h-full min-h-[560px] opacity-0 pointer-events-none" aria-hidden>
              <div />
              <div />
            </div>

            <div className="absolute left-1/2 bottom-5 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2">
              <div className="flex items-center gap-3">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-3 w-3 rounded-full transition ${
                      idx === currentSlide ? "bg-blue-600" : "bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Icon size={16} className="text-amber-500" />
                  <div className="mt-2 text-sm font-semibold text-slate-800">{item.title}</div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-black">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-slate-700 hover:text-slate-900 btn btn-info">
            View all 
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </Container>
    </>
  );
}
