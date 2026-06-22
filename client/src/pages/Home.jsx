import React from "react";
import Banner from "../components/Home/Banner";
import HomeNavbar from "../components/Home/HomeNavbar";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import HowItWorks from "../components/Home/HowItWorks";
import CallToAction from "../components/Home/CallToAction";
import Footer from "../components/Home/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Banner />
      <HomeNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
