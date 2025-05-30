async function loadContent() {
    const params = new URLSearchParams(window.location.search)
    // const course = params.get("course")
    // const department = params.get("department")
    // const quarter = params.get("quarter")

    let data = await fetch(`/api/v1/course/search?${params.toString()}`)
    let res = await data.json()

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
    

    const isBookmarked = userJson.status == "loggedin" ? userJson.savedCourses  : null


    // TO DO: make courses appear as grid instead of as separate columns
    document.getElementById("courses-results").innerHTML = course ? 
    `
    <div class="card" id="${course.courseId}">
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
    : 
    ` <p>No matching courses found</p>`
    

    // document.getElementById("courses-results").innerHTML = course.map(course => `
    //     <div class="card">
    //         ${course ? 
    //         `<div>
    //             <h3>${course.courseId}: ${course.courseTitle}</h3>
    //             <button onclick="toggleBookmark(${course.courseId})"> </button>
    //         </div>
    //         <p>College: ${course.courseCollege}</p>
    //         <p>Credits: ${course.credits}</p>
    //         <button id=${course.courseId} onclick=selectCourse(this.id)> View Course </button>` : 
    //         ` <p>No matching courses found</p>`}
    //     </div>
    //     `)
}

function toggleBookmark(courseId) {
    // check if the course is saved for the user
    // if yes: remove course (unfilled icon)
    // if no: add course (filled icon)
}

async function selectCourse(id) {
    console.log("selectCourse")
    // const courseId = event.id; // FIND WAY TO GET COURSE ID FROM DYNAMIC HTML ELEMENT

    location.href = `/course_detail.html?course=${id}`;

    
}