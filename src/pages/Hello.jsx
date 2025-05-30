import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { fetchProducts } from "../api/productAPI";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Hello = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 7000 });
  const [wishlist, setWishlist] = useState({});

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await fetchProducts({ cache: "no-store" });
      console.log("Raw data from fetchProducts:", result);

      const productsList = Array.isArray(result)
        ? result.flatMap(
            (item) =>
              item?.data?.filter(
                (product) =>
                  product &&
                  typeof product === "object" &&
                  product.id &&
                  product.name
              ) || []
          )
        : [];
      console.log("Products list after flatMap and filter:", productsList);

      const productMap = new Map();
      productsList.forEach((product) => {
        // Ưu tiên phiên bản cuối cùng trong danh sách
        productMap.set(product.id, product);
      });

      const uniqueProducts = Array.from(productMap.values());
      console.log("Unique products before filtering unavailable:", uniqueProducts);

      const unavailableProducts = JSON.parse(localStorage.getItem("unavailableProducts") || "[]");
      console.log("Unavailable products from localStorage:", unavailableProducts);

      const availableProducts = uniqueProducts.filter(
        (product) =>
          product.status !== "unavailable" &&
          !unavailableProducts.includes(product.id)
      );
      console.log("Available products after filtering:", availableProducts);

      setProducts(availableProducts);
      setFilteredProducts(availableProducts);

      const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "{}");
      const updatedWishlist = { ...savedWishlist };
      Object.keys(updatedWishlist).forEach((productId) => {
        if (!availableProducts.some((product) => product.id === productId)) {
          delete updatedWishlist[productId];
        }
      });
      setWishlist(updatedWishlist);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      console.log("Updated wishlist:", updatedWishlist);

      toast.success("Danh sách sản phẩm đã được làm mới!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Không thể tải sản phẩm:", error);
      toast.error("Không thể tải sản phẩm. Vui lòng thử lại sau.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Polling: Tự động làm mới dữ liệu mỗi 60 giây
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    }, 60000);

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, []); // Xóa dependency isPollingEnabled

  const handleWishlist = (product) => {
    console.log("Adding/removing product to/from wishlist:", product.id);
    setWishlist((prev) => {
      const newWishlist = { ...prev };
      if (newWishlist[product.id]) {
        delete newWishlist[product.id];
      } else {
        newWishlist[product.id] = {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
        };
      }
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      console.log("Updated wishlist in localStorage:", newWishlist);
      return newWishlist;
    });
  };

  const handleSort = (option) => {
    setSortOption(option);
    const sortedProducts = [...filteredProducts];
    switch (option) {
      case "newest":
        sortedProducts.sort(
          (a, b) =>
            new Date(b.date.replace("thg", "tháng")) -
            new Date(a.date.replace("thg", "tháng"))
        );
        break;
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    setFilteredProducts(sortedProducts);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const applyFilters = () => {
    let updatedProducts = [...products];

    if (selectedBrands.length > 0) {
      updatedProducts = updatedProducts.filter((product) =>
        selectedBrands.some((brand) =>
          product.name.toLowerCase().includes(brand.toLowerCase())
        )
      );
    }

    updatedProducts = updatedProducts.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );

    setFilteredProducts(updatedProducts);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 7000 });
    setFilteredProducts(products);
    setIsFilterOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <svg
          className="animate-spin h-12 w-12 text-blue-400 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p className="mt-2 text-white">Đang tải...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <Header />
      <div className="min-h-screen bg-gray-900 pt-20">
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="sticky top-0 bg-gray-900 z-10 py-4 mb-8 border-b border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-bold text-white">Danh sách sản phẩm</h2>
              <div className="flex gap-4 flex-wrap">
                
                <div className="relative">
                  <button
                    onClick={() => document.getElementById("dropdownSort1").classList.toggle("hidden")}
                    className="flex items-center bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 4h18M3 8h12M3 12h6m12 0v8m0-8l-4 4m4-4l4-4"
                      />
                    </svg>
                    Sắp xếp
                  </button>
                  <div
                    id="dropdownSort1"
                    className="hidden absolute right-0 mt-2 w-48 bg-gray-700 text-white rounded-lg shadow-lg z-50"
                  >
                    <ul className="py-2 text-sm">
                      <li>
                        <button
                          onClick={() => handleSort("newest")}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                        >
                          Mới nhất
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSort("price-asc")}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                        >
                          Giá tăng dần
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleSort("price-desc")}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                        >
                          Giá giảm dần
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                
                
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white truncate flex-1">
                        {product.name}
                      </h3>
                      <span
                        className={`heart-icon ${wishlist[product.id] ? "liked" : ""}`}
                        onClick={() => handleWishlist(product)}
                      >
                        <svg
                          className="h-5 w-5"
                          fill={wishlist[product.id] ? "#ff4d4d" : "none"}
                          stroke={wishlist[product.id] ? "#ff4d4d" : "#ccc"}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </span>
                    </div>
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
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white text-lg">Không có sản phẩm nào.</p>
          )}

          

        
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Hello;