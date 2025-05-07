# INFO 441 Project Proposal - !Graduated  
**Sanjana Pavani, Laura Khotemlyansky, Thomas Sanders**  
**05/09/2025**

---

## Project Description

### What problem are we solving, and why is our application needed?

Finding relevant courses and building effective class schedules at the University of Washington can be frustrating, as students must consult multiple disconnected platforms. Additionally, advisors may not be available to help students plan their courses, especially closer to registration periods. MyPlan shows the course catalog and time schedule, RateMyProfessor and Reddit offer informal reviews of professors and classes, and DawgPath displays GPA distributions, course grade histories, and prerequisite maps. While each of these tools serves a purpose, students are left to manually collect and compare information that should be integrated into a centralized planning tool that easily displays course reviews, ratings, and other critical course information. Our solution also sparks conversation among UW students to discuss their experiences, allowing students to find course recommendations which is especially helpful when advisors are not available.

### Who is our target audience, and why would they use this tool?

!Graduated is a tool designed for current and future UW undergraduate students who are planning their academic path. These students might be preparing to apply to a major, trying to figure out when to take a specific class, or wondering which professors are most highly rated. !Graduated lets users search for a course and instantly view the course description, reviews from multiple sources, a visualized prerequisite map, quarter offering history, and which majors frequently take the class.

### Why do we as developers want to build this app?

We want to build this app because we have personally experienced the stress that comes with academic planning. Trying to compare course difficulty, track when classes are offered, and understand how everything fits into a degree can feel overwhelming. We are building !Graduated to reduce difficulties around course planning and to empower students when choosing their classes. This tool will also serve students who may not have access to regular advising, helping to ensure equity in academic planning resources. Additionally, this tool will exercise our full-stack development skills as we interact with multiple APIs and the MongoDB database to store and retrieve information. Above all, this tool will be useful as we enter our final year at the University of Washington to make the best course registration decisions.

---

## Technical Description

### Architectural Diagram

All communication between the React frontend and Express backend server will occur via REST API requests. The backend then communicates with MongoDB to fetch and update data.

### Data Flow

The frontend sends REST API requests to the backend to fetch or post data (e.g., course searches, saved courses, reviews). The backend (Node.js + Express) processes the request, queries the MongoDB database, and returns a response to the frontend.

---

## Summary Tables for User Stories

| Priority | User | Description | Technical Implementation |
|----------|------|-------------|---------------------------|
| P0 | As a user… | I want to be able to log in. | When logging in, use Azure Authentication to authenticate users, and place them into our database. |
| P0 | As a user… | I want to be able to search for classes. | Return array of courses to frontend by filtering the MongoDB backend by course code via GET /courses/search. |
| P0 | As a user… | I want to view course information (major distribution, prereqs, websites, offering history). | Populate frontend course listing with metadata from MongoDB, creating a graph visualization using D3.js mapping prereqs to the current course. |
| P1 | As a user… | I want to be able to upload reviews. | Create a review field under post; upload to MongoDB, render reviews from the database. |
| P1 | As a user… | I want to be able to filter search results. | Implement a filter component on the frontend, passing selected tags in the GET query. |
| P1 | As a user… | I want to be able to save courses under a favorites tab. | Update the savedCourses field in the Users collection of MongoDB using POST. |
| P2 | As a user… | I want to add a personal biography to my profile. | Updating the database with the user's profile and displaying in the React UI of the profile tab. |
| P2 | As a user… | I want to compare classes side by side. | Fetch and align course data using two parallel GET requests, then render using a responsive React layout. |
| P2 | As a user… | I want to get suggested classes based on majors. | Implement a recommendation engine in the backend that queries similar courses from MongoDB using saved filters. |
| P2 | As a user… | I want to see ratings for professors that taught the course in previous quarters. | Fetch RateMyProfessor reviews for each professor associated with a previous quarter of the course. |
| P3 | As a user… | I want to view top Reddit posts and comments related to a course. | Fetch top Reddit threads by course name and show top comments on the course page. |

---

## API Endpoints

- `GET /user/login` - Allows users to log into their account.  
- `GET /user/saved` - Retrieve list of saved courses.  
- `POST /user/saved` - Add to list of saved courses.  
- `DELETE /user/saved` - Delete course from saved courses.  
- `GET /user/suggested` - Retrieve list of all courses, filtered by major and prerequisites.  
- `GET /search?query=x&department=y&prereqs=z` - Retrieve data for course(s) with coursename matching query and filters matching input. Parameters beyond “query” optional.  
- `GET /reviews?coursename=x` - Retrieve all reviews for a given course.  
- `POST /reviews?coursename=x` - Post a review of a course.  
- `GET /api/uwCourses` - Retrieve course information from the UW swagger API.  

---

## Database Schemas

### Users

- `userId` (Int)  
- `username` (String)  
- `major` (String)  
- `biography` (String)  
- `profileImageUrl` (String)  
- `savedCourses` (Array of Int)  
- `reviews` (Array of Int)  

### Courses

- `courseId` (Int)  
- `courseCode` (String)  
- `courseName` (String)  
- `avgRating` (Int)  
- `prereqs` (Array of Int)  
- `prevQuarters` (Array of Strings)  
- `courseWebsites` (Array of Strings)  
- `tags` (Array of Strings)  
- `reviews` (Array of Int)  

### Reviews

- `reviewID` (Int)  
- `numStars` (Int)  
- `comment` (String)  
