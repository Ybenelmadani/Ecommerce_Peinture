import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brush, Palette, ShieldCheck, Truck } from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { CatalogAPI } from "../api/catalog";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    CatalogAPI.products().then((data) => setProducts(data.slice(0, 8))).catch(() => {});
  }, []);

  const highlights = [
    { title: "Curated materials", icon: Palette },
    { title: "Fast delivery", icon: Truck },
    { title: "Trusted quality", icon: ShieldCheck },
  ];

  const activities = [
    {
      title: "Workshops",
      desc: "Online and in-store sessions for watercolor, acrylic and mixed media.",
    },
    {
      title: "Artist Kits",
      desc: "Ready bundles for students, hobbyists and professional studios.",
    },
    {
      title: "Custom Orders",
      desc: "Build your own pack by size, color palette and delivery rhythm.",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="pointer-events-none absolute -left-24 -top-20 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

        <Container className="relative py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] opacity-80">New season</div>
            <h1 className="mt-3 text-4xl md:text-5xl font-black leading-tight">
              Premium art supplies, <span className="text-slate-200">simple checkout</span>.
            </h1>
            <p className="mt-4 text-slate-200">
              ArtStore helps creators discover tools, compare variants and buy faster in one clean flow.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/products">
                <Button>Shop now</Button>
              </Link>
              <Link to="/my-orders">
                <Button variant="soft">My orders</Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/15 bg-white/10 p-3">
                    <Icon size={16} className="text-amber-300" />
                    <div className="mt-2 text-sm font-semibold">{item.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-xl">
            <img
              className="rounded-2xl w-full h-[320px] object-cover"
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1400"
              alt="Art supplies"
            />
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-black">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            View all ->
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </Container>

      <section className="bg-slate-50 border-y border-slate-200">
        <Container className="py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              <Brush size={14} />
              What defines our store
            </div>
            <h2 className="mt-4 text-3xl font-black text-slate-900">A complete creative commerce space</h2>
            <p className="mt-3 text-slate-600">
              Beyond products, we support artistic activities from learning to production with practical offers,
              flexible bundles and a store experience designed for clients.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <div key={activity.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-lg font-bold text-slate-900">{activity.title}</div>
                <p className="mt-2 text-sm text-slate-600">{activity.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
