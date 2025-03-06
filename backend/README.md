# Metropolia Attendance App Backend

Welcome to the TypeDoc documentation for the Metropolia Attendance App backend. This application is a convenient solution for teachers and students to take attendance during classes. It's designed to streamline the attendance process, making it easier for teachers to keep track of student attendance and for students to check in to their classes.

## Key Features

- **Efficient Attendance Management**: Teachers can effortlessly manage and monitor student attendance through well-defined routes and controllers. The backend's structure ensures a smooth flow of data, enabling efficient attendance tracking.
- **Easy Check-In**: Students benefit from a user-friendly check-in process, allowing them to quickly and conveniently register their attendance with just a few taps. The backend's design prioritizes a hassle-free experience for students.
- **Type-Safe Implementation**: Leverages TypeScript's strong typing system for enhanced code reliability and maintainability.
- **Comprehensive Error Handling**: Implements domain-specific error types and robust error handling throughout the application.
- **Secure Authentication**: Utilizes JWT for secure authentication with proper token rotation and authorization controls.
- **Performance-Optimized**: Implements connection pooling, proper resource management, and performance monitoring.

## Architecture

The backend follows SOLID principles and clean code practices, organized into distinct components:

### Routes

Define the various endpoints that handle incoming requests from the frontend, triggering corresponding controllers. Routes are organized by domain and implement proper input validation and sanitization using Express Validator.

### Controllers

Process requests from the routes, interact with models, and ensure the proper flow of information within the application. Controllers implement proper error handling and follow the single responsibility principle.

### Models

Represent data entities and the structure of the database, defining how data is stored, retrieved, and manipulated within the backend. Models implement proper connection management and resource pooling.

### Services

Implement business logic that spans multiple models or requires specific processing. Services handle complex operations while maintaining separation of concerns.

### Middleware

Implement cross-cutting concerns such as authentication, authorization, logging, and error handling. Middleware components ensure consistent behavior across the application.

## Code Quality & Architecture

### Type Safety & Error Handling

The backend implements comprehensive type safety and error handling:

- **Domain-Specific Error Types**: Custom error hierarchies for different parts of the application.
- **Strict TypeScript Typing**: Comprehensive interfaces and type guards.
- **Defensive Programming**: Thorough input validation and sanitization.
- **Error Boundaries**: Structured error catching and handling at appropriate levels.
- **Comprehensive Logging**: Detailed logging with appropriate severity levels using Winston.

### Development Patterns

The codebase adheres to the following development patterns:

- **SOLID Principles**: Each component has a single responsibility, with proper interfaces and dependency inversion.
- **Design Patterns**: Implementation of repository pattern for data access, factory pattern for object creation, and strategy pattern for varying behavior.
- **Functional Programming**: Use of immutable data structures and pure functions where appropriate.
- **Dependency Injection**: Proper dependency management to facilitate testing and reduce coupling.
- **Clean Architecture**: Clear separation between layers with defined responsibilities.

### Asynchronous Operations

The backend handles asynchronous operations effectively:

- **Async/Await**: Consistent use with proper error handling.
- **Retry Mechanisms**: Implemented for critical network operations.
- **Promise Handling**: Systematic handling of rejections with appropriate error propagation.
- **Resource Cleanup**: Proper cleanup in finally blocks.
- **Cancellation Support**: AbortController implementation for cancellable operations.

## Performance & Scalability

### Database Optimization

- **Connection Pooling**: Efficient reuse of database connections.
- **Query Optimization**: Carefully crafted queries with proper indexing.
- **Prepared Statements**: Prevention of SQL injection and query optimization.
- **Transaction Management**: Proper handling of transactions for data integrity.
- **Caching Strategies**: Strategic caching of frequently accessed data.

### Resource Management

- **Memory Optimization**: Efficient handling of large datasets using streams.
- **Connection Management**: Proper pooling and lifecycle management of external connections.
- **Event Listeners**: Systematic cleanup of event listeners to prevent memory leaks.
- **File Handling**: Efficient processing of file uploads and downloads.
- **Error Recovery**: Graceful handling of resource exhaustion and system errors.

### Performance Monitoring

- **Metrics Collection**: Tracking of key performance indicators.
- **Alerting**: Automatic notification of performance degradation.
- **Logging**: Strategic logging of performance-relevant events.
- **Profiling**: Regular profiling to identify bottlenecks.
- **Continuous Optimization**: Regular review and improvement of performance hotspots.

## API Documentation

The API documentation provides detailed information about the available endpoints, request parameters, and response formats. It serves as a comprehensive guide for developers to understand and utilize the backend API effectively.

### Endpoints

#### Base Routes

