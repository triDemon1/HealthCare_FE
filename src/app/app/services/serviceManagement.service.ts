import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Service } from '../models/services.interface';
import { ServiceGroup } from '../models/serviceGroup.interface';
import { ServiceCreateDTO } from '../models/ServiceCreateDto.interface';
import { ServiceUpdateDTO } from '../models/ServiceUpdateDto.interface';
@Injectable({
  providedIn: 'root'
})
export class ServiceManagement {
    private apiServicesUrl = 'https://localhost:7064/api/ServiceManagement';
    private apiServiceGroupsUrl = 'https://localhost:7064/api/ServiceManagement/servicegroups';
     private apiServiceGroupsBySubjectTypeUrl = 'https://localhost:7064/api/ServiceManagement/servicegroupsbysubjecttype';
    constructor(private http: HttpClient) { }
    /**
   * NEW: Get a single service by ID for editing
   * @param serviceId The ID of the service to retrieve
   */
  getServiceById(serviceId: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiServicesUrl}/${serviceId}`)
      .pipe(catchError(this.handleError));
  }

  addService(service: ServiceCreateDTO): Observable<Service> {
  return this.http.post<Service>(`${this.apiServicesUrl}`, service)
    .pipe(catchError(this.handleError));
}

updateService(serviceId: number, service: ServiceUpdateDTO): Observable<void> {
  return this.http.put<void>(`${this.apiServicesUrl}/${serviceId}`, service)
    .pipe(catchError(this.handleError));
}

  /**
   * NEW: Delete a service by ID
   * @param serviceId The ID of the service to delete
   */
  deleteService(serviceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiServicesUrl}/${serviceId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * NEW: Get all service groups (for dropdown in add/edit form)
   */
  getServiceGroups(): Observable<ServiceGroup[]> {
    return this.http.get<ServiceGroup[]>(`${this.apiServiceGroupsUrl}`)
      .pipe(catchError(this.handleError));
  }
  getServiceGroupsBySubjectType(subjectTypeId: number): Observable<ServiceGroup[]> {
      // This is a placeholder. Replace with your actual API call
      // Example: return this.http.get<ServiceGroup[]>(`${this.apiServiceGroupsBySubjectTypeUrl}/${subjectTypeId}`)
      console.log(`Workspaceing service groups for subject type ID: ${subjectTypeId}`);
       // Return an empty array for now, you need to implement the actual API call
      return this.http.get<ServiceGroup[]>(`${this.apiServiceGroupsBySubjectTypeUrl}?subjectTypeId=${subjectTypeId}`)
       .pipe(catchError(this.handleError));
  }
  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('Đã xảy ra lỗi khi gọi API. Vui lòng thử lại.'));
  }
}