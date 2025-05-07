export interface PaymentInitiateResponse {
    success: boolean;
    paymentUrl?: string; // URL để redirect đến cổng thanh toán
    transactionRef?: string; // Mã giao dịch nội bộ
    message: string;
    errorCode?: string;
}