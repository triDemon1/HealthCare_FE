export interface Service {
    serviceid: number;
    servicegroupid: number;
    subjecttypeid: number; // Quan trọng để lọc
    name: string;
    description?: string;
    duration?: number;
    price?: number;
    isactive?: boolean;
    // Thêm các trường khác nếu API trả về
  }