# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Teacher login mode for managing registrations
- Sign up and unregister students (teacher login required)

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                      | Get all activities with their details and current participant count |
| GET    | `/auth/session`                                                    | Get current teacher login status                                    |
| POST   | `/auth/login`                                                      | Teacher login                                                       |
| POST   | `/auth/logout`                                                     | Teacher logout                                                      |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Register a student to an activity (teacher login required)          |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister a student from an activity (teacher login required)  |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.

## Teacher Accounts

Teacher credentials are stored in `teachers.json`.

Default local account:

- Username: `teacher1`
- Password: `changeme123`
