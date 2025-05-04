export interface BookingPayload {
    customerid: number; // Lấy từ thông tin user đăng nhập
    addressid: number;
    serviceid: number;
    scheduledstarttime: string; // Format ISO 8601
    scheduledendtime: string | null;
    priceatbooking: number;
    notes?: string;
    subjectid?: number; // ID nếu chọn subject đã có
    newSubjectData?: { // Dữ liệu nếu tạo subject mới
        typeid: number;
        name: string;
        dateofbirth?: string;
        gender?: boolean | null; // 0 hoặc 1
        medicalnotes?: string;
        imageurl?: string;
    };
}