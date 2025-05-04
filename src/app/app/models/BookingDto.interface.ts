// --- Define the BookingDto interface for the frontend ---
// This should match the structure of the BookingDto class in your backend C# code
export interface BookingDto {
    bookingId: number;
    serviceId: number;
    serviceName: string;
    subjectId: number;
    subjectName?: string; // Use ? because it's nullable in backend DTO
    statusId: number;
    statusName: string;
    scheduledStartTime: string; // Use string for date/time from API
    scheduledEndTime: string;   // Use string for date/time from API
    priceAtBooking: number; // Use number for decimal from backend
    notes?: string; // Use ? because it's nullable
    createdAt: string; // Use string for date/time from API
    // Add other fields if you added them in the backend DTO
}