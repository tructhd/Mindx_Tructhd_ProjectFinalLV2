import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-xl z-50">
      <div className="flex justify-between items-center mx-auto max-w-7xl px-4 py-0">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <a href="/" className="flex items-center space-x-2">
            <img
              src="/images/bamora-logo.png"
              alt="Bamora Logo"
              className="h-32"
            />
          </a>
        </div>

        {/* Search, Icons, Avatar */}
        <div className="flex items-center space-x-4">
          

          {/* Icons */}
          <Heart
            className="w-6 h-6 text-white hover:text-blue-400 hover:scale-110 transition-transform cursor-pointer"
            onClick={() => navigate("/wishlist")} // Chuyển hướng đến wishlist
          />
          <ShoppingCart
            className="w-6 h-6 text-white hover:text-blue-400 hover:scale-110 transition-transform cursor-pointer"
            onClick={() => navigate("/cart")}
          />

          {/* Avatar */}
          {user && (
            <div className="relative">
              <button
                type="button"
                className="flex text-sm rounded-full focus:ring-2 focus:ring-blue-400"
                onClick={() => {
                  const dropdown = document.getElementById("user-dropdown");
                  dropdown.classList.toggle("hidden");
                }}
              >
                <img
                  className="w-8 h-8 rounded-full border-2 border-blue-400 hover:animate-spin-slow"
                  src="https://t3.ftcdn.net/jpg/02/50/27/14/360_F_250271442_s1JYQbkJXr4yypcZ2ZTk2xEqkTnE85Zr.jpg"
                  alt="user"
                />
              </button>
              <div
                id="user-dropdown"
                className="hidden absolute right-0 mt-2 w-48 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 animate-fade-in"
              >
                <div className="px-4 py-3 text-sm">
                  <div className="font-bold">{user.fullName}</div>
                  <div className="truncate">{user.email}</div>
                </div>
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-gray-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </nav>
  );
};

export default Header;