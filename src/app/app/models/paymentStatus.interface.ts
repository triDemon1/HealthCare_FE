export interface PaymentStatus {
    paymentstatusid?: number; // Có thể null nếu chưa có giao dịch liên quan
    statusname?: string; // Tên trạng thái thanh toán (Pending, Completed, Failed)
}