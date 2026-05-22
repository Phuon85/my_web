# Frontend Olympic HUMG — Module 1 & 2

## Cấu trúc thư mục

```
src/
├── App.jsx                         ← Router chính
├── index.js                        ← Entry point
├── api/
│   └── axios.js                    ← Tất cả API calls
├── context/
│   └── AuthContext.jsx             ← Quản lý đăng nhập toàn app
├── hooks/
│   └── useApi.js                   ← Custom hooks fetch data
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx              ← Thanh điều hướng chính
│   │   └── AuthLayout.jsx          ← Layout 2 cột trang đăng nhập
│   └── ui/
│       └── index.jsx               ← Button, Input, Card, Modal, Toast...
└── pages/
    ├── auth/
    │   ├── LoginPage.jsx
    │   └── RegisterPages.jsx       ← Selection + Internal + External
    ├── home/
    │   └── HomePage.jsx            ← Trang chủ sau đăng nhập
    ├── profile/
    │   └── ProfilePage.jsx         ← Hồ sơ cá nhân
    └── contest/
        ├── ContestListPage.jsx     ← Danh sách cuộc thi
        └── ContestDetailPage.jsx   ← Chi tiết cuộc thi
```

---

## Các trang đã hoàn thành

| Trang | URL | Mô tả |
|-------|-----|-------|
| Đăng nhập | `/login` | Email/MSSV + mật khẩu, Google SSO |
| Chọn loại đăng ký | `/register` | 2 nút: SV trong trường / ngoài trường |
| Đăng ký SV trường | `/register/internal` | Form đầy đủ, validate email @student.humg.edu.vn |
| Đăng ký ngoài trường | `/register/external` | Form + dropdown chọn trường |
| Trang chủ | `/home` | Banner, đội tuyển, thông báo, leaderboard, lịch thi |
| Hồ sơ cá nhân | `/profile` | Thông tin, huy hiệu, thống kê, lịch sử thi |
| Danh sách cuộc thi | `/contests` | Filter, featured banner, 6 card trạng thái |
| Chi tiết cuộc thi | `/contests/:id` | 4 tab, countdown, đăng ký tham dự |

---

## Cách chạy

### Bước 1: Đảm bảo backend đang chạy
```
Backend: http://localhost:8080
```

### Bước 2: Cài thư viện (chỉ cần 1 lần)
```bash
cd frontend-m12
npm install
```

### Bước 3: Chạy
```bash
npm start
```
Mở trình duyệt: **http://localhost:3000**

---

## Lưu ý quan trọng

### Proxy API
File `package.json` đã có `"proxy": "http://localhost:8080"` nên mọi request `/api/...`
tự động forward sang backend. **Không cần sửa gì thêm.**

### Fallback data
Tất cả trang đều có **mock data dự phòng** — nếu API chưa sẵn sàng, trang vẫn hiển thị
đúng giao diện với dữ liệu mẫu.

### Thứ tự kết nối API
Khi backend sẵn sàng, dữ liệu thật sẽ tự động thay thế mock data.
Không cần sửa code thêm.

---

## Lỗi thường gặp

| Lỗi | Cách fix |
|-----|----------|
| `npm install` lỗi | Xóa `node_modules` rồi chạy lại |
| Trang trắng | Mở Console (F12) xem lỗi cụ thể |
| API 401 | Token hết hạn → đăng xuất rồi đăng nhập lại |
| API CORS | Backend chưa chạy hoặc port sai |
| `Cannot find module` | Kiểm tra đường dẫn import trong file |
