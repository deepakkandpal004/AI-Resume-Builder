import HomeNavbar from "../components/Home/HomeNavbar";
import Hero from "../components/Home/Hero";
import HowItWorks from "../components/Home/HowItWorks";
import Features from "../components/Home/Features";
import ProductShowcase from "../components/Home/ProductShowcase";
import TemplateShowcase from "../components/Home/TemplateShowcase";
import Pricing from "../components/Home/Pricing";
import FAQ from "../components/Home/FAQ";
import CallToAction from "../components/Home/CallToAction";
import Footer from "../components/Home/Footer";
import { useGlobalScrollReveal } from "../hooks/useScrollReveal";

const Home = () => {
  useGlobalScrollReveal(0.1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-body">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[48rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_55%),radial-gradient(circle_at_80%_15%,_rgba(45,212,191,0.1),_transparent_35%)]" />
      <HomeNavbar />
      <main className="relative">
        <Hero />
        <HowItWorks />
        <Features />
        <ProductShowcase />
        <TemplateShowcase />
        <Pricing />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
