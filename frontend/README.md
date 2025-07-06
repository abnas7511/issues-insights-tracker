# Issues & Insights Tracker

A modern, production-ready issue tracking and insights platform built with React, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Role-based Authentication**: Support for ADMIN, MAINTAINER, and REPORTER roles with proper RBAC
- **Issue Management**: Complete CRUD operations for issues with markdown support
- **File Upload**: Support for attaching files to issues with drag-and-drop interface
- **Real-time Updates**: Simulated real-time updates for issue status changes
- **Dashboard Analytics**: Interactive charts showing issue statistics by severity and status
- **Responsive Design**: Fully responsive design that works on all device sizes

### User Roles & Permissions
- **ADMIN**: Full access to all features including user management
- **MAINTAINER**: Can triage issues, assign tasks, and manage issue statuses
- **REPORTER**: Can create and view their own issues

### Technical Features
- **Dark Mode**: Complete dark mode support with system preference detection
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Clean, professional design with subtle animations
- **Accessibility**: WCAG compliant design patterns
- **Performance**: Optimized for performance with lazy loading and efficient state management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Routing**: React Router DOM
- **Forms**: React Hook Form with validation
- **Charts**: Recharts for data visualization
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd issues-insights-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

Use these credentials to test different user roles:

- **Admin**: admin@example.com / password
- **Maintainer**: maintainer@example.com / password  
- **Reporter**: reporter@example.com / password

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── auth/           # Authentication components
│   ├── issues/         # Issue-related components
│   └── dashboard/      # Dashboard components
├── pages/              # Page components
├── store/              # State management (Zustand stores)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── App.tsx             # Main application component
```

## Key Design Decisions

### State Management
- **Zustand**: Chosen for its simplicity and TypeScript support over Redux
- **Local Storage Persistence**: User preferences and auth state persist across sessions

### Styling Approach
- **Tailwind CSS**: Utility-first approach for consistent design system
- **Custom Color Palette**: Comprehensive color system with proper contrast ratios
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 1024px

### Form Handling
- **React Hook Form**: For performant form handling with validation
- **Controlled Components**: Consistent approach to form state management

### File Organization
- **Feature-based Structure**: Components organized by feature area
- **Separation of Concerns**: Clear separation between UI, logic, and data layers

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when implemented)

## Future Enhancements

### Planned Features
- Real WebSocket integration for live updates
- PDF preview functionality for uploaded files
- Advanced search and filtering capabilities
- Email notifications for issue updates
- Bulk operations for issue management
- Export functionality for reports
- Advanced analytics dashboard

### Technical Improvements
- Add comprehensive test suite (Jest + React Testing Library)
- Implement proper error boundaries
- Add performance monitoring
- Implement proper caching strategies
- Add offline support with service workers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.