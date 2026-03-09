import CustomerBanner from '../components/CustomerBanner';
import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import ProductSection from '../components/ProductSection';
import CustomerFooter from '../components/CustomerFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerBanner
        bannerLogoUrl="https://res.cloudinary.com/dwnzd0c2t/image/upload/v1769081838/bursana_icon-removebg_chkjc9.png"
        cartCount={0}
        wishlistCount={0}
        onCartClick={() => {}}
        onLogout={() => {}}
        showLoginPopup={false}
        onShowLogin={() => {}}
        user={null}
      />
      
      {/* Main Content - Add padding-top for fixed header */}
      <main className="flex-1 pt-[70px]">
        <HeroSection />
        <CategorySection />
        <ProductSection />
      </main>
      
      <CustomerFooter />
    </div>
  );
}
