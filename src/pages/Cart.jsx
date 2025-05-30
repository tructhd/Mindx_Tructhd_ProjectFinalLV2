import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (id, quantity) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toLocaleString();
  };

  if (!cartItems.length && !isLoading) {
    return (
      <>
        <Header />
        <div className="relative min-h-screen bg-gray-900 pt-20">
          <div className="absolute inset-0  bg-cover bg-center z-0" />
          <div className="absolute inset-0 bg-black opacity-70 z-10" />
          <div className="relative z-20 max-w-7xl mx-auto px-4 py-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-6">Giỏ hàng của bạn</h3>
            <p className="text-white text-lg">Giỏ hàng trống.</p>
            <button
              onClick={() => navigate("/hello")}
              className="mt-4 bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
            >
              Quay lại mua sắm
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
        <div className="absolute inset-0  bg-cover bg-center z-0" />
        <div className="absolute inset-0 bg-black opacity-70 z-10" />
        <section className="relative z-20 max-w-7xl mx-auto px-4 py-12">
          <h3 className="text-3xl font-bold text-white text-center mb-6">
            Giỏ hàng của bạn
          </h3>
          {isLoading ? (
            <div className="text-center">
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
          ) : (
            <>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                    <img
                      src={
                        item.images[0] ||
                        "https://via.placeholder.com/100?text=Default+Image"
                      }
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/100?text=Image+Not+Found")
                      }
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{item.name}</h4>
                      <p className="text-white">{item.price.toLocaleString()} ₫</p>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, parseInt(e.target.value))
                          }
                          min="1"
                          className="w-16 p-2 bg-gray-700 text-white border border-gray-600 rounded text-center"
                        />
                        <p className="text-white">
                          Thành tiền: {(item.price * item.quantity).toLocaleString()} ₫
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-right">
                <p className="text-2xl font-bold text-white">Tổng tiền: {getTotal()} ₫</p>
                <button
                  onClick={() => navigate("/checkout")}
                  className="mt-4 bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
                >
                  Thanh toán
                </button>
              </div>
            </>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Cart;