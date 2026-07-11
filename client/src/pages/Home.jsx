import { lazy, Suspense } from "react";
import HomeNavbar from "../components/Home/HomeNavbar";
import Hero from "../components/Home/Hero";
import HowItWorks from "../components/Home/HowItWorks";
import { useGlobalScrollReveal } from "../hooks/useScrollReveal";

// Lazy load below-the-fold components
const Features = lazy(() => import("../components/Home/Features"));
const ProductShowcase = lazy(() => import("../components/Home/ProductShowcase"));
const TemplateShowcase = lazy(() => import("../components/Home/TemplateShowcase"));
const Pricing = lazy(() => import("../components/Home/Pricing"));
const FAQ = lazy(() => import("../components/Home/FAQ"));
const CallToAction = lazy(() => import("../components/Home/CallToAction"));
const Footer = lazy(() => import("../components/Home/Footer"));

const Home = () => {
  useGlobalScrollReveal(0.1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-body">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[48rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_55%),radial-gradient(circle_at_80%_15%,_rgba(45,212,191,0.1),_transparent_35%)]" />
      <HomeNavbar />

      <main className="relative">
        <Hero />
        <HowItWorks />
        
        <Suspense fallback={<div className="h-[500px]" />}>
          <Features />
        </Suspense>
        
        <Suspense fallback={<div className="h-[600px]" />}>
          <ProductShowcase />
        </Suspense>
        
        <Suspense fallback={<div className="h-[600px]" />}>
          <TemplateShowcase />
        </Suspense>
        
        <Suspense fallback={<div className="h-[550px]" />}>
          <Pricing />
        </Suspense>
        
        <Suspense fallback={<div className="h-[500px]" />}>
          <FAQ />
        </Suspense>
        
        <Suspense fallback={<div className="h-[450px]" />}>
          <CallToAction />
        </Suspense>
      </main>
      
      <Suspense fallback={<div className="h-[300px]" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Home;
