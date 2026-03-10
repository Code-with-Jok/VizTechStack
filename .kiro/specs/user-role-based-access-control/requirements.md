# Tài liệu Yêu cầu - Hệ thống Kiểm soát Truy cập Dựa trên Vai trò Người dùng

## Giới thiệu

Hệ thống kiểm soát truy cập dựa trên vai trò người dùng cho phép phân quyền truy cập vào các tính năng của ứng dụng web dựa trên vai trò của người dùng (Admin hoặc User). Hệ thống này tích hợp với Clerk để xác thực và quản lý phân quyền cho các thao tác CRUD trên roadmap.

## Bảng thuật ngữ

- **System**: Hệ thống kiểm soát truy cập dựa trên vai trò
- **Admin**: Người dùng có vai trò quản trị viên với đầy đủ quyền CRUD trên roadmap
- **User**: Người dùng đã đăng nhập nhưng chỉ có quyền xem roadmap
- **Guest**: Người dùng chưa đăng nhập, chỉ có quyền xem roadmap
- **Landing_Page**: Trang chủ của ứng dụng web
- **Header**: Thanh điều hướng phía trên của ứng dụng
- **Roadmap**: Danh sách các lộ trình công nghệ
- **Clerk**: Dịch vụ xác thực người dùng
- **Admin_Button**: Nút điều hướng đến trang quản trị trong Header
- **Login_Button**: Nút đăng nhập trong Header
- **CRUD_Operations**: Các thao tác Create (Tạo), Read (Đọc), Update (Cập nhật), Delete (Xóa)

## Yêu cầu

### Yêu cầu 1: Hiển thị Landing Page cho tất cả người dùng

**User Story:** Là một người truy cập, tôi muốn xem Landing Page khi vào ứng dụng, để tôi có thể hiểu về ứng dụng và đăng nhập nếu cần.

#### Tiêu chí chấp nhận

1. WHEN một người dùng truy cập vào ứng dụng web, THE System SHALL hiển thị Landing_Page
2. THE System SHALL hiển thị Login_Button trong Header trên Landing_Page
3. THE System SHALL cho phép truy cập Landing_Page mà không yêu cầu xác thực

### Yêu cầu 2: Xác thực người dùng qua Clerk

**User Story:** Là một người dùng, tôi muốn đăng nhập qua Clerk, để tôi có thể truy cập các tính năng dựa trên vai trò của mình.

#### Tiêu chí chấp nhận

1. WHEN người dùng click vào Login_Button, THE System SHALL hiển thị giao diện đăng nhập của Clerk
2. WHEN người dùng đăng nhập thành công qua Clerk, THE System SHALL xác thực thông tin người dùng
3. WHEN xác thực thành công, THE System SHALL xác định vai trò của người dùng (Admin hoặc User)
4. THE System SHALL lưu trữ trạng thái xác thực của người dùng trong phiên làm việc

### Yêu cầu 3: Hiển thị Admin Button cho Admin

**User Story:** Là một Admin, tôi muốn thấy Admin Button trong Header sau khi đăng nhập, để tôi có thể truy cập vào trang quản trị.

#### Tiêu chí chấp nhận

1. WHEN người dùng có vai trò Admin đăng nhập thành công, THE System SHALL hiển thị Admin_Button trong Header
2. WHEN người dùng có vai trò User đăng nhập thành công, THE System SHALL NOT hiển thị Admin_Button trong Header
3. WHEN Guest truy cập ứng dụng, THE System SHALL NOT hiển thị Admin_Button trong Header
4. THE System SHALL hiển thị Admin_Button trên tất cả các trang khi Admin đã đăng nhập

### Yêu cầu 4: Quyền xem danh sách Roadmap

**User Story:** Là một người truy cập (Guest, User, hoặc Admin), tôi muốn xem danh sách roadmap, để tôi có thể tìm hiểu về các lộ trình công nghệ.

#### Tiêu chí chấp nhận

1. THE System SHALL cho phép Guest xem danh sách Roadmap
2. THE System SHALL cho phép User xem danh sách Roadmap
3. THE System SHALL cho phép Admin xem danh sách Roadmap
4. WHEN người dùng truy cập trang danh sách Roadmap, THE System SHALL hiển thị tất cả các Roadmap có sẵn

### Yêu cầu 5: Giới hạn quyền của Guest

**User Story:** Là hệ thống, tôi muốn giới hạn quyền của Guest chỉ ở mức xem, để bảo vệ dữ liệu khỏi các thao tác không được phép.

#### Tiêu chí chấp nhận

