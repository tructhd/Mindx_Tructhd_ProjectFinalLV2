// Import các thành phần từ react-router-dom để định nghĩa routing
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


// Import các trang cụ thể
import Register from "./pages/Register";
import Login from "./pages/Login";
import Hello from "./pages/Hello";
import Unauthorized from "./pages/Unauthorized";
import AdminProduct from "./pages/admin/AdminProduct";
import Cart from "./pages/Cart"; // Thêm import cho trang Cart
import ProductDetail from "./pages/ProductDetail"; // Thêm import cho trang ProductDetail
import Checkout from "./pages/Checkout"; // Thêm import cho trang Checkout
import Wishlist from "./pages/Wishlist";


// Import component dùng để bảo vệ route
import PrivateRoute from "./routes/PrivateRoute";


// Component chính của ứng dụng
function App() {
  return (
    // Bọc toàn bộ app trong Router để kích hoạt hệ thống định tuyến
    <Router>
      <Routes>
        {/* 🌐 Các route công khai (không yêu cầu đăng nhập) */}
        <Route path="/" element={<Login />} />{" "}
        {/* Trang chủ mặc định là login */}
        <Route path="/login" element={<Login />} /> {/* Trang đăng nhập */}
        <Route path="/register" element={<Register />} /> {/* Trang đăng ký */}
        <Route path="/unauthorized" element={<Unauthorized />} />{" "}
        {/* Trang báo lỗi không đủ quyền */}
        {/* 🔐 Các route chỉ dành cho user đã đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/hello" element={<Hello />} />{" "}
          <Route path="/wishlist" element={<Wishlist />} />
          {/* Trang user sau khi đăng nhập */}
          <Route path="/cart" element={<Cart />} /> Trang giỏ hàng
          <Route path="/product/:id" element={<ProductDetail />} />{" "}
          {/* Trang chi tiết sản phẩm với ID động */}
          <Route path="/checkout" element={<Checkout />} />{" "}
          {/* Trang thanh toán */}
        </Route>
        {/* 🔐 Các route chỉ dành cho admin */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          {/* Khi truy cập /admin → điều hướng tới /admin/products */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/products" replace />}
          />
          {/* Trang quản lý sản phẩm dành riêng cho admin */}
          <Route path="/admin/products" element={<AdminProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}


export default App;