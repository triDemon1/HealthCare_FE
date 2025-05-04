// src/app/models/booking-update.interface.ts
export interface BookingUpdateDto {
    serviceId: number;
    staffId?: number | null; // Allow null for unassigned staff
    scheduledStartTime: string; // Date/time as string
    scheduledEndTime: string;   // Date/time as string
    priceAtBooking: number;
    addressId: number;
    statusId: number;
    notes?: string | null; // Allow null for notes
}

