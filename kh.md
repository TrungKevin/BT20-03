# Kế hoạch Hoàn thành Bài tập Quản lý Kho hàng (Inventory)

**Mục tiêu:** Xây dựng tính năng quản lý tồn kho (Inventory) gắn liền với vòng đời của Sản phẩm (Product), bao gồm các chức năng: tự khởi tạo kho tự động khi tạo sản phẩm mới, nhập số lượng tồn kho, đặt hàng, và xuất bán. Bắt buộc phải chụp lại minh chứng kết quả trên Postman dán vào file Word và nộp code qua Git.

---

## Bước 1: Khởi tạo Schema `Inventory` trong Database
- **Vị trí làm việc:** Tạo mới file `schemas/inventories.js`.
- **Yêu cầu Coding:** 
  - Import `mongoose`.
  - Định nghĩa model `Inventory` bắt buộc có 4 trường thông tin:
    1. `product`: Kiểu dữ liệu `ObjectId`, thêm attribute `ref: 'product'` để liên kết với Product. Bắt buộc phải có `required: true` và `unique: true` (đảm bảo mỗi sản phẩm chỉ có duy nhất 1 kho hàng chứa nó).
    2. `stock`: Kiểu dữ liệu `Number`, cấu hình `min: 0`, giá trị mặc định `default: 0`. (Đại diện cho số lượng hàng thực tế đang có sẵn ở trong kho).
    3. `reserved`: Kiểu dữ liệu `Number`, cấu hình `min: 0`, giá trị mặc định `default: 0`. (Đại diện cho số lượng hàng khách đã đặt mua nhưng chưa xuất kho/thanh toán).
    4. `soldCount`: Kiểu dữ liệu `Number`, cấu hình `min: 0`, giá trị mặc định `default: 0`. (Đại diện cho số lượng hàng đã bán thành công).
  - Bật tính năng `{ timestamps: true }` để tự động lưu thời điểm tạo và cập nhật kho.

## Bước 2: Tự động khởi tạo Inventory lúc Tạo Product
- **Vị trí làm việc:** Mở file controller/route xử lý Product, ví dụ `routes/products.js`.
- **Yêu cầu Coding:** 
  - Import Schema `inventories` vào file product.
  - Tìm đến API xử lý `POST /` (API tạo mới sản phẩm).
  - Ngay sau dòng code lưu sản phẩm thành công (ví dụ `await newObj.save()`), viết thêm đoạn code tự động sinh ra một Document Inventory mới với truyền vào duy nhất ID của sản phẩm vừa tạo (`product: newObj._id`).
  - *Kết quả mong đợi:* Sau bước này, hễ cứ tạo vớt 1 sản phẩm bất kỳ, DB sẽ tự động đẻ ra 1 bảng Inventory mang số lượng `stock = 0`, `reserved = 0`.

## Bước 3: Định nghĩa các API quản lý Inventory
- **Vị trí làm việc:** Tạo file mới `routes/inventories.js` và đăng ký file này vào `app.js` (ví dụ: `app.use('/api/v1/inventories', require('./routes/inventories'))`).
- **Yêu cầu Coding chi tiết cho 6 API (sử dụng Method phù hợp):** 
  1. **Lấy toàn bộ kho hàng (`GET /`)**
     - Dùng hàm `.find({})` gọi tất tần tật dữ liệu kho hàng.
  2. **Lấy chi tiết kho hàng theo ID và ghép thông tin (`GET /:id`)**
     - Dùng `.findById()` kết hợp với phương thức `.populate('product')`. Để khi API trả về, ta có thể xem chi tiết tên sản phẩm, giá cả,... chứ không chỉ xem mỗi mỗi cái mã ID khô khan.
  3. **Tăng số lượng tồn kho (`POST /add_stock`)**
     - Nhận Body: `{ product: "ID_sản_phẩm", quantity: Số_lượng }`.
     - Logic: Tìm inventory của product tương ứng. Dùng thẻ `$inc` của MongoDB để cộng dồn giá trị biến `stock` lên đúng bằng lượng `quantity`.
  4. **Giảm số lượng tồn kho / Xuất kho (`POST /remove_stock`)**
     - Nhận Body: `{ product, quantity }`.
     - Validate: Bắt buộc viết lệnh `if` kiểm tra xem `stock >= quantity` hay không? Tránh trường hợp trừ lố làm kho bị âm.
     - Logic: Nếu đủ số lượng, dùng thẻ `$inc` để trừ thẳng `stock` đi `quantity`. Đẩy lỗi 400 nếu không đủ hàng.
  5. **Người dùng Đặt hàng (`POST /reservation`)**
     - Nhận Body: `{ product, quantity }`.
     - Validate: Tương tự, kiểm tra `stock >= quantity` (ví dụ: kho có 100 cái, khách chỉ được phép đặt $\le$ 100 cái).
     - Logic: Trừ `stock` đi lượng `quantity` VÀ đồng thời cộng `quantity` đó vào biến `reserved` (chuyển hàng từ trạng thái trong kho sang trạng thái đặt trước).
  6. **Hoàn tất bán hàng (`POST /sold`)**
     - Nhận Body: `{ product, quantity }`.
     - Validate: Kiểm tra `reserved >= quantity` (phải có người đặt trước thì mới được phép ghi nhận bán).
     - Logic: Trừ `reserved` đi lượng `quantity` VÀ đồng thời cộng vào `soldCount` tương ứng (xác nhận đơn hàng giao thành công và ghi nhận doanh số).

