// src/app/register/register.interface.ts
// Định nghĩa cấu trúc dữ liệu cho yêu cầu đăng ký gửi đến backend
// Cấu trúc này nên khớp với RegisterRequest DTO ở backend của bạn

export interface RegisterData {
    username: string;
    password: string;
    email: string;
    phoneNumber: string; // Dấu ? biểu thị thuộc tính này là tùy chọn (có thể null)
    firstName: string;
    lastName: string;
    dateOfBirth: string | Date; // Có thể là string (từ input type="date") hoặc Date object
    gender: boolean | null; // true/false/null
    country: string;
    street: string;
    ward: string;
    district: string;
    city: string;
}

// Bạn cũng có thể định nghĩa interface cho response từ backend nếu cần
// Ví dụ:
// export interface RegisterResponse {
//   message: string; // Ví dụ: "User registered successfully."
// }

// Hoặc nếu backend trả về lỗi cụ thể hơn:
export interface RegisterErrorResponse {
    errorMessage: string; // Từ RegisterResult.ErrorMessage
}
