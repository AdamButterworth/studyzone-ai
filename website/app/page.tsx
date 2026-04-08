import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureIcons from "@/components/FeatureIcons";
import FeatureUpload from "@/components/FeatureUpload";
import Testimonial from "@/components/Testimonial";
import FeatureGuided from "@/components/FeatureGuided";
import FeatureTools from "@/components/FeatureTools";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeatureIcons />
        <FeatureUpload />
        <Testimonial
          quote="I went from re-reading my notes 5 times to actually understanding the material in one guided session."
          name="Sarah M."
          role="Pre-Med Student, Stanford"
        />
        <FeatureGuided />
        <FeatureTools />
        <Testimonial
          quote="It's like having a patient tutor who knows exactly what I need to understand first before moving on."
          name="James K."
          role="CS Graduate Student, MIT"
        />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
