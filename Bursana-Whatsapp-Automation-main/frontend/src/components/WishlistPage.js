import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import useAlert from "../hooks/useAlert";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get("/wishlist");
        if (Array.isArray(res.data)) {
          setWishlistItems(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
        showAlert("Failed to load wishlist", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/remove/${productId}`);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      showAlert("Removed from wishlist", "success");
    } catch (err) {
      showAlert("Failed to remove from wishlist", "error");
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post("/cart/add", { product_id: productId });
      showAlert("Added to cart!", "success");
    } catch (err) {
      showAlert("Failed to add to cart", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-2 rounded-full font-medium"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div 
              key={item.product_id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[3/4] overflow-hidden relative">
                <img 
                  src={item.images?.[0] || '/icons/1.jpeg'} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/icons/1.jpeg';
                  }}
                />
                <button
                  onClick={() => handleRemoveFromWishlist(item.product_id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  aria-label="Remove from wishlist"
                >
                  <svg 
                    className="w-5 h-5 text-red-500 fill-red-500" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <Link to={`/product/${item.product_id}`}>
                  <h3 className="text-gray-800 font-medium mb-1 line-clamp-2 h-10 text-sm md:text-base">
                    {item.name || "Unnamed Product"}
                  </h3>
                </Link>
                <p className="text-gray-600 font-semibold mb-3 text-sm md:text-base">
                  ₹{parseFloat(item.total_price || 0).toLocaleString('en-IN')}
                </p>
                <button 
                  onClick={() => handleAddToCart(item.product_id)}
                  className="w-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white py-2 font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
