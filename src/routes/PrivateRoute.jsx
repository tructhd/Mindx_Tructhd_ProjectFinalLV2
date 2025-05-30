import { Navigate, Outlet } from "react-router-dom";


const PrivateRoute = ({ requiredRole }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user"));


  // Nếu chưa đăng nhập
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }


  // Nếu có yêu cầu role, nhưng user không đúng role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }


  // Nếu hợp lệ → cho vào
  return <Outlet />;
};


export default PrivateRoute;