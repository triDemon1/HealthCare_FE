import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderAdminDto } from '../models/OrderAdminDto.interface'; // Adjust the path as needed
import { Pagination } from '../models/pagination.interface';
import { StatusUpdateDto } from '../models/StatusUpdate.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderManagementService {
  private apiUrl = 'https://localhost:7064/api/OrderManagement/admin/orders'; // Adjust API path if necessary

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách đơn hàng có phân trang.
   * @param pageIndex Index trang (bắt đầu từ 0).
   * @param pageSize Số lượng mục trên mỗi trang.
   * @returns Observable của đối tượng Pagination chứa danh sách đơn hàng và thông tin phân trang.
   */
  getAllOrders(pageIndex: number, pageSize: number): Observable<Pagination<OrderAdminDto>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Pagination<OrderAdminDto>>(`${this.apiUrl}`, { params });
  }

  /**
   * Lấy chi tiết đơn hàng theo ID.
   * @param orderId ID của đơn hàng.
   * @returns Observable của đối tượng OrderAdminDto.
   */
  getOrderById(orderId: number): Observable<OrderAdminDto> {
    return this.http.get<OrderAdminDto>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Cập nhật trạng thái đơn hàng.
   * @param orderId ID của đơn hàng cần cập nhật.
   * @param statusId ID của trạng thái mới.
   * @returns Observable của đối tượng OrderAdminDto sau khi cập nhật.
   */
  updateOrderStatus(orderId: number, statusId: number): Observable<OrderAdminDto> {
    const body: StatusUpdateDto = { statusId: statusId };
    return this.http.put<OrderAdminDto>(`${this.apiUrl}/${orderId}/status`, body);
  }
}