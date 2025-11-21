# Backend API Endpoints - Complete Documentation

## 🎯 Authentication & Users

### POST /auth/register
Create new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "CONSUMER" | "SUPPLIER_OWNER"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "CONSUMER"
}
```

---

### POST /auth/login
Login and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### GET /auth/me
Get current user info.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "CONSUMER"
}
```

---

## 🏢 Suppliers

### POST /suppliers
Create supplier company (Owner only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Fresh Fish Co",
  "description": "Premium seafood supplier"
}
```

**Response:** `201 Created`

---

### GET /suppliers
List all suppliers (for consumer discovery).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Fresh Fish Co",
    "description": "Premium seafood supplier",
    "owner_id": 2
  }
]
```

---

### GET /suppliers/me
Get my supplier profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 👥 Staff Management (NEW!)

### POST /staff
Create new staff member (Owner only).

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER only

**Request Body:**
```json
{
  "email": "manager@company.com",
  "password": "password123",
  "role": "SUPPLIER_MANAGER" | "SUPPLIER_SALES"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "user_id": 5,
  "supplier_id": 1,
  "role": "SUPPLIER_MANAGER",
  "invited_by": 2,
  "created_at": "2025-11-22T01:30:00Z",
  "user": {
    "id": 5,
    "email": "manager@company.com",
    "role": "SUPPLIER_MANAGER"
  }
}
```

**Business Rules:**
- Only SUPPLIER_OWNER can create staff
- Can only create MANAGER or SALES roles
- Email must be unique
- Creates both User and SupplierStaff records

---

### GET /staff
List all staff members.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 5,
    "supplier_id": 1,
    "role": "SUPPLIER_MANAGER",
    "invited_by": 2,
    "created_at": "2025-11-22T01:30:00Z",
    "user": {
      "id": 5,
      "email": "manager@company.com",
      "role": "SUPPLIER_MANAGER"
    }
  }
]
```

---

### PATCH /staff/{staff_id}
Update staff member's role (Owner only).

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER only

**Request Body:**
```json
{
  "role": "SUPPLIER_MANAGER" | "SUPPLIER_SALES"
}
```

**Response:** `200 OK`

---

### DELETE /staff/{staff_id}
Delete staff member (Owner only).

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER only

**Response:** `204 No Content`

**Note:** Deletes both SupplierStaff record and User account.

---

## 🔗 Links (Consumer ↔ Supplier Connections)

### POST /links/{supplier_id}
Consumer requests link with supplier.

**Headers:** `Authorization: Bearer <token>`

**Access:** CONSUMER only

**Response:** `201 Created`

---

### POST /links/{link_id}/accept
Supplier accepts link request.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Response:** `200 OK`

---

### POST /links/{link_id}/reject
Supplier rejects link request.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Response:** `200 OK`

---

### GET /links/me
Get my links.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 📦 Products

### POST /products
Create product (Owner/Manager).

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Request Body:**
```json
{
  "name": "Fresh Salmon",
  "description": "Atlantic salmon, fresh daily",
  "price": 15.99,
  "stock": 100,
  "unit": "kg",
  "moq": 5,
  "is_active": true
}
```

**Response:** `201 Created`

---

### GET /products?supplier_id={id}
List products for a supplier (Consumer view).

**Headers:** `Authorization: Bearer <token>`

**Access:** CONSUMER (with ACCEPTED link)

**Query Parameters:**
- `supplier_id` (required): Supplier ID

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "supplier_id": 1,
    "name": "Fresh Salmon",
    "description": "Atlantic salmon",
    "price": 15.99,
    "stock": 100,
    "unit": "kg",
    "moq": 5,
    "is_active": true
  }
]
```

**Business Rule:** Consumer must have ACCEPTED link to view prices.

---

### GET /products/me
Get my supplier's products.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER, SUPPLIER_SALES

**Response:** `200 OK`

