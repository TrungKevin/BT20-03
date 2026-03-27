# Huong dan test du an NNPTUD-C6

Tai lieu nay tong hop day du cac buoc chay va test du an bang Docker + Postman.

## 1) Dieu kien truoc khi test

- Da cai dat Docker Desktop
- Da cai Node.js + npm
- Da mo terminal tai thu muc du an: `D:\Tung_NNPTUDM\NNPTUD-C6`

## 2) Chay dich vu

### 2.1. Khoi dong MongoDB bang Docker

```powershell
docker compose up -d
docker compose ps
```

Ky vong: `mongo1`, `mongo2`, `mongo3` deu o trang thai `Up`.

### 2.2. Chay server Node.js

```powershell
npm install
npm start
```

Server app chay tai:

- `http://localhost:3000`

## 3) Link can dung de test API

Base URL:

- `http://localhost:3000/api/v1`

API chinh:

- Categories: `http://localhost:3000/api/v1/categories`
- Products: `http://localhost:3000/api/v1/products`
- Inventories: `http://localhost:3000/api/v1/inventories`

## 4) Ket noi MongoDB Compass

Neu Compass bi loi ket noi `localhost:27017`, dung URI sau:

```text
mongodb://127.0.0.1:27017/NNPTUD-C6?directConnection=true
```

Sau khi connect thanh cong, ban se thay database:

- `NNPTUD-C6`

## 5) Huong dan test Postman theo dung thu tu

> Luu y: Chon Body -> `raw` -> `JSON` cho cac request POST.

### Buoc 1: Tao Category (neu chua co)

- Method: `POST`
- URL: `http://localhost:3000/api/v1/categories`
- Body:

```json
{
  "name": "Thoi trang nam",
  "description": "Danh muc test",
  "images": ["https://example.com/category.jpg"]
}
```

Ket qua:

- Copy `_id` cua category de dung cho buoc tao product.

### Buoc 2: Tao Product (tu dong tao Inventory)

- Method: `POST`
- URL: `http://localhost:3000/api/v1/products`
- Body:

```json
{
  "title": "Ao so mi test",
  "price": 199000,
  "description": "San pham test inventory",
  "categoryId": "PUT_CATEGORY_ID_HERE",
  "images": ["https://example.com/a.jpg"]
}
```

Ket qua:

- Copy `_id` cua product (`productId`) de test inventory.

### Buoc 3: Xem danh sach Inventory

- Method: `GET`
- URL: `http://localhost:3000/api/v1/inventories`

Ky vong:

- Co inventory tuong ung voi product vua tao.

### Buoc 4: Add stock

- Method: `POST`
- URL: `http://localhost:3000/api/v1/inventories/add_stock`
- Body:

```json
{
  "product": "PUT_PRODUCT_ID_HERE",
  "quantity": 50
}
```

Ky vong:

- `stock = 50`

### Buoc 5: Reservation

- Method: `POST`
- URL: `http://localhost:3000/api/v1/inventories/reservation`
- Body:

```json
{
  "product": "PUT_PRODUCT_ID_HERE",
  "quantity": 10
}
```

Ky vong:

- `stock = 40`
- `reserved = 10`

### Buoc 6: Sold

- Method: `POST`
- URL: `http://localhost:3000/api/v1/inventories/sold`
- Body:

```json
{
  "product": "PUT_PRODUCT_ID_HERE",
  "quantity": 5
}
```

Ky vong:

- `reserved = 5`
- `soldCount = 5`

### Buoc 7: Remove stock

- Method: `POST`
- URL: `http://localhost:3000/api/v1/inventories/remove_stock`
- Body:

```json
{
  "product": "PUT_PRODUCT_ID_HERE",
  "quantity": 35
}
```

Ky vong:

- `stock = 5`

### Buoc 8: Test loi am kho (quan trong)

- Method: `POST`
- URL: `http://localhost:3000/api/v1/inventories/remove_stock`
- Body:

```json
{
  "product": "PUT_PRODUCT_ID_HERE",
  "quantity": 10
}
```

Ky vong:

- `400 Bad Request`
- Message loi thieu hang (vi stock khong du).

## 6) Kiem tra nhanh bang trinh duyet

Ban co the kiem tra app dang chay bang cach mo:

- `http://localhost:3000/`

Neu vao duoc URL tren va Postman goi API tra ve du lieu, nghia la du an dang hoat dong tot.

## 7) Lenh dung moi truong sau khi test

Trong terminal dang chay `npm start`, bam `Ctrl + C` de dung server.

Sau do dung Docker:

```powershell
docker compose down
```

## 8) Loi thuong gap va cach xu ly

- `ECONNREFUSED 127.0.0.1:3000`
  - Nguyen nhan: Chua chay server Node.js
  - Cach xu ly: chay `npm start`

- `MongooseServerSelectionError` / `ENOTFOUND mongo1`
  - Nguyen nhan: Chuoi ket noi MongoDB khong phu hop khi chay tren host
  - Cach xu ly: Dam bao app dung ket noi local (`127.0.0.1`) va Docker containers dang `Up`.

- Compass khong connect duoc `localhost:27017`
  - Cach xu ly: Dung URI:
    `mongodb://127.0.0.1:27017/NNPTUD-C6?directConnection=true`
