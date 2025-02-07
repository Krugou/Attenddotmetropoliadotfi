# Metropolia Attendance App Frontend

Welcome to the TypeDoc documentation for the Metropolia Attendance App frontend. This application is a convenient solution for teachers and students to take attendance during classes. It's designed to streamline the attendance process, making it easier for teachers to keep track of student attendance and for students to check in to their classes.

## Key Features
- **Easy Check-In:** Students can quickly check in to their classes with just a few taps.
- **Attendance Tracking:** Teachers can easily see who's in class and who's not.

## Architecture

## Components
The frontend is built with modular components, each serving a specific function in the user interface. These components contribute to a cohesive and responsive design, ensuring a consistent and engaging experience for both teachers and students.

## Views
Views define the different pages and screens within the application. Each view is tailored to provide a distinct functionality, whether it's the student check-in screen or the teacher's attendance dashboard.

## Assets
The frontend includes a collection of assets, such as fonts and images, that contribute to the overall visual appeal of the application. These assets are carefully selected to enhance the user experience.

## Tailwind Config
Tailwind CSS is utilized to style and design the frontend. The Tailwind config file defines the customization and configuration settings for the CSS framework, ensuring a cohesive and visually appealing layout.

## Component Documentation
Each component in the frontend is documented to provide a clear understanding of its purpose, props, and usage. This documentation helps developers quickly grasp the functionality of each component and how to integrate it into the application.

## State Management
The frontend uses a state management solution to handle the application's state. This ensures that the state is managed in a predictable and efficient manner, allowing for a smooth user experience. The state management solution is documented to provide insights into how the state is structured and how it can be manipulated.

## Custom Hooks

The application uses several custom React hooks to handle common functionality:

### Responsive Design

- `useIsMobile`: Detects mobile viewport sizes for responsive layouts
  - Located in `src/hooks/useIsMobile.ts`
  - See [Hooks Documentation](./src/hooks/HOOKS.md) for detailed usage

## Testing
The frontend includes a comprehensive suite of tests to ensure the reliability and stability of the application. These tests cover various aspects of the frontend, including unit tests for individual components, integration tests for interactions between components, and end-to-end tests for the overall user experience. The testing strategy and tools used are documented to guide developers in writing and running tests effectively.

Navigate through the documentation to understand the structure and functionality of the frontend codebase. Each module, class, interface, type, and function is documented in detail to provide a comprehensive understanding of the code.

Happy coding and attendance tracking!
