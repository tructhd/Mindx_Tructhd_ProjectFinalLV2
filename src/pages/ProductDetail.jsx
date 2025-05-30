
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { fetchProducts } from "../api/productAPI";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  const parseCustomDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      return new Date(0);
    }
    if (dateStr.includes("thg")) {
      const months = {
        "thg 1": "Jan", "thg 2": "Feb", "thg 3": "Mar", "thg 4": "Apr",
        "thg 5": "May", "thg 6": "Jun", "thg 7": "Jul", "thg 8": "Aug",
        "thg 9": "Sep", "thg 10": "Oct", "thg 11": "Nov", "thg 12": "Dec",
      };
      const [day, month, year] = dateStr.split(", ");
      if (!day || !month || !year) {
        return new Date(0);
      }
      const monthKey = month.toLowerCase();
      const engDateStr = `${day.replace(/\D/g, "")} ${months[monthKey]} ${year}`;
      return new Date(engDateStr) || new Date(0);
    }
    return new Date(dateStr) || new Date(0);
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const result = await fetchProducts({ cache: "no-store" });
        console.log("API Result:", result);

        let productsList = [];
        if (Array.isArray(result)) {
          result.forEach((item) => {
            if (item && item.data && Array.isArray(item.data)) {
              const validProducts = item.data.filter(
                (product) =>
                  product &&
                  typeof product === "object" &&
                  product.id &&
                  product.name &&
                  product.status === "available"
              );
              productsList = productsList.concat(validProducts);
            }
          });
        }
        console.log("Products List:", productsList);

        const productMap = new Map();
        productsList.forEach((product) => {
          const existingProduct = productMap.get(product.id);
          if (!existingProduct) {
            productMap.set(product.id, product);
          } else {
            const existingDate = parseCustomDate(existingProduct.date);
            const newDate = parseCustomDate(product.date);
            if (newDate > existingDate) {
              productMap.set(product.id, product);
            }
          }
        });

        const uniqueProducts = Array.from(productMap.values());
        console.log("Unique Products:", uniqueProducts);

        const foundProduct = uniqueProducts.find((p) => p.id === id);
        console.log("Found Product:", foundProduct);
        if (foundProduct && foundProduct.status === "available") {
          setProduct(foundProduct);
        } else {
          setProduct(null);
        }

        const recent = [...uniqueProducts]
          .sort((a, b) => parseCustomDate(b.date) - parseCustomDate(a.date))
          .slice(0, 3);
        console.log("Recent Products:", recent);
        setRecentProducts(recent);

        // Logic cho sản phẩm tương tự
        const nameKeywords = foundProduct?.name?.toLowerCase().split(" ") || [];
        let similar = uniqueProducts.filter(
          (p) =>
            p.id !== id &&
            p.status === "available" &&
            nameKeywords.some((keyword) =>
              p.name.toLowerCase().includes(keyword)
            )
        ).slice(0, 6);

        // Fallback: Random nếu không đủ 6 sản phẩm
        if (similar.length < 6) {
          const otherProducts = uniqueProducts
            .filter(
              (p) => p.id !== id && p.status === "available" && !similar.includes(p)
            )
            .sort(() => Math.random() - 0.5); // Randomize
          similar = [...similar, ...otherProducts].slice(0, 6);
        }
        console.log("Related Products:", similar);
        setRelatedProducts(similar);

        // Mock đánh giá (vì không có API)
        setReviews([
          { id: 1, user: "Nguyen Van A", comment: "Sản phẩm chất lượng tốt!", rating: 4 },
          { id: 2, user: "Tran Thi B", comment: "Màu sắc đẹp, giao hàng nhanh!", rating: 5 },
        ]);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
        console.log("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const addToCart = () => {
    if (!product || product.status !== "available") {
      console.log("Không thể thêm sản phẩm không khả dụng vào giỏ hàng.");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Đã thêm vào giỏ hàng!");
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

  if (!product) {
    return (
      <>
        <Header />
        <div className="relative min-h-screen bg-gray-900 pt-20">
          <div className="absolute inset-0 bg-cover bg-center z-0" />
          <div className="absolute inset-0 bg-black opacity-70 z-10" />
          <div className="relative z-20 max-w-7xl mx-auto px-4 py-12 text-center">
            <p className="text-white text-lg">Sản phẩm không tồn tại hoặc không khả dụng.</p>
            <button
              onClick={() => navigate("/hello")}
              className="mt-4 bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
            >
              Quay lại
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-gray-900 pt-20">
        <div className="absolute inset-0 bg-cover bg-center z-0" />
        <div className="absolute inset-0 bg-black opacity-70 z-10" />
        <section className="relative z-20 max-w-7xl mx-auto px-4 py-12">
          <div className="lg:flex lg:gap-8">
            <div className="lg:w-1/2">
              {product.images && product.images.length > 0 ? (
                <Swiper
                  modules={[Pagination, Autoplay]}
                  spaceBetween={10}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  className="rounded-lg h-[400px] lg:h-[500px]"
                >
                  {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={
                          image ||
                          "https://via.placeholder.com/600x400?text=Image+Not+Found"
                        }
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/600x400?text=Image+Not+Found")
                        }
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <img
                  src="https://via.placeholder.com/600x400?text=No+Image+Available"
                  alt="No Image"
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              )}
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0 bg-gray-800 p-6 rounded-lg">
              <h1 className="text-2xl font-bold text-white">{product.name}</h1>
              <p className="text-3xl font-bold text-white mt-2">{product.price.toLocaleString()} ₫</p>
              <div className="flex items-center gap-2 mt-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13.8 4.2a2 2 0 0 0-3.6 0L8.4 8.4l-4.6.3a2 2 0 0 0-1.1 3.5l3.5 3-1 4.4c-.5 1.7 1.4 3 2.9 2.1l3.9-2.3 3.9 2.3c1.5 1 3.4-.4 3-2.1l-1-4.4 3.4-3a2 2 0 0 0-1.1-3.5l-4.6-.3-1.8-4.2Z" />
                  </svg>
                ))}
                <a href="#reviews" className="text-sm text-blue-400 hover:underline">
                  {reviews.length} Reviews
                </a>
              </div>
              <p className="text-gray-300 mt-4">
                {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
              <button
                onClick={addToCart}
                className="mt-6 bg-blue-400 text-white px-6 py-3 rounded-lg hover:bg-blue-500 flex items-center"
                disabled={product.status !== "available"}
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>

          <div className="mt-12">
            <h4 className="text-xl font-bold text-white mb-4">Sản phẩm gần đây</h4>
            {recentProducts.length > 0 ? (
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="pb-12"
              >
                {recentProducts.map((p) => (
                  <SwiperSlide key={p.id}>
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <img
                        src={
                          p.images?.[0] ||
                          "https://via.placeholder.com/300x200?text=Image+Not+Found"
                        }
                        alt={p.name}
                        className="w-full h-48 object-cover"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/300x200?text=Image+Not+Found")
                        }
                      />
                      <div className="p-4">
                        <h5 className="text-lg font-bold text-white">{p.name}</h5>
                        <p className="text-white">{p.price.toLocaleString()} ₫</p>
                        <button
                          onClick={() => navigate(`/product/${p.id}`)}
                          className="mt-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p className="text-white">Không có sản phẩm gần đây.</p>
            )}
          </div>

          <div className="mt-12">
            <h4 className="text-xl font-bold text-white mb-4">Sản phẩm tương tự</h4>
            {relatedProducts.length > 0 ? (
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="pb-12"
              >
                {relatedProducts.map((p) => (
                  <SwiperSlide key={p.id}>
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <img
                        src={
                          p.images?.[0] ||
                          "https://via.placeholder.com/300x200?text=Image+Not+Found"
                        }
                        alt={p.name}
                        className="w-full h-48 object-cover"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/300x200?text=Image+Not+Found")
                        }
                      />
                      <div className="p-4">
                        <h5 className="text-lg font-bold text-white">{p.name}</h5>
                        <p className="text-white">{p.price.toLocaleString()} ₫</p>
                        <button
                          onClick={() => navigate(`/product/${p.id}`)}
                          className="mt-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p className="text-white">Không có sản phẩm tương tự.</p>
            )}
          </div>

          <div className="mt-12" id="reviews">
            <h4 className="text-xl font-bold text-white mb-4">Đánh giá và Feedback</h4>
            {reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li key={review.id} className="bg-gray-800 p-4 rounded-lg">
                    <p className="font-bold text-white">{review.user}</p>
                    <p className="text-gray-300">{review.comment}</p>
                    <p className="text-yellow-400">
                      {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white">Chưa có đánh giá nào.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductDetail;
