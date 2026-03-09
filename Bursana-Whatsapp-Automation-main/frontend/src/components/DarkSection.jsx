import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

// Fallback static products (used when backend is unavailable)
const darkProducts = [
  { id: 9, name: 'Evening Gown - Black', price: 7999, image: '/icons/4.jpeg' },
  { id: 10, name: 'Velvet Dress', price: 4599, image: '/icons/5.jpeg' },
  { id: 11, name: 'Sequin Saree', price: 8999, image: '/icons/1.jpeg' },
];

export default function DarkSection() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Transform backend products to frontend format
          const backendProducts = response.data.slice(8, 11).map((product) => {
            // Get the first image from the product
            let imageUrl = null;
            if (product.images) {
              if (Array.isArray(product.images) && product.images.length > 0) {
                imageUrl = product.images[0];
              } else if (typeof product.images === 'string') {
                imageUrl = product.images;
              }
            }

            return {
              id: product.id,
              name: product.name || "Unnamed Product",
              price: product.total_price || product.price || 999,
              image: imageUrl || '/icons/4.jpeg',
            };
          });

          if (backendProducts.length > 0) {
            setProducts(backendProducts);
          } else {
            setProducts(darkProducts);
          }
        } else {
          setProducts(darkProducts);
        }
      } catch (error) {
        console.log("Using fallback static products for dark section");
        setProducts(darkProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="bg-[#050b2a] py-12 md:py-16 px-4" id="tech-tradition">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-3">
            Tech + Tradition
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
            Where heritage craftsmanship meets modern innovation
          </p>
        </div>
        
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0a1628] rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-[3/4] bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Product Grid - 1 column mobile, 3 columns desktop */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {products.map((product) => (
              <Link 
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-[#0a1628] rounded-xl shadow-lg overflow-hidden hover:scale-[1.02] transition-transform"
              >
                {/* Product Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to static image on error
                      e.target.src = '/icons/4.jpeg';
                    }}
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-1 line-clamp-2 text-sm md:text-base">
                    {product.name}
                  </h3>
                  <p className="text-white font-semibold text-sm md:text-base">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
