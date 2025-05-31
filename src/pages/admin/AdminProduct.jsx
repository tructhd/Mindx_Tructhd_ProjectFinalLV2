
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, Trash2 } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Header from "../../components/Header";
import { fetchProducts } from "../../api/productAPI";

const AdminProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // State cho form thêm mới
  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    images: "",
    price: "",
    description: "",
  });

  // State cho form chỉnh sửa
  const [editProduct, setEditProduct] = useState({
    id: "",
    name: "",
    images: "",
    price: "",
    description: "",
  });

  const parseCustomDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      return new Date(0);
    }
    if (dateStr.includes("thg")) {
      const months = {
        "thg 1": "Jan",
        "thg 2": "Feb",
        "thg 3": "Mar",
        "thg 4": "Apr",
        "thg 5": "May",
        "thg 6": "Jun",
        "thg 7": "Jul",
        "thg 8": "Aug",
        "thg 9": "Sep",
        "thg 10": "Oct",
        "thg 11": "Nov",
        "thg 12": "Dec",
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

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const result = await fetchProducts();
      let productsList = [];
      if (Array.isArray(result)) {
        result.forEach((item) => {
          if (item && item.data && Array.isArray(item.data)) {
            const validProducts = item.data.filter(
              (product) =>
                product &&
                typeof product === "object" &&
                product.id &&
                product.name
            );
            productsList = [...productsList, ...validProducts];
          }
        });
      }
      const uniqueProducts = Array.from(
        new Map(productsList.map((item) => [item.id, item])).values()
      );
      setProducts(uniqueProducts);
      setFilteredProducts(uniqueProducts);

      const unavailableProducts = uniqueProducts
        .filter((product) => product.status === "unavailable")
        .map((product) => product.id);
      localStorage.setItem(
        "unavailableProducts",
        JSON.stringify(unavailableProducts)
      );
    } catch (error) {
      console.error("Không thể tải danh sách sản phẩm:", error);
      console.log(`Không thể tải danh sách sản phẩm: ${error.message}`);
      setProducts([]);
      setFilteredProducts([]);
      setDisplayedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let updatedProducts = [...products];

    if (searchTerm) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      updatedProducts = updatedProducts.filter(
        (product) => product.status === statusFilter
      );
    }

    if (sortOption) {
      updatedProducts.sort((a, b) => {
        if (sortOption === "price-asc") return a.price - b.price;
        else if (sortOption === "price-desc") return b.price - a.price;
        else if (sortOption === "date-asc")
          return parseCustomDate(a.date) - parseCustomDate(b.date);
        else if (sortOption === "date-desc")
          return parseCustomDate(b.date) - parseCustomDate(a.date);
        return 0;
      });
    }

    setFilteredProducts(updatedProducts);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption, products]);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
    setDisplayedProducts(currentItems);
  }, [filteredProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userData = localStorage.getItem("user");

    if (isLoggedIn !== "true" || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      navigate("/hello");
      return;
    }

    loadProducts();
  }, [navigate]);

  const handleSoftDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn thay đổi trạng thái sản phẩm này không?")) {
      return;
    }

    setIsLoading(true);
    const updatedProducts = products.map((item) =>
      item.id === id ? { ...item, status: "unavailable" } : item
    );
    setProducts(updatedProducts);

    try {
      const response = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/productList?apiKey=67fe68e3c590d6933cc124a4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: updatedProducts }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi từ server: " + response.statusText);
      }

      await loadProducts();
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái sản phẩm:", error);
      console.log(`Thay đổi trạng thái thất bại: ${error.message}`);
      setProducts(products);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDeleteAllProducts = async () => {
    if (!window.confirm("Bạn có chắc muốn thay đổi trạng thái tất cả sản phẩm không?")) {
      return;
    }

    setIsLoading(true);
    const updatedProducts = products.map((item) => ({
      ...item,
      status: "unavailable",
    }));
    setProducts(updatedProducts);

    try {
      const response = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/productList?apiKey=67fe68e3c590d6933cc124a4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: updatedProducts }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi từ server: " + response.statusText);
      }

      await loadProducts();
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái tất cả sản phẩm:", error);
      console.log(`Thay đổi trạng thái tất cả thất bại: ${error.message}`);
      setProducts(products);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageInputChange = (value, isEdit = false) => {
    const images = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setImagePreviews(images);
    if (isEdit) {
      setEditProduct((prev) => ({ ...prev, images: value }));
    } else {
      setNewProduct((prev) => ({ ...prev, images: value }));
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.id || !newProduct.name || !newProduct.price || !newProduct.images || !newProduct.description) {
      console.log("Vui lòng nhập đầy đủ thông tin: ID, Tên, Giá, URL ảnh, và Mô tả.");
      return;
    }

    const images = newProduct.images
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (images.length === 0) {
      console.log("Vui lòng nhập ít nhất một URL ảnh hợp lệ.");
      return;
    }

    setIsLoading(true);
    const productToAdd = {
      id: newProduct.id,
      name: newProduct.name,
      images,
      price: parseInt(newProduct.price),
      description: newProduct.description,
      date: new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "available",
    };

    try {
      const currentResult = await fetchProducts();
      let currentProducts = [];
      if (Array.isArray(currentResult)) {
        currentResult.forEach((item) => {
          if (item && item.data && Array.isArray(item.data)) {
            const validProducts = item.data.filter(
              (product) =>
                product &&
                typeof product === "object" &&
                product.id &&
                product.name
            );
            currentProducts = [...currentProducts, ...validProducts];
          }
        });
      }

      const uniqueCurrentProducts = Array.from(
        new Map(currentProducts.map((item) => [item.id, item])).values()
      );

      const isIdExists = uniqueCurrentProducts.some(
        (product) => product.id === newProduct.id
      );
      if (isIdExists) {
        console.log("Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.");
        setIsLoading(false);
        return;
      }

      const updatedProducts = [...uniqueCurrentProducts, productToAdd];

      const response = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/productList?apiKey=67fe68e3c590d6933cc124a4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: updatedProducts }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi từ server: " + response.statusText);
      }

      await loadProducts();
      setShowAddModal(false);
      setImagePreviews([]);
      setNewProduct({ id: "", name: "", images: "", price: "", description: "" });
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      console.log("Thêm thất bại. Thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    if (product.status === "unavailable") {
      console.log("Không thể chỉnh sửa sản phẩm có trạng thái 'unavailable'.");
      return;
    }
    setEditingProduct(product);
    setEditProduct({
      id: product.id,
      name: product.name,
      images: product.images.join(", "),
      price: product.price.toString(),
      description: product.description || "",
    });
    setImagePreviews(product.images);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct.id || !editProduct.name || !editProduct.price || !editProduct.images || !editProduct.description) {
      console.log("Vui lòng nhập đầy đủ thông tin: ID, Tên, Giá, URL ảnh, và Mô tả.");
      return;
    }

    const images = editProduct.images
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (images.length === 0) {
      console.log("Vui lòng nhập ít nhất một URL ảnh hợp lệ.");
      return;
    }

    setIsLoading(true);
    const updatedProduct = {
      id: editProduct.id,
      name: editProduct.name,
      images,
      price: parseInt(editProduct.price),
      description: editProduct.description,
      date: editingProduct.date,
      status: "available",
    };

    try {
      const currentResult = await fetchProducts();
      let currentProducts = [];
      if (Array.isArray(currentResult)) {
        currentResult.forEach((item) => {
          if (item && item.data && Array.isArray(item.data)) {
            const validProducts = item.data.filter(
              (product) =>
                product &&
                typeof product === "object" &&
                product.id &&
                product.name
            );
            currentProducts = [...currentProducts, ...validProducts];
          }
        });
      }

      const uniqueCurrentProducts = Array.from(
        new Map(currentProducts.map((item) => [item.id, item])).values()
      );

      const isIdExists = uniqueCurrentProducts.some(
        (product) => product.id === editProduct.id && product.id !== editingProduct.id
      );
      if (isIdExists) {
        console.log("Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.");
        setIsLoading(false);
        return;
      }

      const updatedProducts = uniqueCurrentProducts.map((product) =>
        product.id === editingProduct.id ? updatedProduct : product
      );

      const response = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/productList?apiKey=67fe68e3c590d6933cc124a4",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: updatedProducts }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi từ server: " + response.statusText);
      }

      await loadProducts();
      setShowEditModal(false);
      setImagePreviews([]);
      setEditProduct({ id: "", name: "", images: "", price: "", description: "" });
      setEditingProduct(null);
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa sản phẩm:", error);
      console.log(`Chỉnh sửa thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-gray-900 pt-20">
        <div className="absolute inset-0 bg-cover bg-center z-0" />
        <div className="absolute inset-0 bg-black opacity-70 z-10" />
        <section className="relative z-20 max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-white">Quản lý sản phẩm</h2>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleSoftDeleteAllProducts}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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
                    Đang xử lý...
                  </span>
                ) : (
                  "🗑 Xóa tất cả"
                )}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
                disabled={isLoading}
              >
                + Thêm mới
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 bg-gray-700 text-white border border-gray-600 rounded w-full sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
            >
              <option value="">Không sắp xếp</option>
              <option value="price-asc">Giá: Tăng dần</option>
              <option value="price-desc">Giá: Giảm dần</option>
              <option value="date-asc">Ngày: Cũ nhất</option>
              <option value="date-desc">Ngày: Mới nhất</option>
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          {filteredProducts.length === 0 && searchTerm ? (
            <p className="text-center text-white text-lg">
              Sản phẩm bạn tìm kiếm không tồn tại
            </p>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-white font-semibold">Chọn</th>
                    <th className="p-3 text-left text-white font-semibold">ID</th>
                    <th className="p-3 text-left text-white font-semibold">Tên</th>
                    <th className="p-3 text-left text-white font-semibold">Mô tả</th>
                    <th className="p-3 text-left text-white font-semibold">Ngày</th>
                    <th className="p-3 text-left text-white font-semibold">Giá</th>
                    <th className="p-3 text-left text-white font-semibold">Trạng thái</th>
                    <th className="p-3 text-left text-white font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {displayedProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-700">
                      <td className="p-3">
                        <input type="checkbox" className="h-4 w-4 text-blue-400" />
                      </td>
                      <td className="p-3 text-blue-400 font-medium">{item.id || "N/A"}</td>
                      <td className="p-3 flex items-center space-x-3">
                        <div className="w-24 h-24">
                          <Swiper
                            modules={[Autoplay]}
                            autoplay={{ delay: 2000, disableOnInteraction: false }}
                            loop={Array.isArray(item.images) && item.images.length > 1}
                            className="rounded-md overflow-hidden h-full"
                          >
                            {Array.isArray(item.images) &&
                              item.images.map((img, idx) => (
                                <SwiperSlide key={idx}>
                                  <img
                                    src={img}
                                    alt={item.name || "Product image"}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                </SwiperSlide>
                              ))}
                          </Swiper>
                        </div>
                        <span className="font-bold text-white">{item.name || "N/A"}</span>
                      </td>
                      <td className="p-3 text-white">{item.description || "N/A"}</td>
                      <td className="p-3 text-white">{item.date || "N/A"}</td>
                      <td className="p-3 text-white">
                        {typeof item.price === "number" ? item.price.toLocaleString() : "N/A"} ₫
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded font-semibold ${
                            item.status === "available"
                              ? "text-green-400 bg-green-900"
                              : "text-red-400 bg-red-900"
                          }`}
                        >
                          {item.status === "available" ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="p-3 flex items-center space-x-2">
                        <Pencil
                          className="w-4 h-4 text-blue-400 cursor-pointer"
                          onClick={() => handleEditProduct(item)}
                          style={{
                            cursor: item.status === "unavailable" ? "not-allowed" : "pointer",
                            opacity: item.status === "unavailable" ? 0.5 : 1,
                          }}
                        />
                        
                        <Trash2
                          className="w-4 h-4 text-red-400 cursor-pointer"
                          onClick={
                            item.status === "unavailable"
                              ? undefined
                              : () => handleSoftDeleteProduct(item.id)
                          }
                          style={{
                            cursor: isLoading || item.status === "unavailable" ? "not-allowed" : "pointer",
                            opacity: isLoading || item.status === "unavailable" ? 0.5 : 1,
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Card layout cho mobile */}
          <div className="md:hidden space-y-4">
            {displayedProducts.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24">
                    <Swiper
                      modules={[Autoplay]}
                      autoplay={{ delay: 2000, disableOnInteraction: false }}
                      loop={Array.isArray(item.images) && item.images.length > 1}
                      className="rounded-md overflow-hidden h-full"
                    >
                      {Array.isArray(item.images) &&
                        item.images.map((img, idx) => (
                          <SwiperSlide key={idx}>
                            <img
                              src={img}
                              alt={item.name || "Product image"}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{item.name || "N/A"}</h4>
                    <p className="text-white">ID: {item.id || "N/A"}</p>
                    <p className="text-white">Mô tả: {item.description || "N/A"}</p>
                    <p className="text-white">Ngày: {item.date || "N/A"}</p>
                    <p className="text-white">
                      Giá: {typeof item.price === "number" ? item.price.toLocaleString() : "N/A"} ₫
                    </p>
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        item.status === "available"
                          ? "text-green-400 bg-green-900"
                          : "text-red-400 bg-red-900"
                      }`}
                    >
                      {item.status === "available" ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Pencil
                    className="w-4 h-4 text-blue-400 cursor-pointer"
                    onClick={() => handleEditProduct(item)}
                    style={{
                      cursor: item.status === "unavailable" ? "not-allowed" : "pointer",
                      opacity: item.status === "unavailable" ? 0.5 : 1,
                    }}
                  />
                  <Eye className="w-4 h-4 text-gray-400 cursor-pointer" />
                  <Trash2
                    className="w-4 h-4 text-red-400 cursor-pointer"
                    onClick={
                      item.status === "unavailable"
                        ? undefined
                        : () => handleSoftDeleteProduct(item.id)
                    }
                    style={{
                      cursor: isLoading || item.status === "unavailable" ? "not-allowed" : "pointer",
                      opacity: isLoading || item.status === "unavailable" ? 0.5 : 1,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length > 0 && (
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-500"
              >
                Trang trước
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded ${
                      currentPage === number
                        ? "bg-blue-400 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-500"
              >
                Trang sau
              </button>
            </div>
          )}
        </section>
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white space-y-4">
              <h2 className="text-xl font-bold">Thêm sản phẩm mới</h2>
              <input
                type="text"
                placeholder="ID"
                value={newProduct.id}
                onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <input
                type="text"
                placeholder="Tên sản phẩm"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <input
                type="text"
                placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
                value={newProduct.images}
                onChange={(e) => handleImageInputChange(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-24 h-24 object-cover rounded"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found")
                    }
                  />
                ))}
              </div>
              <input
                type="number"
                placeholder="Giá (VNĐ)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <textarea
                placeholder="Mô tả sản phẩm"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <input
                type="text"
                disabled
                value={new Date().toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                className="w-full p-2 bg-gray-600 border border-gray-600 rounded cursor-not-allowed"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setImagePreviews([]);
                    setNewProduct({ id: "", name: "", images: "", price: "", description: "" });
                  }}
                  className="px-4 py-2 bg-gray-600 text-orange-500 rounded hover:bg-gray-500"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                      Đang thêm...
                    </span>
                  ) : (
                    "Thêm"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white space-y-4">
              <h2 className="text-xl font-bold">Chỉnh sửa sản phẩm</h2>
              <input
                type="text"
                placeholder="ID"
                value={editProduct.id}
                onChange={(e) => setEditProduct({ ...editProduct, id: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <input
                type="text"
                placeholder="Tên sản phẩm"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <input
                type="text"
                placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
                value={editProduct.images}
                onChange={(e) => handleImageInputChange(e.target.value, true)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`preview-${idx}`}
                    className="w-24 h-24 object-cover rounded"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found")
                    }
                  />
                ))}
              </div>
              <input
                type="number"
                placeholder="Giá (VNĐ)"
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <textarea
                placeholder="Mô tả sản phẩm"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
              <input
                type="text"
                disabled
                value={editingProduct.date}
                className="w-full p-2 bg-gray-600 border border-gray-600 rounded cursor-not-allowed"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setImagePreviews([]);
                    setEditProduct({ id: "", name: "", images: "", price: "", description: "" });
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-orange-500 rounded hover:bg-gray-500"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateProduct}
                  className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
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
                      Đang cập nhật...
                    </span>
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProduct;