---

### PUT /products/{product_id}
Update product.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Response:** `200 OK`

---

### DELETE /products/{product_id}
Delete product.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Response:** `204 No Content`

---

## 🛒 Orders

### POST /orders
Create order (Consumer).

**Headers:** `Authorization: Bearer <token>`

**Access:** CONSUMER only

**Request Body:**
```json
{
  "supplier_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 10
    },
    {
      "product_id": 2,
      "quantity": 5
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "supplier_id": 1,
  "consumer_id": 3,
  "total_amount": 250.50,
  "status": "CREATED",
  "created_at": "2025-11-22T02:00:00Z",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 10,
      "unit_price": 15.99,
      "product": {
        "id": 1,
        "name": "Fresh Salmon",
        "unit": "kg"
      }
    }
  ]
}
```

**Business Rules:**
- Must have ACCEPTED link
- Checks MOQ (minimum order quantity)
- Validates stock availability
- Calculates total_amount automatically

---

### GET /orders/me?status={status}
Get my orders with optional filter (NEW!).

**Headers:** `Authorization: Bearer <token>`

**Access:** All roles (CONSUMER, SUPPLIER_OWNER, SUPPLIER_MANAGER, SUPPLIER_SALES)

**Query Parameters:**
- `status` (optional): Filter by order status
  - `CREATED`
  - `ACCEPTED`
  - `REJECTED`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "supplier_id": 1,
    "consumer_id": 3,
    "total_amount": 250.50,
    "status": "CREATED",
    "created_at": "2025-11-22T02:00:00Z",
    "supplier": {
      "id": 1,
      "name": "Fresh Fish Co"
    },
    "consumer": {
      "id": 3,
      "email": "restaurant@example.com",
      "role": "CONSUMER"
    },
    "items": [...]
  }
]
```

**Behavior:**
- **Consumer:** Returns their orders
- **Supplier Staff:** Returns orders to their company

---

### GET /orders/{order_id} (NEW!)
Get detailed order information.

**Headers:** `Authorization: Bearer <token>`

**Access:** Order consumer OR supplier staff

**Response:** `200 OK` (same structure as above)

**Authorization:**
- Consumer can view their own orders
- Supplier staff can view orders to their company

---

### POST /orders/{order_id}/accept
Accept order (Supplier Owner/Manager).

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Response:** `200 OK`

---

### POST /orders/{order_id}/reject
Reject order (Supplier Owner/Manager).

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_OWNER, SUPPLIER_MANAGER

**Response:** `200 OK`

---

## 💬 Chat

### POST /chat/{link_id}/messages
Send message.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Hello, do you have salmon in stock?"
}
```

**Response:** `201 Created`

---

### GET /chat/{link_id}/messages
Get messages for a link.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## 🚨 Complaints

### POST /complaints
Create complaint.

**Headers:** `Authorization: Bearer <token>`

**Access:** CONSUMER

**Request Body:**
```json
{
  "link_id": 1,
  "order_id": 5,
  "description": "Product quality issue"
}
```

**Response:** `201 Created`

---

### GET /complaints
List complaints.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### POST /complaints/{id}/escalate
Escalate complaint to Manager.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_SALES

**Response:** `200 OK`

---

### PATCH /complaints/{id}/status
Update complaint status.

**Headers:** `Authorization: Bearer <token>`

**Access:** SUPPLIER_MANAGER, SUPPLIER_OWNER

**Request Body:**
```json
{
  "status": "IN_PROGRESS" | "RESOLVED" | "REJECTED"
}
```

**Response:** `200 OK`

---

## 🔐 Authorization Matrix

