# Shared Expense Manager

This project is a MERN stack application designed to help manage shared expenses within a mess or a household. It provides a platform for members to track their expenses, manage meals, and settle balances.

## Project Structure

The project is divided into two main parts: a **backend** built with Node.js and Express, and a **frontend** built with React.

### Backend

The backend is responsible for handling all the business logic and data storage. It uses a MongoDB database to store information about users, messes, expenses, and meals.

-   **`controllers`**: Contains the logic for handling API requests.
-   **`middleware`**: Contains middleware functions, such as authentication and error handling.
-   **`models`**: Defines the database schemas for users, messes, expenses, and meals.
-   **`routes`**: Defines the API endpoints for the application.

### Frontend

The frontend is a single-page application built with React. It provides a user-friendly interface for interacting with the application.

-   **`api`**: Contains the logic for making API requests to the backend.
-   **`components`**: Contains reusable UI components.
-   **`context`**: Contains the React context for managing global state.
-   **`pages`**: Contains the main pages of the application.

## API Endpoints

Here is a list of the available API endpoints:

### User Routes (`/api/users`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /register | Register a new user. |
| POST | /login | Log in an existing user. |
| GET | /me | Get the details of the currently logged-in user. |
| GET | / | Get a list of all users. |

### Mess Routes (`/api/mess`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /create | Create a new mess. |
| POST | /join | Join an existing mess. |
| GET | /:id/members | Get a list of all members in a mess. |
| PATCH | /:id/swap-admin | Swap the admin of a mess. |
| POST | /:messId/approve/:userId | Approve a user's request to join a mess. |
| GET | /:messId/pending-members | Get a list of all users waiting to be approved to join a mess. |
| DELETE | /:messId/reject/:userId | Reject a user's request to join a mess. |
| DELETE | /:messId/remove/:userId | Remove a member from a mess. |
| GET | /:messId | Get the details of a mess. |

### Expense Routes (`/api/expenses`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /add | Add a new expense. |
| GET | /recent/:messId | Get a list of recent expenses for a mess. |
| PUT | /approve/:id | Approve or reject an expense. |

### Fixed Expense Routes (`/api/fixed-expenses`)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /:messId | Get the fixed expenses for a mess. |
| PUT | /:messId | Update the fixed expenses for a mess. |

### Meal Routes (`/api/meals`)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /addMeal | Add or update a meal entry. |
| GET | /:messId | Get all meal entries for a mess. |
| GET | /user/:userId | Get all meal entries for a user. |
| GET | /summary/:messId | Get a summary of all meals for a mess. |

