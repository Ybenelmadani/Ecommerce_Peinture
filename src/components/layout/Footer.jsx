import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Music2, Youtube } from "lucide-react";
import Container from "./Container";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    const value = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!isValid) {
      setStatus("Please enter a valid email.");
      return;
    }

    const current = JSON.parse(localStorage.getItem("newsletter_subscribers") || "[]");
    if (!current.includes(value)) {
      current.push(value);
      localStorage.setItem("newsletter_subscribers", JSON.stringify(current));
    }

    setStatus("Thanks. You are subscribed.");
    setEmail("");
  };

  const helpLinks = [
    { label: "Help & advice", to: "/info/help-advice" },
    { label: "Shipping & tax", to: "/info/shipping-tax" },
    { label: "Service updates", to: "/info/service-updates" },
    { label: "Track my order", to: "/my-orders" },
    { label: "Returns", to: "/info/returns" },
    { label: "Contact", to: "/info/contact" },
  ];

  const shoppingLinks = [
    { label: "Product guides", to: "/info/product-guides" },
    { label: "Reviews", to: "/info/reviews" },
    { label: "Price match", to: "/info/price-match" },
    { label: "Gift vouchers", to: "/info/gift-vouchers" },
    { label: "Reward points", to: "/info/reward-points" },
  ];

  const partnershipLinks = [
    { label: "Artist rewards program", to: "/info/artist-rewards-program" },
    { label: "Student program", to: "/info/student-program" },
    { label: "Teacher program", to: "/info/teacher-program" },
    { label: "Affiliate program", to: "/info/affiliate-program" },
    { label: "Sponsorship program", to: "/info/sponsorship-program" },
    { label: "Trade & educational", to: "/info/trade-educational" },
  ];

  const moreLinks = [
    { label: "About ArtStore", to: "/info/about-artstore" },
    { label: "Art blog", to: "/info/art-blog" },
    { label: "Publications", to: "/info/publications" },
    { label: "Art classes", to: "/info/art-classes" },
    { label: "Events", to: "/info/events" },
    { label: "Expert coaching", to: "/info/expert-coaching" },
    { label: "Webinars", to: "/info/webinars" },
  ];

  const socialLinks = [
    { label: "Facebook", href: "https://www.facebook.com", icon: Facebook },
    { label: "Instagram", href: "https://www.instagram.com", icon: Instagram },
    { label: "YouTube", href: "https://www.youtube.com", icon: Youtube },
    { label: "TikTok", href: "https://www.tiktok.com", icon: Music2 },
  ];

  return (
    <footer className="mt-16 border-t border-white/10 bg-black text-white">
      <Container className="py-12 md:py-14">
        <div className="grid gap-10 border-b border-white/25 pb-10 md:grid-cols-2 md:gap-16">
          <div>
            <h3 className="text-xl font-black uppercase tracking-[0.25em]">Be In The Know</h3>
            <p className="mt-2 text-lg text-white/80">Get art material inspiration and exclusive offers.</p>
            <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-14 w-full border border-white/70 bg-white px-5 text-xl text-black outline-none"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="h-14 min-w-[190px] border border-white/70 bg-black px-6 text-xl font-extrabold uppercase tracking-[0.16em] hover:bg-white hover:text-black"
              >
                Sign Up
              </button>
            </form>
            {status && <p className="mt-3 text-sm text-white/80">{status}</p>}
          </div>

          <div>
            <h3 className="text-xl font-black uppercase tracking-[0.25em]">Join The Community</h3>
            <p className="mt-2 text-lg text-white/80">Connect with artists via our social media.</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/70 text-white transition hover:bg-white hover:text-black"
                  aria-label={label}
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="text-3xl font-black uppercase tracking-[0.11em]">Help</h4>
            <ul className="mt-5 space-y-2">
              {helpLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-xl uppercase tracking-[0.08em] text-white/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-3xl font-black uppercase tracking-[0.11em]">Shopping</h4>
            <ul className="mt-5 space-y-2">
              {shoppingLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-xl uppercase tracking-[0.08em] text-white/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-3xl font-black uppercase tracking-[0.11em]">Partnerships</h4>
            <ul className="mt-5 space-y-2">
              {partnershipLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-xl uppercase tracking-[0.08em] text-white/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-3xl font-black uppercase tracking-[0.11em]">More From ArtStore</h4>
            <ul className="mt-5 space-y-2">
              {moreLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-xl uppercase tracking-[0.08em] text-white/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8 border-t border-white/25 pt-7 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 text-lg text-white/80">
            <div className="uppercase tracking-[0.14em]">
              <Link className="hover:text-white" to="/info/terms-conditions">
                T&amp;Cs
              </Link>{" "}
              |{" "}
              <Link className="hover:text-white" to="/info/privacy-policy">
                Privacy Policy
              </Link>{" "}
              |{" "}
              <Link className="hover:text-white" to="/info/cookie-policy">
                Cookie Policy
              </Link>
            </div>
            <p className="uppercase tracking-[0.08em]">© ArtStore 2026</p>
            <p className="uppercase tracking-[0.08em]">Customer Service: +212 6 12 34 56 78 | 9AM - 6PM Mon - Fri</p>
            <p className="uppercase tracking-[0.08em]">Casablanca, Morocco</p>
          </div>
          <div className="text-5xl font-black italic tracking-tight">ArtStore</div>
        </div>
      </Container>

      <div className="bg-zinc-900 py-3 text-center text-sm text-white/70">
        This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
      </div>
    </footer>
  );
}