| Endpoint | Consumer | Owner | Manager | Sales |
|----------|----------|-------|---------|-------|
| POST /staff | ❌ | ✅ | ❌ | ❌ |
| GET /staff | ❌ | ✅ | ✅ | ❌ |
| PATCH /staff/{id} | ❌ | ✅ | ❌ | ❌ |
| DELETE /staff/{id} | ❌ | ✅ | ❌ | ❌ |
| POST /links/{id}/accept | ❌ | ✅ | ✅ | ❌ |
| POST /products | ❌ | ✅ | ✅ | ❌ |
| GET /products?supplier_id | ✅ | ❌ | ❌ | ❌ |
| GET /products/me | ❌ | ✅ | ✅ | ✅ |
| POST /orders | ✅ | ❌ | ❌ | ❌ |
| GET /orders/me | ✅ | ✅ | ✅ | ✅ |
| GET /orders/{id} | ✅* | ✅ | ✅ | ✅ |
| POST /orders/{id}/accept | ❌ | ✅ | ✅ | ❌ |
| POST /complaints/escalate | ❌ | ❌ | ❌ | ✅ |
| PATCH /complaints/status | ❌ | ✅ | ✅ | ❌ |

\* Consumer can only view their own orders

---

## 🚀 Testing with Swagger

1. Start the backend:
   ```bash
   docker-compose up
   ```

2. Open Swagger UI:
   ```
   http://localhost:8000/docs
   ```

3. Test flow:
   - Register Owner: POST /auth/register (role: SUPPLIER_OWNER)
   - Login: POST /auth/login → copy token
   - Click "Authorize" button → paste token
   - Create supplier: POST /suppliers
   - Create staff: POST /staff (Manager & Sales)
   - Register Consumer: POST /auth/register (role: CONSUMER)
   - Consumer requests link: POST /links/{supplier_id}
   - Owner/Manager accepts link: POST /links/{link_id}/accept
   - Owner/Manager creates products: POST /products
   - Consumer views catalog: GET /products?supplier_id=1
   - Consumer creates order: POST /orders
   - View order details: GET /orders/{order_id}
   - Filter orders: GET /orders/me?status=CREATED
   - Owner/Manager accepts order: POST /orders/{order_id}/accept

---

## 🐛 Error Responses

All endpoints return standard error format:

```json
{
  "detail": "Error message here"
}
```

Common HTTP status codes:
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error

---

## 📝 Notes

1. **Supplier Lookup for Manager/Sales:**
   - Uses new `StaffRepo.get_supplier_for_user()` helper
   - Works for Owner (checks suppliers table)
   - Works for Manager/Sales (checks supplier_staff table)

2. **Order Filtering:**
   - Both consumer and supplier sides support `?status=` filter
   - Valid statuses: CREATED, ACCEPTED, REJECTED

3. **Staff Management:**
   - Only Owner can create/delete staff
   - Owner and Manager can view staff list
   - Sales cannot view or manage staff

4. **Data Consistency:**
   - When staff is deleted, both User and SupplierStaff records are removed
   - When staff role is updated, both User.role and SupplierStaff.role are updated





1. РЕГИСТРАЦИЯ
   POST /auth/register
   {
     "email": "restaurant@test.com",
     "password": "password123",
     "role": "CONSUMER"
   }
   → Получает JWT token

2. ПОИСК SUPPLIERS
   GET /suppliers
   → Видит список всех suppliers (поиск доступен)

3. ЗАПРОС LINK
   POST /links/{supplier_id}
   → Создает link со статусом PENDING

4. ПРОВЕРКА СТАТУСА LINK
   GET /links/me
   → Видит свои links (PENDING/ACCEPTED/BLOCKED)

5. ПРОСМОТР КАТАЛОГА (после ACCEPTED)
   GET /products?supplier_id={supplier_id}
   → Видит продукты только если link ACCEPTED

6. СОЗДАНИЕ ЗАКАЗА
   POST /orders
   {
     "supplier_id": 1,
     "items": [
       {"product_id": 1, "quantity": 10},
       {"product_id": 2, "quantity": 5}
     ]
   }
   → Создает order со статусом CREATED

