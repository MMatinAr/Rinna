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
import ManufacturerDashboard from "./components/ManufacturerDashboard";
import DistributorDashboard from "./components/DistributorDashboard";
import ProductDetail from "./components/ProductDetail";
import WholesaleMarketplace from "./components/WholesaleMarketplace";
import { AccountPage, ContactPage, InfoPage, MarketplacePage, NotFoundPage } from "./components/SitePages";

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/manufacturer" || path.startsWith("/manufacturer/")) return <ManufacturerDashboard />;
  if (path === "/distributor" || path.startsWith("/distributor/")) return <DistributorDashboard />;
  if (path.startsWith("/products/")) return <ProductDetail />;
  if (["/marketplace", "/cart", "/checkout", "/orders"].includes(path) || path.startsWith("/orders/")) return <WholesaleMarketplace />;
  if (path === "/login") return <AccountPage mode="login" />;
  if (path === "/register") return <AccountPage mode="register" />;
  if (path === "/contact") return <ContactPage />;
  if (path === "/about") return <InfoPage page="about" />;
  if (path === "/privacy") return <InfoPage page="privacy" />;
  if (path === "/terms") return <InfoPage page="terms" />;
  if (path === "/support") return <InfoPage page="support" />;
  if (path !== "/") return <NotFoundPage />;

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
