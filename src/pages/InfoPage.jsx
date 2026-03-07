import React from "react";
import { Link, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";

const INFO_CONTENT = {
  "terms-conditions": {
    title: "Terms & Conditions",
    lead: "Read the terms that govern purchases, usage, and services on ArtStore.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    lead: "Learn how we collect, use, and protect your personal data.",
  },
  "cookie-policy": {
    title: "Cookie Policy",
    lead: "Understand how cookies are used to improve your browsing experience.",
  },
  "help-advice": {
    title: "Help & Advice",
    lead: "Get practical guidance before and after your purchase.",
  },
  "shipping-tax": {
    title: "Shipping & Tax",
    lead: "Delivery estimates, shipping fees, and tax information.",
  },
  "service-updates": {
    title: "Service Updates",
    lead: "Latest platform and delivery status updates.",
  },
  "returns": {
    title: "Returns",
    lead: "Understand return eligibility, deadlines, and refund process.",
  },
  "contact": {
    title: "Contact",
    lead: "Reach our customer service team for order or account support.",
  },
  "product-guides": {
    title: "Product Guides",
    lead: "Find recommendations to choose the right art materials.",
  },
  "reviews": {
    title: "Reviews",
    lead: "Discover feedback shared by artists and buyers.",
  },
  "price-match": {
    title: "Price Match",
    lead: "Request a price review when you find an equivalent lower offer.",
  },
  "gift-vouchers": {
    title: "Gift Vouchers",
    lead: "Buy and redeem vouchers for friends, students, and teams.",
  },
  "reward-points": {
    title: "Reward Points",
    lead: "Collect points and unlock benefits on eligible orders.",
  },
  "artist-rewards-program": {
    title: "Artist Rewards Program",
    lead: "Benefits and eligibility for active creators and professionals.",
  },
  "student-program": {
    title: "Student Program",
    lead: "Discount options and resources for students.",
  },
  "teacher-program": {
    title: "Teacher Program",
    lead: "Support and offers designed for educators and workshops.",
  },
  "affiliate-program": {
    title: "Affiliate Program",
    lead: "Partner with ArtStore and earn through referrals.",
  },
  "sponsorship-program": {
    title: "Sponsorship Program",
    lead: "Request sponsorship for educational and artistic projects.",
  },
  "trade-educational": {
    title: "Trade & Educational",
    lead: "Bulk ordering and dedicated support for institutions.",
  },
  "about-artstore": {
    title: "About ArtStore",
    lead: "Our mission is to simplify access to quality creative supplies.",
  },
  "art-blog": {
    title: "Art Blog",
    lead: "News, tutorials, and inspiration from our editorial team.",
  },
  publications: {
    title: "Publications",
    lead: "Browse downloadable resources and editorial publications.",
  },
  "art-classes": {
    title: "Art Classes",
    lead: "Find beginner and advanced classes online and in-person.",
  },
  events: {
    title: "Events",
    lead: "Upcoming live demos, exhibitions, and store events.",
  },
  "expert-coaching": {
    title: "Expert Coaching",
    lead: "Book practical guidance with experienced art mentors.",
  },
  webinars: {
    title: "Webinars",
    lead: "Join free and premium sessions about tools and techniques.",
  },
};

export default function InfoPage() {
  const { slug = "" } = useParams();
  const info = INFO_CONTENT[slug] || {
    title: "Information",
    lead: "The requested information page is available soon.",
  };

  return (
    <Container className="py-14">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">ArtStore Info</div>
        <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{info.title}</h1>
        <p className="mt-4 text-slate-600">{info.lead}</p>
        <p className="mt-4 text-slate-600">
          This content page is active and linked from the footer. You can now update this section with your final
          business/legal text.
        </p>

        <div className="mt-8">
          <Link to="/">
            <Button>Back Home</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
