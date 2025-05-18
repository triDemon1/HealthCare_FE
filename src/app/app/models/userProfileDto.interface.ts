export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  createdAt: string | null; // datetime
  updatedAt: string | null; // datetime
  // Các trường khác từ UserAdminDto không có ở đây: IsActive, RoleId, RoleName, Staff, StaffId


  // Thông tin từ Customer (lồng vào)
  customer: CustomerProfileDetail | null;
}

export interface CustomerProfileDetail {
  customerId: number;
  firstName: string;
  lastName: string | null;
  dateOfBirth: string | null; // datetime string (ISO 8601)
  gender: boolean | null; // true: Male, false: Female, null: Unspecified
  createdAt: string | null; // datetime
  updatedAt: string | null; // datetime
   // Các trường khác của Customer không có ở đây
}