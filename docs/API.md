# QalaKart API Documentation

This file documents the available API endpoints according to the project blueprint standard.

## Auth Module

### POST /api/v1/auth/register
**Description:** Registers a new user.
**Auth required:** No
**Minimum role:** public
#### Request
Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "buyer" // optional, defaults to buyer
}
```
#### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "accessToken": "ey...",
    "user": { "id": "...", "email": "...", "role": "buyer" }
  }
}
```

### POST /api/v1/auth/login
**Description:** Authenticates an existing user and returns an access token, setting a refresh cookie.
**Auth required:** No
**Minimum role:** public
#### Request
Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "ey...",
    "user": { "id": "...", "email": "...", "role": "buyer" }
  }
}
```

### POST /api/v1/auth/refresh
**Description:** Refreshes an expired access token using the HttpOnly refresh cookie.
**Auth required:** Yes (via Cookie)
**Minimum role:** public
#### Request
Headers: Cookie: `refresh_token=ey...`
#### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "ey...",
    "user": { "id": "...", "email": "...", "role": "buyer" }
  }
}
```

### POST /api/v1/auth/logout
**Description:** Clears the refresh cookie and revokes the session.
**Auth required:** No (but typically sent with refresh cookie)
**Minimum role:** public
#### Response — 200 OK
```json
{
  "success": true,
  "data": { "ok": true }
}
```

---

## Products Module

### GET /api/v1/products
**Description:** Fetches a paginated list of products.
**Auth required:** No
**Minimum role:** public
#### Request
Query params:
- `?page=1&limit=20` (pagination)
- `?search=query` (full-text search)
- `?category=painting` (filter)
#### Response — 200 OK
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

### POST /api/v1/products
**Description:** Creates a new product under the authenticated user.
**Auth required:** Yes
**Minimum role:** buyer/creator
#### Request
Headers: `Authorization: Bearer <accessToken>`
Body:
```json
{
  "title": "My Artwork",
  "description": "...",
  "price": 100,
  "category": "art"
}
```
#### Response — 201 Created
```json
{
  "success": true,
  "data": { "_id": "...", "title": "..." }
}
```

### PATCH /api/v1/products/:id
**Description:** Updates a product. Must be owned by the user.
**Auth required:** Yes
**Minimum role:** owner
#### Request
Path params: `:id`
Headers: `Authorization: Bearer <accessToken>`
Body: (Partial Product object)

### DELETE /api/v1/products/:id
**Description:** Soft-deletes a product. Must be owned by the user.
**Auth required:** Yes
**Minimum role:** owner
#### Request
Path params: `:id`
Headers: `Authorization: Bearer <accessToken>`
#### Response — 200 OK
```json
{
  "success": true,
  "data": { "ok": true }
}
```
