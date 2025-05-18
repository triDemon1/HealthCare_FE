export interface UpdateUserProfile {
  // Các trường từ USER được phép cập nhật
  email: string | null;
  phoneNumber: string | null;

  // Các trường từ CUSTOMER được phép cập nhật
  firstName: string; // Bắt buộc theo backend DTO mới
  lastName: string | null;
  dateOfBirth: string | null; // string 'yyyy-MM-dd' từ input type="date" hoặc null
  gender: boolean | null;
}