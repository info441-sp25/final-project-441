window.addEventListener("DOMContentLoaded", initSaved);

async function initSaved() {
  try {
    const identityRes = await fetch("api/v1/user/myIdentity");
    const identity = await identityRes.json();

    if (!identity?.userInfo?.username) {
      document.getElementById("saved-results").innerText = "Please log in to view saved courses.";
      return;
    }

    const userId = identity.userInfo.username;
    const savedRes = await fetch(`/api/v1/users/saved?userId=${userId}`);
    const json = await savedRes.json();
    const savedCourses = json.saved

    const container = document.getElementById("saved-results");
    if (!savedCourses || savedCourses.length === 0) {
      container.innerHTML = "<p>No saved courses yet.</p>";
    } else {
      container.innerHTML = savedCourses.map(course => 
      `
      <div class="card" id="${course.courseId}" style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between;">
              <h3>${course.courseId}: ${course.courseTitle}</h3>
          </div>
          <p>College: ${course.courseCollege}</p>
          <p>Credits: ${course.credits}</p>
          <button onclick="selectCourse('${course.courseId}')"> View Course </button>
      </div>
      `
      ).join("")
    }
  } catch (err) {
    console.error("Failed to load saved courses:", err);
    document.getElementById("saved-results").innerText = "Error loading saved courses.";
  }
}