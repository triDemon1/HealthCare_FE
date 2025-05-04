export interface CustomerAdminDetailDto {
    customerId: number;
    firstName: string;
    lastName?: string;
    dateOfBirth?: string; // Date as string
    gender?: boolean; // true for Male, false for Female
    createdAt: string; // Date/time as string
    updatedAt?: string; // Date/time as string
}

// DTO cho thông tin chi tiết Staff (khi nhận về cùng UserAdminDto)
export interface StaffAdminDetailDto {
    staffId: number;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    skills?: string;
    expYear?: number;
    isAvailable?: boolean;
    createAt: string; // Note: Property name is CreateAt
    updatedAt?: string; // Date/time as string
}

// DTO để trả về thông tin User cho Admin (bao gồm chi tiết Customer/Staff)
export interface UserAdminDto {
    userId: number;
    username: string;
    email: string;
    phoneNumber?: string;
    createdAt: string; // Date/time as string
    updatedAt?: string; // Date/time as string
    isActive: boolean;
    roleId: number;
    roleName: string;
    // Bao gồm DTO chi tiết Customer/Staff nếu User có liên kết
    customer?: CustomerAdminDetailDto; // Note: property name is 'customer' (lowercase)
    staff?: StaffAdminDetailDto;     // Note: property name is 'staff' (lowercase)
}