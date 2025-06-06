window.addEventListener("DOMContentLoaded", initSaved);

async function initSaved() {
  try {
    const identityRes = await fetch("api/v1/user/myIdentity");
    const identity = await identityRes.json();

    console.log("this is the identity", identity);

    if (!identity?.userInfo?.username) {
      document.getElementById("saved-results").innerText = "Please log in to view saved courses.";
      return;
    }

    const userId = identity.userInfo.username;
    const savedRes = await fetch(`/api/v1/user/saved?userId=${userId}`);
    const json = await savedRes.json();
    const savedCourses = json.saved;

    const container = document.getElementById("saved-results");

    const isBookmarked = identity.status == 'loggedin' ? identity.userInfo.savedCourses: null

    if (!savedCourses || savedCourses.length === 0) {
      container.innerHTML = "<p>No saved courses yet.</p>";
    } else {
      container.innerHTML = savedCourses.map(course => `
        <div class="card" id="${course.courseId}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3>${course.courseId}: ${course.courseTitle}</h3>

            ${isBookmarked ?
              (isBookmarked.includes(course.courseId) ?
              `<button style="background-color: #e6e6fa; align-items: flex-start;" onclick="toggleBookmark('${course.courseId}')"> <img src="img/bookmark-fill.svg"> </button>`
              : `<button style="background-color: #e6e6fa; align-items: flex-start;" onclick="toggleBookmark('${course.courseId}')"> <img src='img/bookmark.svg'> </button>`)
              : ""}
          </div>
          <p>College: ${course.courseCollege}</p>
          <p>Credits: ${course.credits}</p>
          <button onclick="selectCourse('${course.courseId}')">View Course</button>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Failed to load saved courses:", err);
    document.getElementById("saved-results").innerText = "Error loading saved courses.";
  }
}