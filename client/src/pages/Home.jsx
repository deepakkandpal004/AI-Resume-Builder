import React from "react";
import Banner from "../components/Home/Banner";
import HomeNavbar from "../components/Home/HomeNavbar";
import Hero from "../components/Home/Hero";
import StatsBar from "../components/Home/StatsBar";
import Features from "../components/Home/Features";
import TemplateShowcase from "../components/Home/TemplateShowcase";
import AIFeatures from "../components/Home/AIFeatures";
import HowItWorks from "../components/Home/HowItWorks";
import Testimonials from "../components/Home/Testimonials";
import Pricing from "../components/Home/Pricing";
import FAQ from "../components/Home/FAQ";
import CallToAction from "../components/Home/CallToAction";
import Footer from "../components/Home/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-canvas">
      <Banner />
      <HomeNavbar />
      <Hero />
      <StatsBar />
      <Features />
      <TemplateShowcase />
      <AIFeatures />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