- **GET /metrostation/**: Health check endpoint that returns API status and build date.

#### Authentication Routes

- **POST /users/login**: Handles user login and authentication.
- **GET /auth/microsoft**: Initiates Microsoft Entra ID authentication.
- **GET /auth/microsoft/callback**: Handles Microsoft authentication callback.

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
- **GET /admin/coursecounts**: Fetches statistics about courses.
- **GET /admin/worklogcounts**: Fetches statistics about worklog entries.
- **GET /admin/worklogcourses**: Fetches all worklog courses.
- **GET /admin/server-status**: Fetches system and database status information.

#### Secure Routes (Requires Authentication)

- **GET /secure/**: Returns the authenticated user's information.
- **GET /secure/students**: Fetches all students.
- **GET /secure/getattendancethreshold**: Gets the attendance threshold setting.
- **PUT /secure/accept-gdpr/:userid**: Updates user's GDPR status.
- **GET /secure/check-staff/:email**: Checks if a user exists by email and is staff.
- **GET /secure/studentgroups**: Fetches all student groups.
- **POST /secure/insert-student-user-course/**: Inserts a new student into a course.
- **PUT /secure/updateuser**: Updates user information.
- **GET /secure/getuser/:userid**: Fetches a user by their ID.
- **GET /secure/students/paginated**: Fetches paginated list of students.
- **PUT /secure/update-language**: Updates a user's language preference.
- **GET /secure/user-language/:email**: Fetches a user's language preference.
- **GET /secure/test-opendata**: Tests connection to OpenData API.

#### Course Routes

- **GET /courses/exists/:code**: Checks if a course exists.
- **GET /courses/getallcourses**: Fetches all courses.
- **GET /courses/user/:email**: Fetches courses by user email.
- **POST /courses/import-excel**: Imports courses from Excel file.
- **GET /courses/coursesbyid/:id**: Fetches courses by course ID.
- **GET /courses/user/all**: Fetches all courses for the authenticated user.
- **GET /courses/:userid**: Fetches courses for a specific user.
- **GET /courses/students/pagination/:userid**: Fetches paginated students for an instructor.

#### Course Topics Routes

- **GET /courses/topics/**: Fetches all topics.
- **GET /courses/topics/course/:courseid**: Fetches topics by course ID.
- **POST /courses/topics/**: Creates a new topic.
- **PUT /courses/topics/:topicid**: Updates a topic.
- **DELETE /courses/topics/:topicid**: Deletes a topic.

#### Course Attendance Routes

- **GET /courses/attendance/**: Fetches all attendance records.
- **GET /courses/attendance/:attendanceid**: Fetches an attendance record by ID.
- **GET /courses/attendance/lecture/:lectureid**: Fetches attendance for a lecture.
- **GET /courses/attendance/user/:userid**: Fetches attendance for a user.
- **GET /courses/attendance/course/:courseid**: Fetches attendance for a course.
- **GET /courses/attendance/course/:courseid/lecture/:lectureid**: Fetches attendance by course and lecture.
- **GET /courses/attendance/course/:courseid/user/:userid**: Fetches attendance by course and user.
- **POST /courses/attendance/**: Creates a new attendance record.
- **POST /courses/attendance/qrcode**: Registers attendance via QR code.
- **PUT /courses/attendance/:attendanceid**: Updates an attendance record.
- **DELETE /courses/attendance/:attendanceid**: Deletes an attendance record.
- **POST /courses/attendance/previous-lectures**: Adds student to previous lectures as not present.

#### Worklog Routes

- **POST /worklog/**: Creates a new worklog course.
- **GET /worklog/:courseId**: Fetches details of a worklog course.
- **PUT /worklog/:worklogId**: Updates a worklog course.
- **DELETE /worklog/:worklogId**: Deletes a worklog course.
- **POST /worklog/entries**: Creates a new worklog entry.
- **GET /worklog/entries/user/:userId**: Fetches worklog entries by user.
- **PUT /worklog/entries/:entryId/status**: Updates the status of a worklog entry.
- **POST /worklog/:courseId/groups**: Creates a new worklog group.
- **POST /worklog/group/:groupId/students**: Assigns students to a worklog group.
- **GET /worklog/group/:groupId/students**: Fetches students in a worklog group.
- **POST /worklog/courses/:courseId/users**: Assigns a user to a worklog course.
- **GET /worklog/stats/:userId**: Fetches worklog statistics for a user.
- **GET /worklog/checkcode/:code**: Checks if a worklog code exists.
- **GET /worklog/instructor/:email**: Fetches worklog courses by instructor email.
- **GET /worklog/:courseId/students**: Fetches students in a worklog course.
- **GET /worklog/:courseId/groups**: Fetches groups in a worklog course.
- **GET /worklog/group/:courseId/:groupId**: Fetches details of a worklog group.
- **GET /worklog/student/active/:email**: Fetches active courses for a student.
- **GET /worklog/active/:userId**: Fetches active worklog entries for a user.
- **POST /worklog/entries/create**: Creates a new worklog entry.
- **PUT /worklog/entries/close/:entryId**: Closes a worklog entry.
- **GET /worklog/entries/all/:userId**: Fetches all worklog entries for a user.
- **DELETE /worklog/entries/:entryId**: Deletes a worklog entry.
- **PUT /worklog/entries/:entryId**: Updates a worklog entry.
- **GET /worklog/student/group/:userId/:courseId**: Checks a student's group for a course.
- **POST /worklog/:courseId/students/new**: Adds a new student to a worklog course.
- **DELETE /worklog/group/:groupId/student/:studentId**: Removes a student from a worklog group.

#### Activity Routes

- **GET /activity/all**: Fetches activity data for students from all courses.
- **GET /activity/:id**: Fetches activity data for students from instructor's courses.

#### Feedback Routes

- **POST /feedback/**: Submits user feedback.

## Error Handling

The backend implements comprehensive error handling mechanisms to ensure robustness and reliability. Custom error types are used to provide clear and meaningful error messages. Proper error handling is implemented at various levels, including routes, controllers, and models, to handle different types of errors gracefully.

### Error Hierarchy

```
BaseError
├── HttpError
│   ├── BadRequestError
│   ├── UnauthorizedError
│   ├── ForbiddenError
│   ├── NotFoundError
│   └── InternalServerError
├── DatabaseError
│   ├── ConnectionError
│   ├── QueryError
│   └── TransactionError
├── ValidationError
└── ExternalServiceError
```

### Custom Error Types

- **BaseError**: Root error class with standardized properties.
- **HttpError**: Represents an HTTP error with a status code and message.
- **DatabaseError**: Encompasses errors related to database operations.
- **ValidationError**: Occurs when input validation fails.
- **ExternalServiceError**: Handles errors from external service calls.

### Error Handling in Routes

- **Admin Routes**: Error handling is implemented using try-catch blocks with specific error types and logging.
- **Course Routes**: Structured error handling with appropriate status codes and client-friendly messages.
- **Auth Routes**: Special handling for authentication errors with security considerations.

### Error Handling in Controllers

- **AdminController**: Implements domain-specific error handling with proper error propagation.
- **CourseController**: Uses defensive programming with input validation and structured error responses.
- **AttendanceController**: Handles attendance-specific edge cases and validation errors.

### Error Handling in Models

- **CourseModel**: Implements database error handling with informative error messages.
- **UserModel**: Manages authentication and authorization errors with appropriate security measures.
- **AttendanceModel**: Handles data integrity errors and validation constraints.

## Security Best Practices

The backend follows security best practices to protect sensitive data and prevent common vulnerabilities.

### Authentication & Authorization

- **JWT Implementation**: Secure JWT handling with proper signing and validation.
- **Token Management**: Refresh token rotation and proper expiration handling.
- **CORS Configuration**: Strict CORS policies to prevent unauthorized cross-origin requests.
- **Role-Based Access Control**: Granular permissions based on user roles.
- **Session Management**: Secure session handling with proper timeout and invalidation.

### Input Validation and Sanitization

- **Express Validator**: Comprehensive validation and sanitization of all user inputs.
- **Content Security Policy**: Implementation of CSP headers to prevent XSS attacks.
- **SQL Injection Prevention**: Use of parameterized queries and prepared statements.
- **File Upload Security**: Strict validation and sanitization of uploaded files.
- **API Rate Limiting**: Protection against brute force and DoS attacks.

### Data Protection

- **Sensitive Data Encryption**: Encryption of personally identifiable information (PII).
- **Database Security**: Proper access controls and least privilege principles.
- **HTTPS Enforcement**: Secure communication with TLS/SSL.
- **Audit Logging**: Comprehensive logging of security-relevant events.
- **Security Headers**: Implementation of security headers like HSTS, X-Content-Type-Options, etc.

### Rate Limiting

- **Rate Limiting Middleware**: Implementation of request rate limiting to prevent abuse.
- **Graduated Response**: Escalating restrictions for repeated violations.
- **IP-based Controls**: Protection against distributed attacks.
- **Resource-Specific Limits**: Targeted protection for expensive operations.
- **Monitoring**: Automated detection of abnormal request patterns.

### Logging

- **Winston Logger**: Structured logging with appropriate detail levels.
- **Sensitive Data Handling**: Careful treatment of sensitive information in logs.
- **Log Rotation**: Proper management of log files to prevent disk exhaustion.
- **Error Context**: Comprehensive context information for debugging.
- **Performance Metrics**: Tracking of performance-relevant events.

## Internationalization (i18n)

The backend supports internationalization for Finnish, English, and Swedish:

- **Error Messages**: Localized error messages for client-facing errors.
- **Email Templates**: Multilingual email communications.
- **Date and Time Handling**: Locale-specific formatting of dates and times.
- **Numeric Formatting**: Appropriate decimal and thousand separators by locale.
- **Translation Management**: Structured organization of translation resources.

## Development and Deployment

### Local Development

To set up the backend for local development:

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure environment variables (see `.env.example`)
4. Run the development server with `npm run dev`

### Database Setup

1. Create a MySQL database
2. Run the initialization scripts in `database/`
3. Configure database connection in `.env`

### Testing

- Run unit tests with `npm test`
- Run integration tests with `npm run test:integration`
- Generate test coverage with `npm run test:coverage`

### Deployment

- Configure production environment variables
- Build the application with `npm run build`
- Deploy using PM2 with `npm run deploy`

## References

- [System Architecture](../DOCUMENTATION.md)
- [Frontend Documentation](../frontend/README.md)

Happy coding!
