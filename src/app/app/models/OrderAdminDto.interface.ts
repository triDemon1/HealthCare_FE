export interface OrderAdminDto {
    orderId: number;
    customerId: number;
    customerName: string;
    phoneNumber?: string;
    orderStatusId: number;
    orderStatusName: string;
    addressId: number;
    addressStreet?: string;
    addressWard?: string;
    addressDistrict?: string;
    addressCity?: string;
    addressCountry?: string;
    orderDate?: string; // Date as string
    totalAmount: number;
    createdAt: string; // Date/time as string
    updatedAt?: string; // Date/time as string
    orderDetails?: OrderDetailDto[]; // Uncomment if you include details
}
export interface OrderDetailDto {
    orderDetailId: number;
    productId: number;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
}