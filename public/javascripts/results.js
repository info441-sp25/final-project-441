async function loadContent() {
    const params = new URLSearchParams(window.location.search)
    // const course = params.get("course")
    // const department = params.get("department")
    // const quarter = params.get("quarter")

    let res = await fetchJSON(`/api/v1/course/search?${params.toString()}`)
    let course
    if (res.status == 404 || res.status == 500) {
        course = ""
    } else {
        course = res.course
    }
    if (res.create) {
        await fetchJSON(`/api/v1/course`, {
            method: 'POST', 
            body: JSON.stringify(course)
        })
    }

    document.getElementById("courses-results").innerHTML = `
    <div class="card">
        ${course ? 
        `<h3>${course.courseId}: ${course.courseTitle}</h3>
        <p>College: ${course.courseCollege}</p>
        <p>Credits: ${course.credits}` : 
        ` <p>No matching courses found</p>`}
    </div>
    `
    // TO DO: Add save icon that will add course to saved page for user
}