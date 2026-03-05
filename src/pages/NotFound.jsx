import React from "react";
import { Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <div className="text-5xl font-black">404</div>
      <p className="mt-3 text-slate-600">Page not found.</p>
      <Link to="/" className="inline-block mt-6">
        <Button>Back home</Button>
      </Link>
    </Container>
  );
}