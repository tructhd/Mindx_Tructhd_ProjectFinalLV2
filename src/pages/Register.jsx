import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Register = () => {
  const navigate = useNavigate();
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/hello");
    }
  }, [navigate]);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .matches(
        /^[^ \t\n\r]+$/i,
        "Email không được chứa khoảng trắng hoặc ký tự trắng ở bất kỳ vị trí nào"
      )
      .required("Bắt buộc"),
    password: Yup.string()
      .min(6, "Tối thiểu 6 ký tự")
      .matches(/^\S+$/, "Mật khẩu không được chứa dấu cách")
      .required("Bắt buộc"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
      .matches(/^\S+$/, "Mật khẩu xác nhận không được chứa dấu cách")
      .required("Bắt buộc"),
  });

  return (
    <div className="relative w-full h-screen">
      {/* Ảnh nền và lớp mờ */}
      <div className="absolute inset-0 bg-[url('https://static.asianpaints.com/content/dam/asianpaintsbeautifulhomes/gallery/living-room/modern-blue-living-room-with-golden-accents/modern-living-room-wall-design.jpg.transform/bh-image-gallery/image.webp')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black opacity-70 z-10" />

      <section className="relative z-20 flex flex-col md:flex-row items-center justify-center top-1/2 left-1/2 w-3/4 min-h-[400px] -translate-x-1/2 -translate-y-1/2 mt-2 rounded-lg bg-[url('https://static.asianpaints.com/content/dam/asianpaintsbeautifulhomes/gallery/living-room/modern-blue-living-room-with-golden-accents/modern-living-room-wall-design.jpg.transform/bh-image-gallery/image.webp')] bg-cover bg-center">
        <div className="relative z-10 flex flex-col items-center justify-center w-full md:w-1/2 px-6 py-8 backdrop-blur-[20px] rounded-lg order-1 md:order-1">
          <a
            href="/"
            className="fixed top-0 left-6 flex items-center gap-x-2 text-2xl font-bold text-white"
          >
            <img
              src="/images/bamora-logo.png"
              alt="Bamora Logo"
              className="h-32"
            />
          </a>
          <div className="w-full sm:max-w-md">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl mt-8 font-bold leading-tight tracking-tight text-white md:text-2xl">
                Tạo tài khoản
              </h1>

              {/* Formik Form */}
              <Formik
                initialValues={{
                  email: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                  const newUser = {
                    email: values.email,
                    password: values.password,
                    role: "user",
                  };

                  try {
                    const res = await fetch(
                      "https://mindx-mockup-server.vercel.app/api/resources/accountUser?apiKey=67fe68e3c590d6933cc124a4",
                      { cache: "no-store" }
                    );
                    if (!res.ok) {
                      throw new Error(
                        `Lỗi khi lấy danh sách người dùng: ${res.statusText}`
                      );
                    }
                    const data = await res.json();
                    console.log("Dữ liệu API trả về (Register):", data); // Debug danh sách user

                    // Kiểm tra cấu trúc dữ liệu trả về
                    const existingUsers = Array.isArray(data?.data?.data)
                      ? data.data.data
                      : Array.isArray(data?.data)
                      ? data.data
                      : [];

                    // Kiểm tra email trùng lặp với kiểm tra an toàn
                    const emailExists = existingUsers.some(
                      (user) =>
                        user?.email &&
                        typeof user.email === "string" &&
                        user.email.toLowerCase() === values.email.toLowerCase()
                    );

                    if (emailExists) {
                      setErrors({ email: "Email đã tồn tại!" });
                      setSubmitting(false);
                      return;
                    }

                    const response = await fetch(
                      "https://mindx-mockup-server.vercel.app/api/resources/accountUser?apiKey=67fe68e3c590d6933cc124a4",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(newUser),
                      }
                    );

                    if (!response.ok) {
                      throw new Error(
                        `Đăng ký thất bại: ${response.statusText}`
                      );
                    }

                    const responseData = await response.json();
                    console.log("Dữ liệu sau khi đăng ký:", responseData); // Debug dữ liệu sau POST

                    setRegisterSuccess(true);
                    setErrorMessage(null);
                    setTimeout(() => {
                      navigate("/login");
                    }, 1500);
                  } catch (error) {
                    console.error("❌ Lỗi khi đăng ký:", error);
                    setErrorMessage(`Đăng ký thất bại: ${error.message}`);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({
                  isSubmitting,
                  touched,
                  errors,
                  handleChange,
                  handleBlur,
                  values,
                }) => (
                  <Form className="space-y-4 md:space-y-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-white"
                      >
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
                        <div className="text-orange-500 text-sm min-h-[20px]">
                          {errors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Mật khẩu
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
                        <div className="text-orange-500 text-sm min-h-[20px]">
                          {errors.password}
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block mb-2 text-sm font-medium text-white"
                      >
                        Xác nhận mật khẩu
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-blue-400 focus:border-blue-400 block w-full p-2.5"
                        placeholder="••••••••"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.confirmPassword}
                      />
                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className="text-orange-500 text-sm min-h-[20px]">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg text-sm px-5 py-2.5 text-center hover:shadow-[0px_4px_15px_2px_rgba(173,216,230,0.5)] transition-colors duration-200"
                    >
                      {isSubmitting ? "Đang xử lý..." : "TẠO TÀI KHOẢN"}
                    </button>

                    {registerSuccess && (
                      <div className="text-green-400 mt-4 text-sm text-center">
                        Đăng ký thành công! Bạn sẽ được chuyển hướng...
                      </div>
                    )}
                    {errorMessage && (
                      <div className="text-orange-500 mt-4 text-sm text-center">
                        {errorMessage}
                      </div>
                    )}

                    <p className="text-sm font-light text-white mt-4">
                      Đã có tài khoản?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        Đăng nhập tại đây
                      </button>
                    </p>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>

        <div className="text-white bg-black/30 backdrop-blur-sm p-6 rounded-lg relative z-10 flex flex-col w-full md:w-1/2 py-12 px-4 text-center order-2 md:order-2">
          <h2 className="text-[3.5em] font-bold text-white">Xin chào!</h2>
          <h3 className="text-2xl text-white mt-2">
            đến với trang web của chúng tôi
          </h3>
          <p className="text-base text-white leading-relaxed mt-5 max-w-md mx-auto break-words px-4">
            Tạo nên một không gian sống hiện đại và tinh tế với những thiết kế
            nội thất cao cấp, sáng tạo và đầy cảm hứng.
          </p>
          <div className="mt-5 space-x-4 text-xl flex justify-center">
            <i className="fa-brands fa-instagram text-white hover:text-blue-400" />
            <i className="fa-brands fa-facebook text-white hover:text-blue-400" />
            <i className="fa-brands fa-twitter text-white hover:text-blue-400" />
            <i className="fa-brands fa-github text-white hover:text-blue-400" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
