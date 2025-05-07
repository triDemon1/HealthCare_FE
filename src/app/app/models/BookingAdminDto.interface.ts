import { BookingDto } from "./BookingDto.interface";

export interface BookingAdminDto extends BookingDto {
    customerId: number;
    customerName: string;
    staffId?: number;
    staffName?: string;
    addressId: number;
    addressStreet?: string;
    addressWard?: string;
    addressDistrict?: string;
    addressCity?: string;
    addressCountry?: string;
    paymentStatusId?: number;
    paymentStatusName?: string;
}