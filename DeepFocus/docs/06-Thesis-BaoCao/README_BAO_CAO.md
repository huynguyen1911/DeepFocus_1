# BÁO CÁO ĐỒ ÁN CHUYÊN NGÀNH - DEEPFOCUS

## Cấu trúc file báo cáo

Báo cáo đã được tách thành các file riêng biệt để dễ quản lý:

### 📄 File chính

1. **00_FRONT_MATTER.md** (~6KB)

   - Trang bìa và thông tin đồ án
   - Mục lục
   - Danh mục ký hiệu, chữ viết tắt
   - Danh mục hình ảnh, biểu đồ

2. **01_CHUONG_1_TONG_QUAN.md** (~23KB / 8 trang)

   - 1.1. Giới thiệu đề tài
   - 1.2. Tình hình nghiên cứu liên quan
   - 1.3. Giả thiết và lý do hình thành đề tài
   - 1.4. Ý nghĩa khoa học và thực tiễn
   - 1.5. Mục tiêu nghiên cứu
   - 1.6. Đối tượng và phạm vi nghiên cứu
   - 1.7. Cấu trúc đồ án

3. **02_CHUONG_2_CO_SO_LY_THUYET.md** (~69KB / 20 trang)

   - 2.1. Phương pháp Pomodoro và các kỹ thuật quản lý thời gian
   - 2.2. Kiến trúc ứng dụng di động đa nền tảng
   - 2.3. Công nghệ React Native và Expo Framework
   - 2.4. Kiến trúc Backend với Node.js và Express.js
   - 2.5. Cơ sở dữ liệu MongoDB và Mongoose ORM
   - 2.6. Hệ thống xác thực và phân quyền JWT
   - 2.7. Mô hình thiết kế và kiến trúc hệ thống
   - 2.8. Các pattern và best practices trong phát triển ứng dụng

4. **03_CHUONG_3_KET_QUA_THUC_NGHIEM.md** (~75KB / 28 trang)

   - 3.1. Môi trường triển khai và cấu hình hệ thống
   - 3.2. Kiến trúc hệ thống và sơ đồ triển khai
   - 3.3. Giao diện người dùng và trải nghiệm
   - 3.4. Kết quả kiểm thử và đánh giá hiệu năng
   - 3.5. Đánh giá từ người dùng thử nghiệm
   - 3.6. So sánh với các giải pháp tương tự

5. **04_CHUONG_4_KET_LUAN.md** (~37KB / 10 trang)

   - 4.1. Kết luận
   - 4.2. Những đóng góp của đồ án
   - 4.3. Hạn chế và hướng phát triển
   - 4.4. Kiến nghị

6. **05_TAI_LIEU_THAM_KHAO_VA_PHU_LUC.md** (~11KB)
   - Tài liệu tham khảo (44 nguồn)
   - Phụ lục A: Hướng dẫn cài đặt
   - Phụ lục B: API Documentation
   - Phụ lục C: Database Schema Diagrams
   - Phụ lục D: Test Reports
   - Phụ lục E: Screenshots

### 📊 Thống kê

- **Tổng số trang:** ~66 trang
- **Tổng dung lượng:** ~221KB
- **Số lượng file:** 6 files
- **Số tài liệu tham khảo:** 44 nguồn
- **Ngày hoàn thành:** 7 tháng 12, 2025

### 🔗 File gốc

- **BAO_CAO_CHUYEN_NGANH.md** - File báo cáo gốc đầy đủ (giữ lại để tham khảo)

## Hướng dẫn sử dụng

### Đọc báo cáo

1. Bắt đầu với `00_FRONT_MATTER.md` để xem mục lục tổng quan
2. Đọc theo thứ tự từ Chương 1 đến Chương 4
3. Tham khảo tài liệu và phụ lục trong file 05

### Chỉnh sửa báo cáo

- Mở file tương ứng với chương cần sửa
- Chỉnh sửa nội dung trực tiếp
- Không cần lo lắng về việc file quá lớn

### Gộp lại thành file duy nhất (nếu cần)

```powershell
# PowerShell command để gộp tất cả files
Get-Content 00_FRONT_MATTER.md, 01_CHUONG_1_TONG_QUAN.md, 02_CHUONG_2_CO_SO_LY_THUYET.md, 03_CHUONG_3_KET_QUA_THUC_NGHIEM.md, 04_CHUONG_4_KET_LUAN.md, 05_TAI_LIEU_THAM_KHAO_VA_PHU_LUC.md | Out-File BAO_CAO_FULL.md -Encoding UTF8
```

### Export sang PDF

Sử dụng một trong các công cụ sau:

1. **VS Code với Markdown PDF extension**

   - Mở file markdown
   - Ctrl+Shift+P → "Markdown PDF: Export (pdf)"

2. **Pandoc** (command line)

   ```bash
   pandoc BAO_CAO_FULL.md -o BAO_CAO.pdf --pdf-engine=xelatex -V geometry:margin=1in
   ```

3. **Typora, MarkText, hoặc các Markdown editors khác**

## Lưu ý

- Tất cả files đều sử dụng encoding UTF-8
- Giữ nguyên format Markdown để dễ chỉnh sửa
- File gốc `BAO_CAO_CHUYEN_NGANH.md` vẫn được giữ lại
- Có thể thêm/xóa/sửa nội dung trong từng file độc lập

## Liên hệ

Nếu có thắc mắc về báo cáo, vui lòng liên hệ:

- **Sinh viên:** [Họ và tên]
- **Email:** [Email]
- **GitHub:** https://github.com/huynguyen1911/DeepFocus_1
