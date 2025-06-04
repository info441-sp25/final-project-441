async function loadContent() {
    const params = new URLSearchParams(window.location.search)
    // const course = params.get("course")
    // const department = params.get("department")
    // const quarter = params.get("quarter")

    let data = await fetch(`/api/v1/course/search?${params.toString()}`)
    let res = await data.json()

    console.log("params", params.toString())

    console.log('this is the result', res)

    let course
    if (res.status == 404 || res.status == 500) {
        course = ""
    } else {
        course = res.course
    }
    if (res.create) {
        console.log("entered this if statement")
        console.log(res.course)
        await fetch(`/api/v1/course`, {
            method: 'POST', 
            body: JSON.stringify(res.course), 
            headers: {'Content-Type': 'application/json'}
        })
    }

    const user = await fetch('api/v1/user/myIdentity')
    const userJson = await user.json()
    console.log("user info", userJson)
    

    const isBookmarked = userJson.status == "loggedin" ? userJson.userInfo.savedCourses  : null
    console.log("calculating the bookmark status", isBookmarked)
    // console.log("the course body", res.course)


    // TO DO: make courses appear as grid instead of as separate columns
    document.getElementById("courses-results").innerHTML = course.length
    ? (course.map(course => 
    `
    <div class="card" id="${course.courseId}" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between;">
            <h3>${course.courseId}: ${course.courseTitle}</h3>
            ${isBookmarked ?
            (isBookmarked.includes(course.courseId) ?
            `<button onclick="toggleBookmark('${course.courseId}')"> <img src="img/bookmark-fill.svg"> </button>`
            : `<button onclick="toggleBookmark('${course.courseId}')"> <img src='img/bookmark.svg'> </button>`) 
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
    // check if the course is saved for the user
    // if yes: remove course (unfilled icon)
    // if no: add course (filled icon)
    const user = await fetch('api/v1/user/myIdentity')
    const userJson = await user.json()
    const userId = userJson.userInfo.username

    const res = await fetch(`api/v1/users/saved`, {
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
    console.log("selectCourse")
    // const courseId = event.id; // FIND WAY TO GET COURSE ID FROM DYNAMIC HTML ELEMENT

    location.href = `/course_detail.html?course=${id}`;

    
}