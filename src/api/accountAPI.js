// Hàm bất đồng bộ để fetch danh sách tài khoản từ mock API
export const fetchAccounts = async () => {
    try {
        // Gọi API bằng phương thức GET đến endpoint mock với API key
        const response = await fetch("https://mindx-mockup-server.vercel.app/api/resources/accountUser?apiKey=67fe68e3c590d6933cc124a4");


        // Nếu phản hồi không thành công (status khác 200-299), ném lỗi
        if (!response.ok) throw new Error("Không thể lấy dữ liệu");


        // Parse phản hồi JSON thành JavaScript object
        const result = await response.json();


        // In kết quả thô từ API ra console để debug
        console.log("🐞 Raw result from API:", result);


        // Trả về mảng dữ liệu người dùng nằm trong result.data.data
        // Do mock API lồng dữ liệu như: { data: { data: [...] } }
        return result.data.data;
    } catch (error) {
        // Bắt lỗi nếu gọi API hoặc parse JSON thất bại
        console.error("Lỗi khi gọi API:", error);


        // Trả về mảng rỗng để tránh ứng dụng bị crash
        return [];
    }
};