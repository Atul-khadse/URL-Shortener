# URL-Shortener
# ⚡ NanoLink — High-Throughput Distributed URL Shortener

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg?style=flat&logo=openjdk)](https://openjdk.org/)
[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-18%20%2F%2019-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg?style=flat&logo=redis)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A scalable, low-latency URL shortener engineered with **Spring Boot 3 (Java 21)** and **React 19 (Vite)**. The system is designed for high read-to-write ratios, featuring **Base62 encoding**, **Redis Cache-Aside** resolution, **non-blocking asynchronous click tracking**, **token-bucket rate limiting via Bucket4j**, and **stateless JWT authentication**.

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [System Data Flow](#-system-data-flow)
- [Key Features](#-key-features)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
- [API Reference](#-api-reference)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Caching & Rate Limiting Strategy](#-caching--rate-limiting-strategy)
- [Metrics & Observability](#-metrics--observability)
- [License](#-license)

---

## 🏗 Architecture & Tech Stack

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons | Responsive UI, JWT interceptors, real-time clipboard copy, paginated tables |
| **Backend API** | Spring Boot 3.3.4, Java 21, Spring Security | Business logic, Base62 tokenization, JWT filter, Pageable REST endpoints |
| **Database** | PostgreSQL 16 | ACID-compliant transactional store, indexed short codes, audit trails |
| **Schema Migrations** | Flyway | Declarative, version-controlled schema definitions (`V1__init_schema.sql`) |
| **Cache & Limiting** | Redis 7 + Bucket4j | In-memory lookup cache (24h TTL), token-bucket rate limiting per IP/user |
| **Observability** | Spring Boot Actuator, Micrometer Prometheus | Real-time health metrics, JVM tracking, HikariCP pool monitoring |

---

## 🔄 System Data Flow
+-------------------+
                  |   Client Browser  |
                  +---------+---------+
                            |
  +-------------------------+-------------------------+
  | (1) POST /api/v1/urls                             | (2) GET /{shortCode}
  v                                                   v
+------------------------+                     +------------------------+
| Spring Boot Controller |                     | Spring Boot Controller |
+-----------+------------+                     +-----------+------------+
|                                              |
[Bucket4j Check]                                [Redis Check]
(Rate Limiter)                                       |
|                                  +-----------+-----------+
+-------v-------+                          |                       |
| Base62 Encode |                     [Cache Hit]             [Cache Miss]
+-------+-------+                          |                       |
|                         (Return 302 Found)       (Query PostgreSQL)
+-------v-------+                          |                       |
|  Save to DB   |                          |                (Populate Redis)
+-------+-------+                          |                       |
|                                  |                (Return 302 Found)
+-------v-------+                          +-----------+-----------+
| Pre-warm Cache|                                      |
|  (1-Day TTL)  |                                      v
+---------------+                         +-------------------------+
| Async Click Increment   |
| (Non-blocking @Async)   |
+-------------------------+


---

## ✨ Key Features

- **Base62 URL Shortening:** Generates collision-resistant, URL-safe 7-character tokens capable of representing over **3.5 trillion** unique URLs.
- **Custom Aliases:** Validates user-defined custom aliases with regex constraint checks and duplicate rejection.
- **Sub-10ms Redirection:** Leverages Redis cache-aside reads with immediate HTTP `302 Found` responses to prevent intermediate proxy cache poisoning while ensuring fresh click analytics.
- **Asynchronous Analytics:** Click counter increments run on decoupled background threads via `@Async`, eliminating write-lock penalties from the redirect path.
- **Token-Bucket Rate Limiting:** Enforces strict client quotas (30 requests/min) per IP address using Bucket4j to neutralize DoS attempts.
- **Security & Authorization:** Pure stateless authentication using HMAC-SHA256 JWT tokens, BCrypt password hashing, and user-scoped data isolation.
- **Server-Side Pagination:** Integrated Spring Data JPA `Pageable` backend tied directly to dynamic React UI pagination controls.

---

## 📂 Project Directory Structure

```text
.
├── docker-compose.yml
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/urlshortener/
│       │   │   ├── config/             # Security, Redis & Async thread configs
│       │   │   ├── controller/         # Auth, URL CRUD & Redirect controllers
│       │   │   ├── dto/                # Java 21 Records for request/response bodies
│       │   │   ├── model/              # JPA Entities (User, Url)
│       │   │   ├── repository/         # Spring Data JPA Repositories
│       │   │   ├── security/           # JWT Filter & Token Provider
│       │   │   ├── service/            # Core business & Rate limiting services
│       │   │   └── util/               # Base62 conversion utilities
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/       # Flyway SQL migrations (V1__init_schema.sql)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── api/                        # Centralized Axios client & interceptors
        ├── components/                 # ProtectedRoute, Navbar, common UI
        ├── context/                    # AuthContext (state, login, logout)
        └── pages/                      # Dashboard, Login, Register




## ⚙️ Prerequisites
- Ensure you have the following installed locally:
- Java Development Kit (JDK) 21
- Node.js (v18.x or v20.x+) and npm
- Docker Engine & Docker Compose
- Apache Maven 3.9+ (or use the included Maven wrapper)

## 🚀 Quick Start Guide
- 1. Clone the Repository
- Bash
- git clone [[https://github.com/your-username/url-shortener.git](https://github.com/your-username/url-shortener.git)](https://github.com/Atul-khadse/URL-Shortener.git)
- cd url-shortener


2. Launch Infrastructure (PostgreSQL & Redis)Use Docker Compose to provision PostgreSQL and Redis containers with persistent volumes:Bashdocker compose up -d
Verify containers are healthy:Bashdocker compose ps
3. Start the Backend APIBashcd backend
mvn clean spring-boot:run
The API starts on http://localhost:8080.Flyway automatically initializes the schema tables on boot.4. Start the Frontend ApplicationIn a new terminal window:Bashcd frontend
npm install
npm run dev
The client app starts on http://localhost:5173.📡 API ReferenceAuthentication EndpointsMethodEndpointDescriptionAuth RequiredPOST/api/v1/auth/registerRegister a new userNoPOST/api/v1/auth/loginAuthenticate user & get JWTNoURL Management EndpointsMethodEndpointDescriptionAuth RequiredPOST/api/v1/urlsShorten a long URL (Rate limited)Yes (Bearer Token)GET/api/v1/urlsGet user URLs (Supports page, size, sort)Yes (Bearer Token)DELETE/api/v1/urls/{id}Delete a short URL & evict cacheYes (Bearer Token)Public Redirection EndpointMethodEndpointDescriptionAuth RequiredGET/{shortCode}Redirects (302 Found) to destination URLNoSample cURL CommandsRegister User:Bashcurl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"securepassword123"}'
Shorten a URL:Bashcurl -X POST http://localhost:8080/api/v1/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"originalUrl":"[https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)","customAlias":"springboot"}'
Test Redirection:Bashcurl -i http://localhost:8080/springboot
Expected Output:HTTPHTTP/1.1 302 Found
Location: [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot)
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
🗄 Database Schema & MigrationsDatabase schema management is handled by Flyway via script V1__init_schema.sql:SQLCREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_url TEXT NOT NULL,
    short_code VARCHAR(15) NOT NULL UNIQUE,
    click_count BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_urls_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_urls_short_code ON urls (short_code);
CREATE INDEX idx_urls_user_id ON urls (user_id);
⚡ Caching & Rate Limiting StrategyRedis Cache-Aside PatternLookup First: Requests to /{shortCode} query the key url:{shortCode} in Redis.On Cache Hit: Immediately returns destination URL in < 5ms.On Cache Miss: Queries PostgreSQL, writes value back to Redis with a 24-hour TTL, and redirects.Active Eviction: Deleting a short link triggers an atomic cache eviction redisTemplate.delete(...) to ensure strict cache-database consistency.Bucket4j Token-Bucket LimitingApplied at the controller layer via client IP identifier.Capacity: 30 tokens per IP.Refill Rate: 30 tokens per minute.Exceeding the quota triggers an immediate 429 Too Many Requests.📊 Metrics & ObservabilitySpring Boot Actuator and Micrometer are configured for zero-overhead metrics scraping:Application Health: http://localhost:8080/actuator/healthPrometheus Metrics: http://localhost:8080/actuator/prometheusJVM & HikariCP Metrics: http://localhost:8080/actuator/metricsKey exposed metric keys:hikaricp.connections.active (Database pool saturation)http.server.requests (Latency p95/p99 breakdown per route)jvm.memory.used (JVM heap consumption)📄 LicenseThis project is licensed under the MIT License — see the LICENSE file for details.
---

### Instructions to Add to Your Project

1. In the root directory of your project, create the file:
   ```bash
   touch README.md
Paste the markdown block above into the file.Replace the placeholder URLs (your-username) with your GitHub username or organization name.Stage and push to your repository:Bashgit add README.md
git commit -m "docs: add comprehensive system documentation and architecture README"
git push origin main
