# HƯỚNG DẪN CHẠY LOCAL VÀ QUẢN TRỊ DỰ ÁN SHOWROOM XE MÁY ĐIỆN VINFAST TÂY SÀI GÒN

> **Dự án:** Website Showroom Chuyên Biệt Xe Máy Điện VinFast Tây Sài Gòn (Design System clone chuẩn https://vinfastauto.com/vn_vi)  
> **Chủ thể hợp đồng:** CÔNG TY TNHH TÂY SÀI GÒN  
> **Đơn vị thực hiện:** Lê Văn Trung (SĐT: 0353814306)  
> **Thư mục dự án:** `e:\MY WORK\Web Scraping\FIle cào\vinfasttaysaigon.vn`

---

## 1. CÁCH KHỞI ĐỘNG CHẠY LOCAL TRÊN MÁY TÍNH

### Cách 1: Nhấp đúp chuột (Nhanh nhất)
1. Mở thư mục `e:\MY WORK\Web Scraping\FIle cào\vinfasttaysaigon.vn`.
2. Nhấp đúp chuột vào file **`start_server.bat`**.
3. Cửa sổ máy chủ sẽ tự khởi động và trình duyệt tự động mở trang web tại địa chỉ:
   👉 **`http://127.0.0.1:3000/`** (hoặc `http://localhost:3000/`)

### Cách 2: Khởi động bằng dòng lệnh PowerShell / Terminal
```powershell
cd "e:\MY WORK\Web Scraping\FIle cào\vinfasttaysaigon.vn"
python serve.py
```

*Để dừng máy chủ: Bấm tổ hợp phím `Ctrl + C` trong cửa sổ dòng lệnh.*

---

## 2. CẤU TRÚC HỆ THỐNG 100% CHUYÊN BIỆT XE MÁY ĐIỆN VINFAST

| Tên file | Chức năng trang | Hạng mục nổi bật |
| :--- | :--- | :--- |
| **`index.html`** | **Trang Chủ** | Mega Menu 3 tabs (Xe cao cấp, Xe trung cấp, Xe phổ thông), Hero Slider, Showcase đổi màu sơn trực quan, Công cụ tính toán so sánh kinh tế (Xe điện vs Xe xăng tiết kiệm gấp 5 lần), Section Pin LFP chống nước IP67, Lưới 9 Showroom Tây Sài Gòn, Form đăng ký lái thử tận nhà |
| **`xe-may-dien.html`** | **Danh Mục Xe Máy Điện** | Bảng giá và thông số toàn diện: Kinet, Theon S, Vento S, Vero X, Viper, Kyo, Feliz 2027, Feliz S, Evo Grand Limited, Klara S, Evo200, Evo Lite, Amio S2, Flazz, ZGoo, VF DrgnFly |
| **`pin-va-tram-sac.html`** | **Pin LFP & Trạm Sạc** | Công nghệ pin chống cháy nổ IP67, bảng giá gói cước thuê pin & mua pin, bộ sạc tại nhà 400W & 1.000W |
| **`dich-vu-hau-mai.html`** | **Dịch Vụ Hậu Mãi** | Bảo dưỡng định kỳ tiết kiệm 60%, cứu hộ pin 24/7, Mobile Service sửa xe tận nhà |
| **`he-thong-showroom.html`** | **Trang 9 Showroom** | Danh sách 9 chi nhánh tại TP.HCM, Hotline từng nơi, Google Maps chỉ đường |
| **`dang-ky-lai-thu.html`** | **Trang Đăng Ký Lái Thử** | Form đặt lịch lái thử xe máy điện tận nhà miễn phí hoặc tại Showroom, chuyển lead tự động |
| **`gioi-thieu.html`** | **Trang Giới Thiệu** | Hành trình chuyển đổi xanh, thông tin pháp nhân CÔNG TY TNHH TÂY SÀI GÒN |
| **`lien-he.html`** | **Trang Liên Hệ** | Trụ sở 982 Tỉnh Lộ 10, form liên hệ, hotline bán hàng & kỹ thuật |
| **`tin-tuc.html`** | **Tin Tức & Khuyến Mại** | Ra mắt Feliz 2027, Evo200 bứt phá 203 km, chương trình trả góp 0% cho học sinh sinh viên |
| **`chinh-sach-bao-hanh.html`** | **Chính sách bảo hành** | Cam kết bảo hành chính hãng 5 năm không giới hạn km cho xe máy điện |
| **`chinh-sach-giao-nhan-xe.html`**| **Chính sách giao nhận xe**| Quy trình bàn giao xe tận nhà miễn phí nội thành TP.HCM, hướng dẫn kích hoạt app |
| **`quy-dinh-dat-coc.html`** | **Quy định đặt cọc** | Khóa giá ưu đãi, quy định giữ xe và chính sách hoàn hủy minh bạch |
| **`chinh-sach-bao-mat.html`** | **Chính sách bảo mật** | Cam kết bảo mật thông tin khách hàng tuyệt đối |
| **`quy-dinh-thanh-toan.html`** | **Quy định thanh toán** | Hướng dẫn thanh toán tiền mặt, chuyển khoản và mua xe trả góp 0% duyệt 10 phút |
| **`tiep-nhan-khieu-nai.html`** | **Giải quyết khiếu nại** | Quy trình tiếp nhận và xử lý phản ánh trong 24 giờ của Ban Giám Đốc |

---

## 3. CÁCH QUẢN TRỊ DỮ LIỆU TẬP TRUNG (JSON)

Toàn bộ dữ liệu của website được tách biệt trong thư mục `data/` cực kỳ trực quan:

1. **`data/site_config.json`**:
   - Chỉnh sửa số điện thoại Hotline bán hàng (`hotline`), Hotline kỹ thuật (`hotline_tech`), link Zalo (`zalo`), email (`email`), và địa chỉ trụ sở.
2. **`data/showrooms.json`**:
   - Thêm/sửa/xóa địa chỉ, hotline và link Google Maps của 9 chi nhánh.
3. **`data/products.json`**:
   - Quản lý toàn bộ 19 dòng xe máy điện và hệ sinh thái pin sạc, giá bán niêm yết, các mã màu sơn và bảng thông số kỹ thuật.
4. **`data/leads.json`**:
   - **Hộp thư tự động lưu trữ khách hàng**: Mỗi khi khách điền form lái thử hoặc tư vấn trên website, thông tin (Họ tên, SĐT, xe quan tâm, showroom, thời gian nhận xe) sẽ được tự động ghi nhận ngay lập tức vào file này.

---

## 4. HƯỚNG DẪN KHI TRIỂN KHAI LÊN HOSTING THỰC TẾ

Khi bạn hoàn thiện thử nghiệm local và muốn đưa lên website chính thức:
1. Nén toàn bộ các file trong thư mục `vinfasttaysaigon.vn` thành file `.zip`.
2. Tải lên thư mục gốc `public_html` trên hosting.
3. File `api/submit-lead.php` đã được chuẩn bị sẵn, tự động tiếp nhận form khi chạy trên môi trường PHP của hosting.
