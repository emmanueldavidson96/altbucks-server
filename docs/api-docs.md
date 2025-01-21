# Task Management API Documentation

## Base URL
```
/api/v1/tasks
```

## Authentication
All endpoints require authentication using a JWT token. The user ID is extracted from this token and used to scope all operations.

```
Authorization: Bearer <your_token>
```

## Endpoints

### Create Task
Creates a new task with optional file attachments.

- **URL:** `/create-task`
- **Method:** `POST`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **Required Fields:**
    - `title`
    - `taskType`
    - `description`
    - `requirements`
    - `maxRespondents`
    - `deadline`
    - `location`
    - `compensation` (JSON string with required `amount` field)
- **Optional Fields:**
    - `links` (JSON array of strings)
    - `files` (maximum 5 files)
- **Request Body Example:**
```json
{
  "title": "Task Title",
  "taskType": "string",
  "description": "string",
  "requirements": "string",
  "maxRespondents": "number",
  "deadline": "2024-01-21T00:00:00.000Z",
  "location": "string",
  "compensation": "{\"amount\": 100, \"currency\": \"USD\"}",
  "files": "file",
  "links": "[\"https://example.com\"]"
}
```
- **Success Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    // Task object
  }
}
```

### Get All Tasks
Retrieves all tasks with pagination.

- **URL:** `/tasks`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
    - `page` (default: 1)
    - `limit` (default: 10)
- **Success Response:**
```json
{
  "tasks": [],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 3
  }
}
```

### Get Recent Tasks
Retrieves the most recent tasks.

- **URL:** `/recent-tasks`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
    - `limit` (default: 5)
- **Success Response:**
```json
{
  "tasks": []
}
```

### Search Tasks
Search tasks based on query parameters.

- **URL:** `/search-tasks`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
    - `query`: Search in title and description
    - `taskType`: Filter by task type
- **Response:** Returns matching tasks

### Get Tasks by Status
Retrieves tasks filtered by their status.

- **URL:** `/tasks-by-status/:status`
- **Method:** `GET`
- **Authentication:** Required
- **Valid Status Values:**
    - 'pending'
    - 'in progress'
    - 'completed'
- **Success Response:**
```json
{
  "tasks": []
}
```

### Get Upcoming Deadlines
Retrieves tasks with upcoming deadlines.

- **URL:** `/upcoming-tasks`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
    - `days` (default: 7): Number of days to look ahead
- **Response:** Returns tasks with deadlines within the specified period

### Get Specific Task
Retrieves a specific task by ID.

- **URL:** `/task/:id`
- **Method:** `GET`
- **Authentication:** Required
- **Success Response:**
```json
{
  "task": {
    // Task object
  }
}
```

### Update Task Status

#### Mark as Complete
- **URL:** `/task-complete/:id`
- **Method:** `PATCH`
- **Authentication:** Required
- **Response:** Returns updated task

#### Mark as Pending
- **URL:** `/task-pending/:id`
- **Method:** `PATCH`
- **Authentication:** Required
- **Response:** Returns updated task

### Update Task
Updates task details.

- **URL:** `/update-task/:id`
- **Method:** `PATCH`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **File Upload:** Maximum 5 files
- **Response:** Returns updated task

### Delete Task
Deletes a specific task.

- **URL:** `/delete-task/:id`
- **Method:** `DELETE`
- **Authentication:** Required
- **Success Response:**
```json
{
  "message": "Task deleted"
}
```

### Filter Tasks
Retrieves tasks based on multiple filter criteria.

- **URL:** `/filter`
- **Method:** `GET`
- **Authentication:** Required
- **Query Parameters:**
    - `datePosted`: Filter by posting date
        - Values: 'today', 'past_week', 'past_month', 'anytime'
    - `skills`: Filter by task type
    - `taskPay`: Filter by payment range
        - Values: '50-80', '80-100', '100-120', '120-150', '150-200', 'above_200'
- **Success Response:**
```json
{
  "tasks": [],
  "appliedFilters": {
    "datePosted": "string",
    "skills": "string",
    "taskPay": "string"
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "message": "Missing required fields: fieldName1, fieldName2"
}
```

### Not Found Error (404)
```json
{
  "message": "Task not found"
}
```

### Authorization Error (401)
```json
{
  "message": "Unauthorized"
}
```

## Notes
1. All tasks are scoped to the authenticated user's ID
2. Files are stored in the `/uploads` directory
3. Compensation must be provided as a JSON string with an amount field
4. Links must be provided as a JSON array of strings
5. Date filters are applied based on server's timezone