# Market Data Validation and Prediction System

## Frontend

The frontend is built using **React** and **Node.js** (Node version **v25.1.0**) for building and running the application.

---

Landing Page

The landing screen is the Appointment Booking page where users can book an appointment will be available on http://localhost:3000
![landingPage.png](images/landingPage.png)

Admin Login

Admins can log in at: http://localhost:3000/login. A preloaded admin user is available for testing purposes: Username: sivejozi@gmail.com and
Password: test
![adminLogin.png](images/adminLogin.png)
Bookings Page

Once logged in, admins can view, update, and delete appointments on the bookings page: http://localhost:3000/bookings
![bookings.png](images/bookings.png)

On this page:

* Admins can edit an appointment directly in the grid popup editor.
* Admins can delete any appointment using the delete button.
* Both actions require the user to have the ROLE_ADMIN authority.
* These role-based access checks are enforced by the backend service.

Tech Stack Summary

* React 19
* DevExtreme DataGrid for appointment management UI
* JWT Authentication integrated with backend
* Fetch API for secured REST API communication
* Node.js v25.1.0 for local development and build environment

## Backend

The backend is built using **Java Spring Boot** following a **microservice architecture** pattern and events based,
for intercommunication between the microservices.
Each service is containerized using **Docker** and registered dynamically with **Eureka Discovery Server**.

---

### System Architecture

![Architecture](images/architecture.png)

---

### Component Descriptions

#### **1. Gateway Service**
- Acts as the single entry point for all client requests.
- Routes API calls to the appropriate microservice.
- Handles:
    - Authentication & Authorization (via JWT)
    - Security policies
    - CORS configuration
    - Role-based access control
    - Monitoring & routing
- Built using **Spring Cloud Gateway**.

---

#### **2. Discovery Service (Eureka Server)**
- Registers and manages all microservices dynamically.
- Enables **service discovery** and load balancing.
- Allows other microservices to communicate without hardcoding URLs.

---

#### **4. User Service**
- Handles **user registration**, **authentication**, and **authorization**.
- Manages user roles (e.g., `ROLE_ADMIN`, `ROLE_USER`).
- Provides JWT tokens for secure access via the Gateway.
- Registered as an **Eureka client**.

---

#### **5. Booking Service**
- Core business service responsible for managing **appointments**.
- Supports CRUD operations for bookings.
- Publishes booking-related events to **Kafka**.
- Registered as an **Eureka client**.

---

#### **6. Notification Service**
- Listens to **Kafka topics** (e.g., `booking-events`) and sends notifications or triggers asynchronous tasks.
- Example: Sends an email or confirmation event when a booking is created or updated.
- Registered as an **Eureka client**.
- Currently, the system logs out a simulated email, that looks like:

![simulatedEmail.png](images/simulatedEmail.png)
---

#### **7. Database (PostgreSQL)**
- Stores persistent booking and user data.
- Accessed mainly by the User and Booking Services.
- Uses JPA/Hibernate ORM for data access.

---

#### **9. Kafka (Event Streaming Platform)**
- Used for asynchronous communication between services.
- Ensures scalability and decoupling through **event-driven architecture**.
- Booking Service → publishes events  
  Notification Service → consumes and processes them

---

### Tech Stack Summary

- **Java 24**
- **Spring Boot 3.x**
- **Spring Cloud (Eureka, Gateway, Config)**
- **PostgreSQL** (Relational Database)
- **Apache Kafka** (Event streaming)
- **Docker** (Containerization)
- **Maven** (Build automation)
- **JWT** (Authentication)

---

### Future Work

#### **1. Config Server**
- Centralized configuration management for all microservices.
- Allows configuration files to be version-controlled and updated without redeploying services.
- Ideal for managing environment-based configurations (e.g., dev, test, prod).

---

#### **2. Cache (Redis)**
- Used for caching frequently accessed data.
- Improves performance by reducing database load.
- Can be used to cache tokens, user sessions, or booking lookups.

### Building and Running the System Using Docker

1. Build each microservice using maven

    ```bash
   mvn clean install -U

2. Change directory to root folder "appointment-booking"

    ```bash
   docker compose up -d

This will set up all that is needed for the system(postgres-db, kafka, kafka-ui, runs all the backend microservices as well
as the system's frontend app)

![dockerCompose.png](images/dockerCompose.png)

2. Eureka server available at: http://localhost:8061/
   ![architecture.png](images/eureka.png)

3. To stop the app

   ```bash
   docker compose down

### API's

All api calls go via gateway (port 8082), routing handled in the gateway service.
1. Login:

   curl --location 'http://localhost:8082/auth/login' \
   --header 'Content-Type: application/json' \
   --data-raw '{
   "email": "sivejozi@gmail.com",
   "password": "test"
   }'


2. User registration:

   curl --location 'http://localhost:8082/auth/register' \
   --header 'Content-Type: application/json' \
   --data-raw '{
   "title": "Mr",
   "name": "Sive",
   "surname": "Jozi",
   "email": "sivejozi@gmail.com",
   "cellphone": "0831234567",
   "password": "test",
   "confirmPassword": "test"
   }
   '


3. All appointments: (needs auth)

   curl --location 'http://localhost:8082/booking/api/appointments' \
   --header 'Authorization: Bearer eyJhbG....'


4. Create Appointment:

   curl --location 'http://localhost:8082/booking/api/appointments/create' \
   --header 'Content-Type: application/json' \
   --data-raw '    {
   "customerName": "Hugh Jones2",
   "customerEmail": "hugh2@email.com",
   "customerPhone": "0112513698",
   "branch": "Maclear",
   "appointmentDateTime": "2025-11-21T12:00:00",
   "reason": "Another Favour",
   "status": "SCHEDULED"
   }'


5. Update Appointment:

   curl --location --request PUT 'http://localhost:8082/booking/api/appointments/update/1' \
   --header 'Content-Type: application/json' \
   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIl0sInN1YiI6InNpdmVqb3ppQGdtYWlsLmNvbSIsImlhdCI6MTc2MTkxNDY2MiwiZXhwIjoxNzYxOTE4MjYyfQ.p5nG1XmTfToJ-BuGD4PaJazOZRLQyWRbzjdK1Azar7s' \
   --data-raw '    {
   "customerName": "Sive Jozi",
   "customerEmail": "sive.jozi@example.com",
   "customerPhone": "+27 82 555 1234",
   "branch": "Sandton City Branch",
   "appointmentDateTime": "2025-10-26T10:30:00",
   "reason": "New account opening2",
   "status": "CONFIRMED",
   "confirmationCode": "ABC12345"
   }'


6. Delete Appointment:

   curl --location --request DELETE 'http://localhost:8082/api/appointments/10'



