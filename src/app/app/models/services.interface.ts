export interface Service {
  serviceid: number;
  servicegroupid: number;
  subjecttypeid: number; // Quan trọng để lọc
  name: string;
  description?: string;
  duration?: number;
  price?: number;
  isactive?: boolean;
  createdAt?: Date; // Handled by backend
  updatedAt?: Date; // Handled by backend
}