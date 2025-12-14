# CRUD API

Node.js CRUD API.

- Built on Node.js
- In-memory storage
- Single-instance mode and multi-process mode
- Integration tests (Jest + Supertest)

---

## Requirements

- Node.js 24.x.x version (24.14.0 or upper)
- npm

---

## Setup

Install dependencies:

```bash
npm install
```

.env

```bash
PORT=3000
```

## Scripts

```bash
npm run start:dev    # Single-instance dev server (nodemon)
npm run start:multi  # Cluster mode
npm run build        # Build production bundle (webpack)
npm run start:prod   # Build and run bundle (build + node dist/bundle.js)
npm test             # Run tests (Jest + Supertest)
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

## API

### 1. Get all users

**GET** `/users`

Returns a list of all users.

**Responses:**

- `200 OK` – JSON array of users (`[]` if no users)

---

### 2. Get user by id

**GET** `/users/:id`

Returns a single user by `id`.

**Responses:**

- `200 OK` – JSON object of the user
- `400 Bad Request` – invalid `id` format
- `404 Not Found` – user with this `id` does not exist

---

### 3. Create user

**POST** `/users`

Creates a new user.

**Request body:**

```json
{
  "username": "string",
  "age": number,
  "hobbies": ["string", "..."]
}

```

**Responses:**

- `201 Created` – JSON object of created user with generated id

- `400 Bad Request` – missing or invalid fields

---

### 4. Update user

**PUT** `/users/:id`

Updates an existing user.

**Request body:**

```json
{
  "username": "string",
  "age": number,
  "hobbies": ["string", "..."]
}

```

**Responses:**

- `200 OK` – JSON object of updated user (same id)

- `400 Bad Request` – invalid id format or invalid body

- `404 Not Found` – user with this id does not exist

---

### 5. Delete user

**DELETE** `/users/:id`

Deletes a user by id.

**Responses:**

- `204 No Content` – user deleted

- `400 Bad Request` – invalid id format

- `404 Not Found` – user with this id does not exist
