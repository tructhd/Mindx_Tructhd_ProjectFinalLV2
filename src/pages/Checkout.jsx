import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const getTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toLocaleString();
  };

  const handleCheckout = () => {
    if (
      !shippingInfo.fullName ||
      !shippingInfo.address ||
      !shippingInfo.phone
    ) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      alert("Thanh toán thành công! Cảm ơn bạn đã mua hàng.");
      localStorage.removeItem("cart");
      setCartItems([]);
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };

  if (!cartItems.length && !isLoading) {
    return (
      <>
        <Header />
        <div className="relative min-h-screen bg-gray-900 pt-20">
          <div className="absolute inset-0 bg-cover bg-center z-0" />
          <div className="absolute inset-0 bg-black opacity-70 z-10" />
          <div className="relative z-20 max-w-7xl mx-auto px-4 py-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-6">Thanh toán</h3>
            <p className="text-white text-lg">Giỏ hàng trống.</p>
            <button
              onClick={() => navigate("/")}
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
          <h3 className="text-3xl font-bold text-white text-center mb-6">Thanh toán</h3>
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
              <p className="mt-2 text-white">Đang xử lý...</p>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
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
                      <p className="text-white">Giá: {item.price.toLocaleString()} ₫</p>
                      <p className="text-white">Số lượng: {item.quantity}</p>
                      <p className="text-white">
                        Thành tiền: {(item.price * item.quantity).toLocaleString()} ₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-xl font-bold text-white mb-4">Thông tin giao hàng</h4>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={shippingInfo.fullName}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded"
                />
                <input
                  type="text"
                  placeholder="Địa chỉ"
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      address: e.target.value,
                    })
                  }
                  className="w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded"
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                  className="w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded"
                />
                <div className="text-right">
                  <p className="text-xl font-bold text-white mb-4">
                    Tổng tiền: {getTotal()} ₫
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
                  >
                    Xác nhận thanh toán
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default Checkout;