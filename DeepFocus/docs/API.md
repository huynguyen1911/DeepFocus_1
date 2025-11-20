# DeepFocus API Documentation

## Phase 2: Class Management System

### Base URL

```
http://localhost:5000/api
```

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Class Endpoints

### 1. Create Class

**POST** `/classes`

Create a new class (Teacher only).

**Request Body:**

```json
{
  "name": "Math 101",
  "description": "Introduction to Mathematics"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "class_id",
    "name": "Math 101",
    "description": "Introduction to Mathematics",
    "createdBy": "teacher_id",
    "joinCode": "ABC123",
    "joinCodeExpiry": "2025-11-27T00:00:00.000Z",
    "members": [
      {
        "_id": "member_id",
        "userId": {
          "_id": "teacher_id",
          "fullName": "Teacher Name",
          "email": "teacher@example.com"
        },
        "role": "teacher",
        "status": "approved"
      }
    ],
    "stats": {
      "totalMembers": 1,
      "totalPomodoros": 0,
      "totalCompletedTasks": 0
    },
    "createdAt": "2025-11-20T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Missing required fields or user is not a teacher
- `401`: Unauthorized (no token)

---

### 2. Get Class Details

**GET** `/classes/:id`

Get details of a specific class (Members only).

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "class_id",
    "name": "Math 101",
    "description": "Introduction to Mathematics",
    "createdBy": "teacher_id",
    "joinCode": "ABC123",
    "joinCodeExpiry": "2025-11-27T00:00:00.000Z",
    "members": [
      {
        "_id": "member_id",
        "userId": {
          "_id": "user_id",
          "fullName": "User Name",
          "email": "user@example.com"
        },
        "role": "student",
        "status": "approved",
        "joinedAt": "2025-11-20T00:00:00.000Z"
      }
    ],
    "stats": {
      "totalMembers": 2,
      "totalPomodoros": 10,
      "totalCompletedTasks": 5
    }
  }
}
```

**Error Responses:**

- `403`: Not a member of this class
- `404`: Class not found

---

### 3. Update Class

**PUT** `/classes/:id`

Update class information (Creator only).

**Request Body:**

```json
{
  "name": "Advanced Math 101",
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    // Updated class object
  }
}
```

**Error Responses:**

- `403`: Not the class creator
- `404`: Class not found

---

### 4. Delete Class

**DELETE** `/classes/:id`

Delete a class (Creator only).

**Response (200):**

```json
{
  "success": true,
  "message": "Class deleted successfully"
}
```

**Error Responses:**

- `403`: Not the class creator
- `404`: Class not found

---

### 5. Get Teacher's Classes

**GET** `/classes/teacher/my-classes`

Get all classes created by the teacher.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "class_id",
      "name": "Math 101",
      "description": "Description",
      "joinCode": "ABC123",
      "joinCodeExpiry": "2025-11-27T00:00:00.000Z",
      "members": [...],
      "stats": {...},
      "createdAt": "2025-11-20T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `403`: User is not a teacher

---

### 6. Get Student's Classes

**GET** `/classes/student/my-classes`

Get all classes the student has joined.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "class_id",
      "name": "Math 101",
      "description": "Description",
      "members": [...],
      "stats": {...},
      "createdAt": "2025-11-20T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `403`: User is not a student

---

### 7. Join Class

**POST** `/classes/join`

Request to join a class using join code (Student only).

**Request Body:**

```json
{
  "joinCode": "ABC123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Join request sent successfully. Waiting for teacher approval.",
  "data": {
    "_id": "class_id",
    "name": "Math 101"
  }
}
```

**Error Responses:**

- `400`: Invalid or expired join code, already a member
- `403`: User is not a student
- `404`: Class not found

---

### 8. Regenerate Join Code

**POST** `/classes/:id/regenerate-code`

Generate a new join code for the class (Creator only).

**Response (200):**

```json
{
  "success": true,
  "data": {
    "joinCode": "XYZ789",
    "joinCodeExpiry": "2025-11-27T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `403`: Not the class creator
- `404`: Class not found

---

### 9. Get Members List

**GET** `/classes/:id/members`

Get list of all members (approved and pending).

**Response (200):**

```json
{
  "success": true,
  "data": {
    "approved": [
      {
        "_id": "member_id",
        "userId": {
          "_id": "user_id",
          "fullName": "User Name",
          "email": "user@example.com"
        },
        "role": "student",
        "status": "approved",
        "joinedAt": "2025-11-20T00:00:00.000Z"
      }
    ],
    "pending": [
      {
        "_id": "member_id",
        "userId": {
          "_id": "user_id",
          "fullName": "Pending User",
          "email": "pending@example.com"
        },
        "role": "student",
        "status": "pending",
        "joinedAt": "2025-11-20T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 10. Approve Join Request

**PUT** `/classes/:id/members/:memberId/approve`

Approve a pending join request (Creator only).

**Response (200):**

```json
{
  "success": true,
  "message": "Member approved successfully",
  "data": {
    // Updated class object
  }
}
```

**Error Responses:**

- `403`: Not the class creator
- `404`: Class or member not found

---

### 11. Reject Join Request

**PUT** `/classes/:id/members/:memberId/reject`

Reject a pending join request (Creator only).

**Response (200):**

```json
{
  "success": true,
  "message": "Join request rejected"
}
```

**Error Responses:**

- `403`: Not the class creator
- `404`: Class or member not found

---

### 12. Remove Member

**DELETE** `/classes/:id/members/:memberId`

Remove a member from the class (Creator only).

**Response (200):**

```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

**Error Responses:**

- `400`: Cannot remove class creator
- `403`: Not the class creator
- `404`: Class or member not found

---

## Join Code System

### Code Generation

- **Format**: 6 alphanumeric characters (uppercase)
- **Expiry**: 7 days from creation
- **Uniqueness**: Codes are checked for duplicates

### Code Validation

- Code must be exactly 6 characters
- Code must not be expired
- User cannot join the same class twice
- Only students can use join codes

### Code Lifecycle

1. Generated when class is created
2. Can be regenerated by class creator
3. Expires after 7 days
4. Old codes become invalid when regenerated

---

## Member Management

### Member Status

- **pending**: Join request sent, waiting for approval
- **approved**: Member is active in the class

### Member Roles

- **teacher**: Class creator
- **student**: Regular class member

### Permissions

- **Class Creator**:
  - Update class information
  - Delete class
  - Regenerate join code
  - Approve/reject join requests
  - Remove members
- **Members**:
  - View class details
  - View member list
  - Leave class (future feature)

### Profile Synchronization

- When student is approved: Class ID added to user profile
- When member is removed: Class ID removed from user profile
- When class is deleted: All members' profiles updated

---

## Error Codes

| Code | Description                                            |
| ---- | ------------------------------------------------------ |
| 400  | Bad Request - Invalid input or business rule violation |
| 401  | Unauthorized - Missing or invalid authentication token |
| 403  | Forbidden - Insufficient permissions                   |
| 404  | Not Found - Resource doesn't exist                     |
| 500  | Internal Server Error - Unexpected server error        |

---

## Testing

### Backend Tests

Run unit tests:

```bash
cd backend
npm test -- classController.test.js
```

Run integration tests:

```bash
npm test -- class.test.js
```

### Frontend Tests

Run context tests:

```bash
npm test -- ClassContext.test.js
```

---

## Notes

1. All timestamps are in ISO 8601 format
2. All requests must include valid JWT token
3. Role-based access control is enforced
4. Join codes are case-insensitive but stored as uppercase
5. Member stats are cached in class document for performance
