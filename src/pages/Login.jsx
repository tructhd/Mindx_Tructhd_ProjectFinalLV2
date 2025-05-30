import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/hello");
    }
  }, [navigate]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .matches(/^\S*$/, "Email không được chứa dấu cách")
      .required("Bắt buộc"),
    password: Yup.string()
      .matches(/^\S*$/, "Mật khẩu không được chứa dấu cách")
      .required("Bắt buộc"),
  });

  const fetchAccounts = async () => {
    try {
      const response = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/accountUser?apiKey=67fe68e3c590d6933cc124a4",
        { cache: "no-store" }
      );
      if (!response.ok) {
        throw new Error(`Lỗi khi lấy danh sách tài khoản: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Dữ liệu API trả về (Login):", data); // Debug dữ liệu API
      const accounts = Array.isArray(data?.data?.data)
        ? data.data.data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      console.log("Dữ liệu tài khoản (Login):", accounts); // Debug danh sách tài khoản
      return accounts;
    } catch (error) {
      console.error("Lỗi khi lấy tài khoản:", error);
      throw error;
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('https://static.asianpaints.com/content/dam/asianpaintsbeautifulhomes/gallery/living-room/modern-blue-living-room-with-golden-accents/modern-living-room-wall-design.jpg.transform/bh-image-gallery/image.webp')] bg-cover bg-center z-0"></div>
      <div className="absolute inset-0 bg-black opacity-70 z-10"></div>

      <section className="relative z-20 flex flex-col md:flex-row items-center justify-center top-1/2 left-1/2 w-3/4 min-h-[400px] -translate-x-1/2 -translate-y-1/2 mt-2 rounded-lg bg-[url('https://static.asianpaints.com/content/dam/asianpaintsbeautifulhomes/gallery/living-room/modern-blue-living-room-with-golden-accents/modern-living-room-wall-design.jpg.transform/bh-image-gallery/image.webp')] bg-center bg-cover">
        <div className="text-white bg-black/30 backdrop-blur-sm p-6 rounded-lg relative z-10 flex flex-col w-full md:w-1/2 py-12 px-4 text-center order-2 md:order-1">
          <h2 className="text-[3.5em] font-bold text-white">Xin chào!</h2>
          <h3 className="text-2xl text-white mt-2">đến với trang web của chúng tôi</h3>
          <p className="text-base text-white leading-relaxed mt-5 max-w-md mx-auto break-words px-4">
          Tạo nên một không gian sống hiện đại và tinh tế với những thiết kế nội thất cao cấp, sáng tạo và đầy cảm hứng.
          </p>
          <div className="mt-5 space-x-4 text-xl flex justify-center">
            <i className="fa-brands fa-instagram text-white hover:text-blue-400"></i>
            <i className="fa-brands fa-facebook text-white hover:text-blue-400"></i>
            <i className="fa-brands fa-twitter text-white hover:text-blue-400"></i>
            <i className="fa-brands fa-github text-white hover:text-blue-400"></i>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full md:w-1/2 px-6 py-8 backdrop-blur-[20px] rounded-lg order-1 md:order-2">
          <a
            href="/"
            className="fixed top-0 left-6 flex items-center gap-x-2 text-2xl font-bold text-white"
          >
            <img src="/images/bamora-logo.png"
              alt="Bamora Logo"
              className="h-32"/>
            
          </a>
          <div className="w-full sm:max-w-md">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl mt-8 font-bold leading-tight tracking-tight text-white md:text-2xl">
              Đăng nhập vào tài khoản của bạn
              </h1>

              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setErrors, setSubmitting }) => {
                  try {
                    const accounts = await fetchAccounts();
                    console.log("Dữ liệu tài khoản (Login):", accounts); // Debug danh sách tài khoản

                    // Kiểm tra tài khoản với điều kiện an toàn
                    const user = accounts.find(
                      (acc) =>
                        acc?.email &&
                        typeof acc.email === "string" &&
                        acc.email.toLowerCase() === values.email.toLowerCase() &&
                        acc.password === values.password
                    );

                    if (user) {
                      localStorage.setItem("user", JSON.stringify(user));
                      localStorage.setItem("isLoggedIn", "true");
                      if (user.role === "admin") {
                        navigate("/admin/products");
                      } else {
                        navigate("/hello");
                      }
                    } else {
                      setErrors({ email: "Sai thông tin đăng nhập" });
                    }
                  } catch (error) {
                    console.error("Lỗi khi xác thực:", error);
                    setErrors({ email: "Có lỗi xảy ra khi đăng nhập: " + error.message });
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, touched, errors, handleChange, handleBlur, values }) => (
                  <Form className="space-y-4 md가족-y-6">
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                        Email của bạn
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-blue-400 focus:border-blue-400 block w-full p-2.5"
                        placeholder="name@gmail.com"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                      />
                      {touched.email && errors.email && (
                        <div className="text-orange-500 text-sm min-h-[20px]">{errors.email}</div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                        Mật Khẩu
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-blue-400 focus:border-blue-400 block w-full p-2.5"
                        placeholder="••••••••"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                      />
                      {touched.password && errors.password && (
                        <div className="text-orange-500 text-sm min-h-[20px]">{errors.password}</div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg text-sm px-5 py-2.5 text-center hover:shadow-[0px_4px_15px_2px_rgba(173,216,230,0.5)] transition-colors duration-200"
                    >
                      {isSubmitting ? "Đang xử lý..." : "ĐĂNG NHẬP"}
                    </button>
                    <p className="text-sm font-light text-white">
                    Chưa có tài khoản?{" "}
                      <a href="/register" className="font-medium text-blue-400 hover:underline">
                        Đăng ký
                      </a>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;