7. ОТСЛЕЖИВАНИЕ ЗАКАЗОВ
   GET /orders/me
   → Видит все свои заказы

8. ЧАТ С SUPPLIER
   POST /chat/{link_id}/messages
   {
     "text": "Hello, when can you deliver?"
   }
   → Отправляет сообщение

9. ЖАЛОБА (если нужно)
   POST /complaints
   {
     "link_id": 1,
     "order_id": 1,
     "description": "Product quality issue"
   }






   1. РЕГИСТРАЦИЯ OWNER
   POST /auth/register
   {
     "email": "owner@supplier.com",
     "password": "password123",
     "role": "SUPPLIER_OWNER"
   }

2. СОЗДАНИЕ КОМПАНИИ
   POST /suppliers
   {
     "name": "Fresh Farm Co",
     "description": "Organic vegetables"
   }
   → Создает supplier company

3. ПРОСМОТР ПРОФИЛЯ
   GET /suppliers/me
   → Видит свою компанию

4. УПРАВЛЕНИЕ КАТАЛОГОМ
   POST /products
   {
     "name": "Tomatoes",
     "unit": "kg",
     "price": 500.00,
     "stock": 100,
     "moq": 10
   }
   → Создает продукт

   GET /products/me
   → Видит все свои продукты

5. ПРОСМОТР LINK REQUESTS
   GET /links/me
   → Видит входящие запросы от consumers

6. ПРИНЯТИЕ LINK
   POST /links/{link_id}/accept
   → Меняет статус на ACCEPTED
   → Теперь consumer может видеть каталог

7. ПРОСМОТР ЗАКАЗОВ
   GET /orders/me
   → Видит все заказы к своей компании

8. ПРИНЯТИЕ/ОТКЛОНЕНИЕ ЗАКАЗА
   POST /orders/{order_id}/accept
   → Меняет статус на ACCEPTED

   POST /orders/{order_id}/reject
   → Меняет статус на REJECTED

9. ОБРАБОТКА ЖАЛОБ
   GET /complaints
   → Видит жалобы от consumers

   POST /complaints/{id}/escalate  (только Sales)
   → Эскалирует жалобу Manager/Owner





   /auth
  ├── POST /register      # Регистрация
  ├── POST /login         # Логин → JWT token
  └── GET  /me            # Текущий пользователь

/suppliers
  ├── POST /              # Создать supplier (Owner only)
  ├── GET  /              # Список всех suppliers (Consumer discovery)
  └── GET  /me            # Мой supplier profile

/links
  ├── POST /{supplier_id}        # Запросить link (Consumer)
  ├── POST /{link_id}/accept     # Принять link (Owner/Manager)
  ├── POST /{link_id}/block      # Заблокировать (Owner/Manager)
  ├── POST /{link_id}/remove     # Удалить link (Owner/Manager)
  ├── GET  /                     # Список links
  └── GET  /me                   # Мои links

/products
  ├── POST /              # Создать продукт (Owner/Manager)
  ├── GET  /              # Список продуктов (Consumer, нужен supplier_id)
  ├── GET  /me            # Мои продукты (Supplier)
  ├── PUT  /{id}          # Обновить продукт
  └── DELETE /{id}       # Удалить продукт

/orders
  ├── POST /              # Создать заказ (Consumer)
  ├── GET  /me            # Мои заказы
  ├── POST /{id}/accept   # Принять заказ (Owner/Manager)
  └── POST /{id}/reject   # Отклонить заказ (Owner/Manager)

/chat
  ├── POST /{link_id}/messages   # Отправить сообщение
  └── GET  /{link_id}/messages   # Получить сообщения

/complaints
  ├── POST /                      # Создать жалобу (Consumer)
  ├── GET  /                      # Список жалоб
  ├── POST /{id}/escalate         # Эскалировать (Sales)
  └── PATCH /{id}/status          # Изменить статус (Owner)