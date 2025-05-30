import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Wishlist = () => {
  console.log("Wishlist component is rendering");
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState({});

  useEffect(() => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "{}");
      console.log("Wishlist data from localStorage:", savedWishlist);
      setWishlist(savedWishlist);
    } catch (error) {
      console.error("Lỗi khi đọc wishlist từ localStorage:", error);
      setWishlist({});
    }
  }, []);

  const removeFromWishlist = (productId) => {
    console.log("Removing product from wishlist:", productId);
    setWishlist((prev) => {
      const newWishlist = { ...prev };
      // Tìm key của sản phẩm dựa trên productId
      const keyToDelete = Object.keys(newWishlist).find(
        (key) => newWishlist[key].id === productId
      );
      if (keyToDelete !== undefined) {
        delete newWishlist[keyToDelete];
        console.log("New wishlist after removal:", newWishlist);
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      } else {
        console.log("Product not found in wishlist:", productId);
      }
      return { ...newWishlist };
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 pt-20">
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-8">Danh sách yêu thích</h2>
          {Object.keys(wishlist).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(wishlist).map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:scale-105 transition-transform duration-200"
                >
                  <div className="relative h-64">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/300x200?text=No+Image+Available"
                      }
                      alt={product.name}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/300x200?text=Image+Not+Found")
                      }
                    />
                    <span className="absolute top-2 left-2 bg-blue-400 text-white text-xs font-bold px-2 py-1 rounded">
                      Giảm 15%
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className="h-4 w-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-400">5.0 (455)</span>
                    </div>
                    <p className="text-xl font-bold text-white mt-2">
                      {product.price.toLocaleString()} ₫
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex-1 bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors duration-200"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white text-lg">
              <p>Danh sách yêu thích trống.</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors duration-200"
              >
                Quay lại mua sắm
              </button>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;