async function loadContent() {
    const params = new URLSearchParams(window.location.search)

    let data = await fetch(`/api/v1/course/search?${params.toString()}`)
    let res = await data.json()

    let course
    if (res.status == 404 || res.status == 500) {
        course = ""
    } else {
        course = res.course
    }
    if (res.create) {
        await fetch(`/api/v1/course`, {
            method: 'POST',
            body: JSON.stringify(res.course),
            headers: {'Content-Type': 'application/json'}
        })
    }

    const user = await fetch('/api/v1/user/myIdentity')
    const userJson = await user.json()
    const isBookmarked = userJson.status == "loggedin" ? userJson.userInfo.savedCourses  : null

    document.getElementById("courses-results").innerHTML = 
    Array.isArray(course) && course.length
    ? (course.map(course =>
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
    :
    ` <p>No matching courses found</p>`
}

async function toggleBookmark(courseId) {
    const user = await fetch('/api/v1/user/myIdentity')
    const userJson = await user.json()
    const userId = userJson.userInfo.username
    const res = await fetch(`/api/v1/user/saved`, {
        method: "POST",
        body: JSON.stringify({courseId: courseId, userId: userId}),
        headers: {'Content-Type': 'application/json'}
    });

    const data = await res.json()
    const userCourses = data.saved

    const card = document.getElementById(courseId)
    const btn = card.querySelector('button')
    const img = btn.querySelector('img')

    if (userCourses.includes(courseId)) {
        img.src = 'img/bookmark-fill.svg'
    } else {
        img.src = 'img/bookmark.svg'
    }
}

async function selectCourse(id) {
    location.href = `/course_detail.html?course=${id}`;
}