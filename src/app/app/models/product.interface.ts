export interface Product {
  productId: number; // Đảm bảo khớp với tên cột trong CSDL hoặc DTO trả về từ API
  categoryId: number;
  name: string;
  description: string | null; // Có thể null
  price: number;
  stockQuantity: number;
  imageUrl: string | null; // Có thể null
  sku: string | null;      // Có thể null
  isActive: boolean;
  createdAt: string;       // Kiểu Date hoặc string tùy cách API trả về
  updatedAt: string | null;// Kiểu Date hoặc string tùy cách API trả về
}