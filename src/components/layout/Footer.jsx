import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-200">
      <Container className="py-12">
        <div className="rounded-3xl border border-white/10 bg-slate-800/60 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="text-2xl font-black tracking-tight text-white">ArtStore</div>
              <p className="mt-3 max-w-md text-sm text-slate-300">
                The creative marketplace for artists, students and studios. Premium materials, quick shipping and
                reliable support.
              </p>
              <div className="mt-5 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  aria-label="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600"
                >
                  <Instagram size={16} />
                </button>
                <span className="text-slate-400">Follow our latest art drops</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white">Navigation</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li><Link className="hover:text-white" to="/products">Shop</Link></li>
                <li><Link className="hover:text-white" to="/cart">Cart</Link></li>
                <li><Link className="hover:text-white" to="/my-orders">My orders</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white">Activities</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Workshops</li>
                <li>Artist kits</li>
                <li>Custom studio packs</li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white">Contact</div>
              <ul className="mt-3 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><Mail size={15} /> support@artstore.com</li>
                <li className="flex items-center gap-2"><Phone size={15} /> +212 6 12 34 56 78</li>
                <li className="flex items-center gap-2"><MapPin size={15} /> Casablanca, Morocco</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        Copyright {new Date().getFullYear()} ArtStore. All rights reserved.
      </div>
    </footer>
  );
}