## Bước 4: Test luồng tính năng trên Postman (BẮT BUỘC CHỤP ẢNH MÀN HÌNH)
Chạy server `npm start`, mở ứng dụng Postman ra thực hiện test trình tự đúng như sau:
1. **Tạo Product:** Bắn `POST` tạo một cái áo. Chụp ảnh màn hình báo `Status: 200 OK`. Lên Compass (MôngDB) kiểm tra xem collection inventories có đẻ ra kho của cái áo này chưa -> Chụp ảnh lại DB.
2. **GET Inventory:** Bắn `GET` ID cái kho vừa rồi -> Thấy thuộc tính `.populate` gộp cái áo vào kho thành công -> Chụp ảnh.
3. **Add Stock:** Bắn `POST /add_stock` nhét vào kho 50 cái áo -> Chụp ảnh màn hình thấy `stock: 50`.
4. **Reservation:** Bắn `POST /reservation` đặt mua 10 cái -> Chụp ảnh kết quả thấy `stock` xuống 40, `reserved` lên 10.
5. **Sold:** Bắn `POST /sold` bán thành công 5 cái -> Chụp ảnh màn hình thấy `reserved` xuống 5, `soldCount` lên 5.
6. **Remove Stock:** Bắn `POST /remove_stock` lấy bớt 35 cái ra khỏi kho mượn tạo sự kiện -> Chụp ảnh thấy `stock` tuột còn 5.
7. **Bắt lỗi logic (Rất quan trọng):** Thử gọi tiếp `POST /remove_stock` bớt đi 10 cái. Hệ thống báo lỗi `HTTP 400 - "Không đủ hàng trong kho"` -> Chụp ảnh chứng minh bạn đã handle lỗi âm kho!

## Bước 5: Viết file Word Báo cáo và Đẩy code (Git)
- **Chuẩn bị Word:** Tạo file `BaoCao_Inventory.docx`. Paste toàn bộ các ảnh đã chụp từ Bước 4 vào file Word này. Dưới mỗi ảnh ghi một dòng caption nhỏ (Ví dụ: "*Ảnh 4: Demo API chặn lỗi âm kho khi đặt hàng*").
- **Commit và Push Code:** 
  1. Mở Terminal tại thư mục gốc của Project.
  2. Gõ `git add .` để thêm toàn bộ thay đổi.
  3. Gõ `git commit -m "Hoàn thiện bài tập Inventory đầy đủ tính năng CRUD và nâng cao"`.
  4. Gõ `git push origin main` (hoặc tên branch hiện tại) để đẩy lên kho Github.
- **Nộp bài:** Gửi file Word báo cáo cùng với đường dẫn (Link) repo GitHub của bạn cho Giảng viên hướng dẫn trên hệ thống. 

Lưu ý: mỗi lần bạn viết code xong sẽ luôn luôn chạy test check lỗi và đảm bảo chảy ổn thì bạn cứ tự động làm tiếp chức năng theo kế hoạch , và trước khi làm chức năng tiếp theo phải view lại file kh.md và luôn luôn là như vậy