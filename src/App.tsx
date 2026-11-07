import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marketplace from "./components/Marketplace";
import InstantCost from "./components/InstantCost";
import Management from "./components/Management";
import HowItWorks from "./components/HowItWorks";
import Suppliers from "./components/Suppliers";
import FAQ from "./components/FAQ";
import ContactCTA from "./components/ContactCTA";
import Footer from "./components/Footer";

export default function App() {
  return <>
    <Navbar />
    <main>
      <Hero />
      <Marketplace />
      <InstantCost />
      <Management />
      <HowItWorks />
      <Suppliers />
      <FAQ />
      <ContactCTA />
    </main>
    <Footer />
  </>;
}
