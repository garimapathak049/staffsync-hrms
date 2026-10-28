# StaffSync – HR Management System (MERN Stack)

## Current Project Status

I have completed the backend APIs and the React frontend for StaffSync. The main features have been developed, but I still need to test the complete application with MongoDB to make sure everything works properly.

The remaining work includes testing the main workflows, preparing the documentation, and writing the deployment guide.

## 1. How to Run the Backend

Open the terminal and run these commands:

```bash
cd server
npm install
cp .env.example .env
```

After that, open the `.env` file and add your MongoDB connection string, JWT secret (at least 32 characters), and HR admin login details.

Run the following commands to create the first HR admin and start the backend:

```bash
npm run seed:admin
npm run dev
```

The backend will run at `http://localhost:5000`. You can check whether it is working by opening `http://localhost:5000/api/health`.

## 2. How to Run the Frontend

Open another terminal and run:

```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`. It is configured to send API requests to the backend running on port 5000.

To add demo data, open the server folder in the terminal and run:

```bash
cd server
npm run seed:demo
```

You can then log in using the demo account details below.

## 3. Demo Login Details

These accounts are available after running the demo seed script.

- **HR Admin:** `hr@staffsync.demo`
- **Manager 1:** `manager1@staffsync.demo`
- **Manager 2:** `manager2@staffsync.demo`
- **Employees:** `employee1@staffsync.demo` to `employee8@staffsync.demo`
- **Password for all demo accounts:** `Demo@12345`

These accounts are only for local testing and demonstrations. They should not be used in production.

**Note:** The demo seed script resets the existing database data, so use it only with a database intended for testing.

## 4. Features Completed

The following features have been developed so far:

- User login and authentication using JWT.
- Role-based access for HR, managers, and employees.
- Password change functionality and login rate limiting.
- Employee and manager management.
- Manager access limited to the employees under them.
- Attendance check-in and check-out.
- HR attendance corrections with an audit record.
- Leave applications, leave balance tracking, and approval or rejection.
- Checks to prevent overlapping leave requests.
- Company announcements and training management.
- Training enrollment with capacity checks.
- Notifications.
- HR and manager dashboards with analytics.
- CSV export for HR through the analytics API.
- Demo account creation for testing.

The frontend has been built using React, Vite, Bootstrap, Redux Toolkit, and Recharts. The production build also compiles successfully.

## 5. Testing

I have written the initial authentication tests, but they have not been executed yet because the development environment could not download the MongoDB binary.

There are two ways to run the tests.

**Option 1: Use a separate test database**

```bash
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/staffsync_test npm test
```

**Important:** The tests may delete the test database, so make sure the connection points to a disposable database and not your actual data.

**Option 2: Use an in-memory MongoDB database**

```bash
npm test
```

This option uses `mongodb-memory-server` and requires an internet connection if the required MongoDB binary is not already available.

## 6. Work Still Remaining

I still need to complete the following tasks:

- Test the frontend and backend together in a browser.
- Verify the attendance, leave, and training workflows.
- Run the authentication tests and fix any issues found.
- Check the different dashboards and user roles.
- Add the project documentation inside the `docs/` folder.
- Prepare the deployment guide.

## 7. Overall Progress

The main structure, backend APIs, and frontend of StaffSync are ready. Most of the core HR management features have been implemented.

The next step is to run the application with MongoDB, test the complete workflows, fix any bugs, and prepare the documentation and deployment instructions.

The project is developed, but end-to-end testing and final verification are still pending.