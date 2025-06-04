// Toggle visibility and update UI based on login status
function toggleLoginUI(isLoggedIn) {
  document.getElementById('tabs')?.classList.toggle('hidden', !isLoggedIn);
  document.getElementById('login-btn')?.classList.toggle('hidden', isLoggedIn);
  document.getElementById('logout-btn')?.classList.toggle('hidden', !isLoggedIn);
}

async function checkLoginStatus() {
  try {
    const res = await fetch('api/v1/users/myIdentity');
    const data = await res.json();

    const isLoggedIn = data?.status === "loggedin";

    toggleLoginUI(isLoggedIn);

    if (isLoggedIn && data.userInfo) {
      const { name, major = "Not provided", bio = "Not provided" } = data.userInfo;

      const userInfoDiv = document.getElementById('user-info');
      if (userInfoDiv) {
        userInfoDiv.innerHTML = `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Major:</strong> ${major}</p>
          <p><strong>Bio:</strong> ${bio}</p>
        `;
      }
    }
  } catch (error) {
    console.error("Login check failed:", error);
  }
}

async function goSaved() {
  const res = await fetch('api/v1/users/myIdentity');
  const data = await res.json();
  const userId = data?.userInfo?.username;

  if (!userId) {
    alert("You must be logged in to view saved courses.");
    return;
  }

  let saved = await fetch(`/api/v1/users/saved?userId=${userId}`);
  let savedJSON = saved.json();
  let savedHTML = savedJSON.saved.map(post => {
    return `
      <div class="container">
        <h3>${post.courseCode}: ${post.courseName}</h3>
        <p>${post.courseDescription}</p>
      </div>
    `
  }).join('');

  location.href = "/saved.html";

  window.addEventListener("DOMContentLoaded", () => {
    const savedResultsBox = document.getElementById("saved-results");
    if (savedResultsBox) {
      savedResultsBox.innerHTML = savedHTML;
    }
  });
}

async function searchCourse(event) {
  event.preventDefault();

  const course = document.getElementById('course-input').value.trim();
  const department = document.getElementById('department-select').value;
  const level = document.getElementById('level-select').value;
  // might want to change to level

  const params = new URLSearchParams({
    course,
    department,
    level
  });

  location.href = `/search_results.html?${params.toString()}`;
}

async function saveCourse(courseId, userId) {
  await fetch(`api/v1/users/saved`, {
    method: "POST",
    body: {courseId: courseId, userId: userId}
  });
}

function goHome() {
  location.href = "/index.html";
}

function goCourses() {
  location.href = "/courses.html";
}

function goProfile() {
  location.href = "/profile.html";
}