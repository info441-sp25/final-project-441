
async function init() {
    console.log("in allcourses init");
    document.getElementById("courses-results").innerText = "Loading...";

    const courses = await fetch('api/v1/course');
    const coursesJson = await courses.json();

    const identityRes = await fetch("api/v1/user/myIdentity");
    const identity = await identityRes.json();
    const isBookmarked = identity.status == 'loggedin' ? identity.userInfo.savedCourses: null

    document.getElementById("courses-results").innerHTML = Array.isArray(coursesJson) && coursesJson.length > 0
        ? (coursesJson.map(course =>
        `
            <div class="card" id="${course.courseId}" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between;">
                <h3>${course.courseId}: ${course.courseTitle}</h3>
                ${isBookmarked ?
            (isBookmarked.includes(course.courseId) ?
            `<button style="background-color: #e6e6fa;" onclick="toggleBookmark('${course.courseId}')"> <img src="img/bookmark-fill.svg"> </button>`
            : `<button style="background-color: #e6e6fa;" onclick="toggleBookmark('${course.courseId}')"> <img src='img/bookmark.svg'> </button>`)
            : ""}
            </div>
            <p>College: ${course.courseCollege}</p>
            <p>Credits: ${course.credits}</p>
            <button onclick="selectCourse('${course.courseId}')"> View Course </button>
            </div>
        `
        )).join("")
        : `<p>No courses in databse</p>`;
}

async function selectCourse(id) {
    console.log("selectCourse");
    location.href = `/course_detail.html?course=${id}`;
}