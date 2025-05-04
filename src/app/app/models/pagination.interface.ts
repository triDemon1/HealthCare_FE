export interface Pagination<T> {
    items: T[]; // Danh sách các mục của trang hiện tại
    totalCount: number; // Tổng số mục (sau khi lọc)
    pageIndex: number; // Index trang hiện tại (backend trả về 0-based)
    pageSize: number;   // Số mục trên mỗi trang
    totalPages: number; // Tổng số trang (tính từ backend hoặc tính lại ở frontend)
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}