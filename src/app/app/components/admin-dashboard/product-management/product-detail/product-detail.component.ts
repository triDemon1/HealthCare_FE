import { Component } from '@angular/core';
import { Product } from '../../../../models/product.interface';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  productId: number | null = null;
  product: Product | null = null;
  isLoading = true; // Bắt đầu với loading
  errorMessage: string | null = null;
  isEditing = false; // Trạng thái: true là chỉnh sửa/thêm, false là xem
  // Biến mới để lưu trữ tệp hình ảnh được chọn
  selectedFile: File | null = null;
  // Biến để hiển thị preview hình ảnh (có thể là URL từ backend hoặc URL tạm thời từ tệp chọn)
  imagePreviewUrl: string | ArrayBuffer | null = null;

  // Optional: Properties for dropdowns (e.g., Categories)
  categories: any[] = []; // To hold list of categories

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService // Use the new service
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('productId');
      if (id) {
        // Nếu có productId trên URL, đây là chế độ xem/sửa sản phẩm đã tồn tại
        this.productId = +id; // Convert string ID to number
        this.loadProductDetails(this.productId);
        this.isEditing = false; // Mặc định bắt đầu ở chế độ xem
        // Optional: Load categories if needed for editing
        this.loadCategories();
      } else {
        // Nếu không có productId (route là /new), đây là chế độ thêm sản phẩm mới
        this.productId = 0; // Gán ID là 0 hoặc null để đánh dấu sản phẩm mới
        this.isEditing = true; // Bắt đầu ngay ở chế độ chỉnh sửa (thêm mới)
        this.product = { // Khởi tạo đối tượng sản phẩm trống cho form
             productId: 0, // ID là 0 cho sản phẩm mới
             categoryId: 0, // Default category hoặc handle selection
             name: '',
             description: '',
             price: 0,
             stockQuantity: 0,
             imageUrl: '',
             sku: '',
             isActive: true,
             createdAt: '', // Set default creation date
             updatedAt: '' // Set default updated date
        };
        this.isLoading = false; // Không cần loading khi tạo form trống
        // Optional: Load categories if needed for creating
        this.loadCategories();
      }
    });
  }
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0]; // Lấy tệp đầu tiên được chọn

      // Tạo preview hình ảnh
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result; // URL tạm thời cho preview
      };
      reader.readAsDataURL(this.selectedFile); // Đọc tệp dưới dạng Data URL
    } else {
      this.selectedFile = null;
      // Nếu không có tệp nào được chọn, quay lại URL hình ảnh gốc nếu có
      this.imagePreviewUrl = this.product?.imageUrl || null;
    }
  }
  /**
   * Tải chi tiết sản phẩm từ backend.
   * @param id ID sản phẩm.
   */
  loadProductDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.productService.getProductById(id).subscribe({ // Use the new service
      next: (data) => {
        this.product = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
        this.errorMessage = 'Không thể tải chi tiết sản phẩm. Vui lòng thử lại hoặc kiểm tra ID sản phẩm.';
        this.isLoading = false;
      }
    });
  }

  //Optional: Method to load categories for a dropdown
  loadCategories(): void {
    //You would need a service method to get categories
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        // Handle error
      }
    });
  }

  /**
   * Chuyển đổi giữa chế độ xem và chỉnh sửa.
   * Chỉ áp dụng cho sản phẩm đã tồn tại.
   */
  toggleEditMode(): void {
     // Chỉ cho phép chuyển đổi nếu đây không phải là sản phẩm mới
    if (this.productId !== null && this.productId !== 0) {
        this.isEditing = !this.isEditing;
         // Nếu thoát chế độ chỉnh sửa (bấm Hủy), tải lại dữ liệu gốc để loại bỏ các thay đổi chưa lưu
        if (!this.isEditing && this.productId !== null) {
            this.loadProductDetails(this.productId);
        }
    }
  }

  /**
   * Lưu sản phẩm (thêm mới hoặc cập nhật).
   */
  saveProduct(): void {
    if (!this.product) {
      this.errorMessage = 'Không có dữ liệu sản phẩm để lưu.';
      return;
    }

    this.isLoading = true; // Show loading indicator during save
    this.errorMessage = null; // Clear previous errors

    // Tạo FormData để gửi dữ liệu sản phẩm và tệp tin
    const formData = new FormData();

    // Thêm các trường dữ liệu sản phẩm vào FormData
    // Chú ý: Tên trường phải khớp với tên mà backend mong đợi nhận từ form-data
    formData.append('productId', this.product.productId.toString()); // Gửi ID (0 cho thêm mới)
    formData.append('categoryId', this.product.categoryId.toString());
    formData.append('name', this.product.name);
    formData.append('description', this.product.description || ''); // Xử lý trường có thể null
    formData.append('price', this.product.price.toString());
    formData.append('stockQuantity', this.product.stockQuantity.toString());
    formData.append('sku', this.product.sku || ''); // Xử lý trường có thể null
    formData.append('isActive', this.product.isActive.toString());
    // Không cần gửi createdAt/updatedAt từ frontend

    // Thêm tệp hình ảnh nếu có
    if (this.selectedFile) {
      formData.append('imageFile', this.selectedFile, this.selectedFile.name); // Tên trường 'imageFile' phải khớp với backend
    } else if (this.product.imageUrl) {
        // Nếu không chọn tệp mới nhưng đã có imageUrl cũ, gửi lại URL cũ
        // Backend cần xử lý trường hợp này (ví dụ: nhận imageUrl string thay vì file)
        // HOẶC backend sẽ giữ nguyên ảnh cũ nếu không nhận được file mới.
        // Cách xử lý này phụ thuộc vào thiết kế API backend.
        // Tạm thời, nếu không có file mới và có URL cũ, chúng ta không gửi trường file.
        // Backend cần biết cách xử lý khi không có file được gửi lên.
        // Một cách khác là gửi lại URL cũ dưới một tên trường khác nếu backend hỗ trợ.
        // Ví dụ: formData.append('existingImageUrl', this.product.imageUrl);
    }
     // Nếu không có file mới VÀ không có imageUrl cũ, backend sẽ xử lý null/empty cho ảnh.


    // Xác định là tạo mới hay cập nhật dựa vào productId
    const operation: Observable<Product> = this.product.productId === 0
      ? this.productService.createProductWithFile(formData) // Cần tạo method mới trong service để gửi FormData
      : this.productService.updateProductWithFile(this.product.productId, formData); // Cần tạo method mới hoặc sửa method update

    operation.subscribe({
      next: (savedProduct) => {
        console.log('Product saved successfully', savedProduct);
        // Cập nhật dữ liệu sản phẩm với kết quả trả về (bao gồm ID mới và URL ảnh mới)
        this.product = savedProduct;
        this.imagePreviewUrl = this.product.imageUrl; // Cập nhật preview với URL từ backend
        this.isLoading = false; // Hide loading on success
        this.isEditing = false; // Thoát chế độ chỉnh sửa sau khi lưu thành công
        this.selectedFile = null; // Reset selected file
        // Điều hướng về trang danh sách sau khi lưu
        this.router.navigate(['/admin/products']);
        // Optionally show a success message (e.g., using a toast service)
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.errorMessage = `Lưu sản phẩm thất bại: ${err.message || 'Lỗi không xác định'}`;
        this.isLoading = false; // Hide loading on error
        // Handle error, show message to user
      }
    });
  }

  /**
   * Quay lại trang danh sách sản phẩm.
   */
  goBack(): void {
    this.router.navigate(['/admin/products']); // Điều hướng về route của trang danh sách
  }
}
