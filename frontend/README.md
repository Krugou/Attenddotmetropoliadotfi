# Metropolia Attendance App Frontend

Welcome to the TypeDoc documentation for the Metropolia Attendance App frontend. This application is a convenient solution for teachers and students to take attendance during classes. It's designed to streamline the attendance process, making it easier for teachers to keep track of student attendance and for students to check in to their classes.

## Key Features

- **Easy Check-In:** Students can quickly check in to their classes with just a few taps.
- **Attendance Tracking:** Teachers can easily see who's in class and who's not.
- **Internationalization:** Full support for Finnish, English, and Swedish languages.
- **Responsive Design:** Works seamlessly across desktop, tablet, and mobile devices.
- **Offline Support:** Basic functionality available even without internet connection.

## Architecture

The frontend follows SOLID principles and clean code practices, with a component-based architecture designed for maintainability and scalability.

## Components

The frontend is built with modular components, each serving a specific function in the user interface. These components contribute to a cohesive and responsive design, ensuring a consistent and engaging experience for both teachers and students.

- Components follow a strict type-safe implementation using TypeScript interfaces
- Each component adheres to the single responsibility principle
- Common patterns include container/presentation component separation
- Error boundaries are implemented for graceful failure handling

## Views

Views define the different pages and screens within the application. Each view is tailored to provide a distinct functionality, whether it's the student check-in screen or the teacher's attendance dashboard.

- Views implement proper lazy loading strategies for performance optimization
- Route-based code splitting is utilized for minimal initial load times
- View transitions are optimized for smooth user experience

## Assets

The frontend includes a collection of assets, such as fonts and images, that contribute to the overall visual appeal of the application. These assets are carefully selected to enhance the user experience.

- Assets are optimized for minimal bundle size
- Images are properly sized and compressed
- Font loading is optimized with proper font-display strategies

## Design System

### Typography

- **Font Hierarchy:**
  - `font-heading` for all heading elements
  - `font-body` for main content
  - Consistent vertical rhythm maintained throughout the application

### Color System

#### Primary Colors

- `metropolia-main-orange` (`#ff5000`) - Primary brand color
  - `metropolia-main-orange-dark` (`#cc4000`) - Dark mode/hover states
- `metropolia-secondary-orange` (`#e54b00`) - Secondary actions
  - `metropolia-secondary-orange-dark` (`#b63b00`) - Dark mode/hover states
- `metropolia-main-grey` (`#53565a`) - Text and UI elements
  - `metropolia-main-grey-dark` (`#2d2e30`) - Dark mode variant

#### Support Colors

- `metropolia-support-white` (`#ffffff`) - Backgrounds and light elements
- `metropolia-support-black` (`#000000`) - Text and borders
- `metropolia-support-red` (`#cb2228`) - Error states and alerts
- `metropolia-support-blue` (`#4046a8`) - Information and links
- `metropolia-support-yellow` (`#fff000`) - Warnings and highlights

#### Trend Colors

- `metropolia-trend-pink` (`#e384c4`) - Accent elements
- `metropolia-trend-light-blue` (`#5db1e4`) - Secondary information
- `metropolia-trend-green` (`#3ba88f`) - Success states

## Tailwind Config

Tailwind CSS is utilized to style and design the frontend. The Tailwind config file defines the customization and configuration settings for the CSS framework, ensuring a cohesive and visually appealing layout.

- Custom colors configured to match Metropolia brand identity
- Custom spacing and typography scales
- Extended utility classes for common UI patterns
- Proper dark mode configuration

## Component Documentation

Each component in the frontend is documented to provide a clear understanding of its purpose, props, and usage. This documentation helps developers quickly grasp the functionality of each component and how to integrate it into the application.

- JSDoc comments for all component props and functions
- Usage examples for complex components
- Known limitations and edge cases documented
- Comprehensive API documentation

## State Management

The frontend uses a state management solution to handle the application's state. This ensures that the state is managed in a predictable and efficient manner, allowing for a smooth user experience.

- Immutable state patterns implemented for predictable updates
- Proper action typing for type-safe state changes
- Memoization strategies for expensive computations
- Properly separated domain and UI state

## Type Safety & Error Handling

- Domain-specific error types with comprehensive error hierarchies
- Strict TypeScript typing with proper interfaces and type guards
- Defensive programming with input validation and sanitization
- Proper error boundaries and fallback mechanisms
- Comprehensive logging with appropriate severity levels

## Performance Optimization

- Component memoization for expensive renders
- Proper cleanup of subscriptions and event listeners
- Event debouncing and throttling where appropriate
- Bundle size optimization with code splitting
- Lazy loading of routes and heavy components
- Image optimization and lazy loading
- Critical CSS inlining for fast initial render

## Custom Hooks

The application uses several custom React hooks to handle common functionality:

### Responsive Design

- `useIsMobile`: Detects mobile viewport sizes for responsive layouts
  - Located in `src/hooks/useIsMobile.ts`
  - See [Hooks Documentation](./src/hooks/HOOKS.md) for detailed usage

### Performance Hooks

- `useMemoized`: Optimized memoization hook with proper dependency tracking
- `useAsyncEffect`: Safe handling of async operations in effects with cleanup
- `useAbortableRequest`: Network requests with proper AbortController integration

### Internationalization

- `useTranslation`: Extended i18next hook with proper typing
- `useDateFormatter`: Locale-aware date formatting
- `useNumberFormatter`: Locale-aware number formatting

## Testing

The frontend includes a comprehensive suite of tests to ensure the reliability and stability of the application. These tests cover various aspects of the frontend, including unit tests for individual components, integration tests for interactions between components, and end-to-end tests for the overall user experience.

- Component unit tests with React Testing Library
- Integration tests for complex user flows
- End-to-end testing with Playwright
- Performance testing with Lighthouse CI
- Visual regression testing
- Accessibility testing

## Accessibility

- WCAG 2.1 AA compliance throughout the application
- Semantic HTML structure for proper screen reader support
- Keyboard navigation support for all interactive elements
- Proper ARIA attributes where appropriate
- Color contrast ratios meeting accessibility standards

## Security & Data Protection

- Proper XSS protection with input sanitization
- CSRF protection for all API requests
- Content Security Policy implementation
- Secure authentication with JWT and proper token handling
- Secure local storage practices

Navigate through the documentation to understand the structure and functionality of the frontend codebase. Each module, class, interface, type, and function is documented in detail to provide a comprehensive understanding of the code.

Happy coding and attendance tracking!
