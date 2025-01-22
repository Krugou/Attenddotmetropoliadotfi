# Metropolia Attendance App Backend

Welcome to the TypeDoc documentation for the Metropolia Attendance App backend. This application is a convenient solution for teachers and students to take attendance during classes. It's designed to streamline the attendance process, making it easier for teachers to keep track of student attendance and for students to check in to their classes.

## Key Features

Efficient Attendance Management: Teachers can effortlessly manage and monitor student attendance through well-defined routes and controllers. The backend's structure ensures a smooth flow of data, enabling efficient attendance tracking.

Easy Check-In: Students benefit from a user-friendly check-in process, allowing them to quickly and conveniently register their attendance with just a few taps. The backend's design prioritizes a hassle-free experience for students.

## Architecture

The backend is organized into distinct components:

## Routes
Define the various endpoints that handle incoming requests from the frontend, triggering corresponding controllers.

## Controllers
Process requests from the routes, interact with models, and ensure the proper flow of information within the application.

## Models
Represent data entities and the structure of the database, defining how data is stored, retrieved, and manipulated within the backend.

## API Documentation

The API documentation provides detailed information about the available endpoints, request parameters, and response formats. It serves as a comprehensive guide for developers to understand and utilize the backend API effectively.

### Endpoints

#### Admin Routes

- **GET /admin/**: Fetches the server settings.
- **POST /admin/**: Updates the server settings.
- **GET /admin/rolesspecial**: Fetches the teacher and counselor roles.
- **GET /admin/roles**: Fetches all roles.
- **POST /admin/change-role**: Changes the role of a user.
- **GET /admin/getusers**: Fetches all users.
- **GET /admin/getuser/:userid**: Fetches a user by their ID.
- **POST /admin/insert-student-user/**: Inserts a new student user.
- **POST /admin/insert-staff-user/**: Inserts a new staff user.
- **GET /admin/alllectures/**: Fetches all lectures.
- **GET /admin/lectureandattendancecount/**: Fetches the count of lectures and attendance.
- **GET /admin/allattendancedatabycourse/:courseid/:lectureid**: Fetches all attendance data by course and lecture.
- **GET /admin/getcourses**: Fetches all courses with their details.
- **PUT /admin/updateuser**: Updates a user.
- **GET /admin/checkstudentnumber/:studentnumber**: Checks if a student number exists.
- **GET /admin/checkstudentemail/:email**: Checks if a student email exists.
- **GET /admin/getrolecounts**: Fetches the counts of users for each role.
- **GET /admin/feedback**: Fetches all feedback.
- **DELETE /admin/feedback/:feedbackId**: Deletes a feedback entry.
- **DELETE /admin/attendance/delete/:attendanceid**: Deletes an attendance record.
- **GET /admin/errorlogs/:lineLimit**: Fetches error logs with a line limit.
- **GET /admin/logs/:lineLimit**: Fetches logs with a line limit.

## Error Handling

The backend implements comprehensive error handling mechanisms to ensure robustness and reliability. Custom error types are used to provide clear and meaningful error messages. Proper error handling is implemented at various levels, including routes, controllers, and models, to handle different types of errors gracefully.

### Custom Error Types

- **HttpError**: Represents an HTTP error with a status code and message.

### Error Handling in Routes

- **Admin Routes**: Error handling is implemented using try-catch blocks and logging errors with meaningful messages.

### Error Handling in Controllers

- **AdminController**: Error handling is implemented using try-catch blocks and logging errors with meaningful messages.

### Error Handling in Models

- **CourseModel**: Error handling is implemented using try-catch blocks and logging errors with meaningful messages.

## Security Best Practices

The backend follows security best practices to protect sensitive data and prevent common vulnerabilities. Input validation and sanitization are performed to prevent injection attacks. Authentication and authorization mechanisms are implemented to ensure that only authorized users can access protected resources. Additionally, rate limiting and logging are used to detect and mitigate potential security threats.

### Input Validation and Sanitization

- **Express Validator**: Used to validate and sanitize input data in routes.

### Authentication and Authorization

- **JWT Authentication**: JSON Web Tokens (JWT) are used for authentication and authorization.

### Rate Limiting

- **Rate Limiting Middleware**: Implemented to limit the number of requests from a single IP address.

### Logging

- **Winston Logger**: Used to log errors and important events in the application.

Navigate through the documentation to gain a deep understanding of the backend codebase. Each module, class, interface, type, and function is meticulously documented to provide comprehensive insights into the structure and functionality of the code.
- **Efficient Attendance Management:** Teachers can easily manage and keep track of student attendance.
- **Easy Check-In:** Students can quickly check in to their classes with just a few taps.

Navigate through the documentation to understand the structure and functionality of the backend codebase. Each module, class, interface, type, and function is documented in detail to provide a comprehensive understanding of the code.

Happy coding!
