# Inventory Management System

A modern, interactive inventory management application with a beautiful UI built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication** - Secure login and registration
- 📊 **Dashboard** - Overview with statistics and charts
- 📦 **Inventory Management** - Add, edit, delete, and track products
- 🛒 **Orders Management** - Place and track customer orders
- 👥 **Staff Management** - Manage team members (Admin only)
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Beautiful gradients and animations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:8080
```

3. Start the development server:
```bash
npm run dev
```

## Backend Integration

This frontend is designed to work with the Java Spring Boot backend. Make sure your backend is running on `http://localhost:8080` or update the `VITE_API_URL` environment variable accordingly.

## Default Credentials

Use the registration page to create an account, or use credentials from your backend.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Tanstack Query** - Data fetching
