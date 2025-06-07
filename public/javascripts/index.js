// Toggle visibility and update UI based on login status
function toggleLoginUI(isLoggedIn) {
  document.getElementById('tabs')?.classList.toggle('hidden', !isLoggedIn);
  document.getElementById('login-btn')?.classList.toggle('hidden', isLoggedIn);
  document.getElementById('all-courses-btn')?.classList.toggle('hidden', isLoggedIn);
  document.getElementById('home-btn')?.classList.toggle('hidden', isLoggedIn);
  document.getElementById('logout-btn')?.classList.toggle('hidden', !isLoggedIn);
}

async function checkLoginStatus() {
  try {
    const res = await fetch('/api/v1/user/myIdentity');
    const data = await res.json();

    const isLoggedIn = data?.status === "loggedin";

    toggleLoginUI(isLoggedIn);

    if (isLoggedIn && data.userInfo) {
      const { name, major = "Not provided", bio = "Not provided" } = data.userInfo;
      const numSaved = Array.isArray(data.savedCourses) ? data.savedCourses.length : 0
      const rev = await fetch(`/api/v1/user/numReviews?userId=${data.userInfo.usernmae}`)
      const revData = await rev.json()
      const numReviews = revData.numReviews

      const userInfoDiv = document.getElementById('user-info');
      if (userInfoDiv) {
        userInfoDiv.innerHTML = `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Major:</strong> ${major}</p>
          <p><strong>Saved Courses:</strong> ${numSaved} </p>
          <p><strong>Reviews:</strong> ${numReviews} </p>
          <p><strong>Bio:</strong> ${bio}</p>
        `;
      }
    }
  } catch (error) {
    console.error("Login check failed:", error);
  }
}

async function goSaved() {
  location.href = "/saved.html?userId=${id}";
}

async function searchCourse(event) {
  event.preventDefault();

  const course = document.getElementById('course-input').value.trim();
  const department = document.getElementById('department-select').value;
  const level = document.getElementById('level-select').value;

  const params = new URLSearchParams({
    course,
    department,
    level
  });

  location.href = `/search_results.html?${params.toString()}`;
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