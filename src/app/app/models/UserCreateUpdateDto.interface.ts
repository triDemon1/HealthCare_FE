export interface UserCreateUpdateDto {
    username: string;
    password?: string; // Optional for update
    email: string;
    phoneNumber?: string;
    isActive: boolean;
    roleId: number;
    customerData?: CustomerCreateUpdateDto | null;
    staffData?: StaffCreateUpdateDto | null;
}
export interface CustomerCreateUpdateDto {
    firstName: string;
    lastName?: string;
    dateOfBirth?: string; // Date as string
    gender?: boolean; // true for Male, false for Female
}

// src/app/models/staff-create-update.interface.ts
export interface StaffCreateUpdateDto {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    skills?: string;
    expYear?: number;
    isAvailable?: boolean;
}