1. THE System SHALL cho phép Guest xem Roadmap
2. WHEN Guest cố gắng thực hiện CRUD_Operations trên Roadmap, THE System SHALL từ chối yêu cầu
3. THE System SHALL hiển thị Login_Button cho Guest để khuyến khích đăng nhập
4. THE System SHALL NOT hiển thị các nút hoặc giao diện cho phép Guest thực hiện CRUD_Operations

### Yêu cầu 6: Giới hạn quyền của User

**User Story:** Là một User đã đăng nhập, tôi muốn xem roadmap nhưng không thể chỉnh sửa, để tôi có thể tham khảo thông tin mà không ảnh hưởng đến dữ liệu.

#### Tiêu chí chấp nhận

1. THE System SHALL cho phép User xem Roadmap
2. WHEN User cố gắng thực hiện Create operation trên Roadmap, THE System SHALL từ chối yêu cầu
3. WHEN User cố gắng thực hiện Update operation trên Roadmap, THE System SHALL từ chối yêu cầu
4. WHEN User cố gắng thực hiện Delete operation trên Roadmap, THE System SHALL từ chối yêu cầu
5. THE System SHALL NOT hiển thị các nút hoặc giao diện cho phép User thực hiện CRUD_Operations

### Yêu cầu 7: Quyền CRUD đầy đủ cho Admin

**User Story:** Là một Admin, tôi muốn có đầy đủ quyền CRUD trên roadmap sau khi click vào Admin Button, để tôi có thể quản lý nội dung ứng dụng.

#### Tiêu chí chấp nhận

1. WHEN Admin click vào Admin_Button, THE System SHALL điều hướng đến trang quản trị
2. WHILE Admin đang ở trang quản trị, THE System SHALL cho phép Admin thực hiện Create operation trên Roadmap
3. WHILE Admin đang ở trang quản trị, THE System SHALL cho phép Admin thực hiện Read operation trên Roadmap
4. WHILE Admin đang ở trang quản trị, THE System SHALL cho phép Admin thực hiện Update operation trên Roadmap
5. WHILE Admin đang ở trang quản trị, THE System SHALL cho phép Admin thực hiện Delete operation trên Roadmap
6. THE System SHALL hiển thị giao diện quản trị với các nút và form cho phép thực hiện CRUD_Operations

### Yêu cầu 8: Xác thực vai trò trên Backend

**User Story:** Là hệ thống backend, tôi muốn xác thực vai trò người dùng cho mọi yêu cầu API, để đảm bảo bảo mật và ngăn chặn truy cập trái phép.

#### Tiêu chí chấp nhận

1. WHEN Backend nhận được yêu cầu API, THE System SHALL xác thực JWT token từ Clerk
2. WHEN JWT token hợp lệ, THE System SHALL trích xuất vai trò người dùng từ token
3. WHEN người dùng thực hiện CRUD_Operations, THE System SHALL kiểm tra vai trò có quyền thực hiện thao tác đó
4. IF người dùng không có quyền thực hiện thao tác, THEN THE System SHALL trả về lỗi 403 Forbidden
5. IF JWT token không hợp lệ hoặc hết hạn, THEN THE System SHALL trả về lỗi 401 Unauthorized

### Yêu cầu 9: Quản lý vai trò người dùng

**User Story:** Là một Admin, tôi muốn vai trò người dùng được quản lý trong Clerk, để tôi có thể dễ dàng phân quyền cho người dùng mới.

#### Tiêu chí chấp nhận

1. THE System SHALL lưu trữ vai trò người dùng (Admin hoặc User) trong metadata của Clerk
2. WHEN người dùng mới đăng ký, THE System SHALL gán vai trò mặc định là User
3. THE System SHALL cho phép thay đổi vai trò người dùng thông qua Clerk Dashboard
4. WHEN vai trò người dùng thay đổi trong Clerk, THE System SHALL cập nhật quyền truy cập trong phiên làm việc tiếp theo

### Yêu cầu 10: Xử lý lỗi và thông báo

**User Story:** Là một người dùng, tôi muốn nhận thông báo rõ ràng khi tôi không có quyền thực hiện một thao tác, để tôi hiểu lý do và biết cách khắc phục.

#### Tiêu chí chấp nhận

1. WHEN người dùng cố gắng thực hiện thao tác không được phép, THE System SHALL hiển thị thông báo lỗi rõ ràng
2. THE System SHALL hiển thị thông báo "Bạn không có quyền thực hiện thao tác này" khi người dùng bị từ chối quyền truy cập
3. WHEN Guest cố gắng thực hiện thao tác yêu cầu đăng nhập, THE System SHALL hiển thị thông báo "Vui lòng đăng nhập để tiếp tục"
4. IF xảy ra lỗi xác thực, THEN THE System SHALL ghi log lỗi để phục vụ debug và bảo mật
