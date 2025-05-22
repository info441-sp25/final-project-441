async function checkLoginStatus() {
    try {
      const res = await fetch('/users/myIdentity');
      const data = await res.json();

      const isLoggedIn = data.status == "loggedin"

      if (isLoggedIn) {
        document.getElementById('tabs').classList.toggle('hidden', isLoggedIn)
        document.getElementById('signin').classList.toggle('hidden', isLoggedIn)
        document.getElementById('signout').classList.toggle('hidden', isLoggedIn)

        // Update profile info dynamically
        const userInfoDiv = document.getElementById('user-info');
        userInfoDiv.innerHTML = `
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Major:</strong> Informatics</p>
          <p><strong>Bio:</strong> Still editing</p>
        `;
      }

    //   // Toggle visibility based on login status
    //   document.getElementById('login-gate').classList.toggle('hidden', isLoggedIn);
    //   document.getElementById('app').classList.toggle('hidden', !isLoggedIn);
    } catch (error) {
      console.error("Login check failed:", error);
    }
  }

// function showPage(id) {
//     document.querySelectorAll('.page').forEach(p => p.classList.remove('visible'));
//     document.getElementById(id).classList.add('visible');

//     switch(id) {
//         case 'saved':
//             showSaved() // pass in userId
//             break
//     }
// }

async function goSaved(userId) {
    let savedJSON = await fetchJSON(`api/v1/user/saved?userId=${userId}`);
    let savedHTML = savedJSON.map(post => {
        return `
        <div class="container">
        
        `
        // need save button and where to display course info 
        // onclick='saveCourse'
    })
    document.getElementById("saved-results").value = savedHTML;
    location.href = "/saved.html"
}

async function saveCourse(courseId, userId) {
    await fetchJSON(`api/v1/users/save`, {
        method: "POST",
        body: {courseId: courseId, userId: userId}
    })
}

function goHome() {
    location.href = "/index.html"
}

function goCourses() {
    location.href = "/courses.html"
}

function goProfile() {
    location.href = "/profile.html"
}


