window.addEventListener("DOMContentLoaded", initSaved);

async function initSaved() {
  try {
    const identityRes = await fetch("/users/myIdentity");
    const identity = await identityRes.json();

    if (!identity?.userInfo?.username) {
      document.getElementById("saved-results").innerText = "Please log in to view saved courses.";
      return;
    }

    const userId = identity.userInfo.username;
    const savedRes = await fetch(`/api/v1/users/saved?userId=${userId}`);
    const savedCourses = await savedRes.json();

    const container = document.getElementById("saved-results");
    if (!savedCourses || savedCourses.length === 0) {
      container.innerHTML = "<p>No saved courses yet.</p>";
    } else {
      container.innerHTML = savedCourses.map(post => `
        <div class="card">
          <h3>${post.courseCode}: ${post.courseName}</h3>
          <p>${post.courseDescription}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error("Failed to load saved courses:", err);
    document.getElementById("saved-results").innerText = "Error loading saved courses.";
  }
}