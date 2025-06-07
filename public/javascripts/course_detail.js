// opens the review box
async function openReview() {
    if (document.getElementById("reviewForm").classList.contains("hidden")) {
        const user = await fetch('api/v1/user/myIdentity')
        const userJson = await user.json()
        if (userJson.status == 'loggedout') {
        alert("Please log in to leave a review")
        return
        }
        document.getElementById("reviewForm").classList.remove("hidden")
    } else {
        document.getElementById("reviewForm").classList.add("hidden")
        return
    }
}

async function submitReview() {
    const review = document.getElementById("reviewText").value
    document.getElementById("reviewForm").classList.add("hidden")
    document.getElementById("reviewText").value = ""
    if (!review) {
        return
    }
    const params = new URLSearchParams(window.location.search)
    const courseId = params.get('course')
    await fetch('api/v1/course/review', {
        method: 'POST',
        body: JSON.stringify({courseId: courseId, review: review}),
        headers: {'Content-Type': 'application/json'
        }
    })

    await loadReviews(courseId)
}

async function loadReviews(courseId) {
    let data = await fetch(`api/v1/course/review?courseId=${courseId}`)
    let res = await data.json()

    document.getElementById('reviews').innerHTML = Array.isArray(res) && res.length > 0
    ? res.map(review =>
        `<div class="review-item" style="background-color: #ffffff; padding: 1rem 1.25rem; border-radius: 12px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08); max-width: 700px; width: 100%; margin-bottom: 1rem;">
            <p class="review-text" style="font-size: 1rem; font-weight: 500; color: #2f2f2f; margin: 0;">${review.comment}</p>
            <p class="review-author" style="font-size: 0.875rem; color: #666; margin-top: 0.4rem;">– ${review.user}</p>
        </div>`
    ).join("")
    : "<p style='color: #666;'>No reviews for this course yet</p>"
}

// on page load, check session for current coursecode, call coursedetails
// endpoint to get course data, and fill in html with those fields
async function init()  {
    document.getElementById("courseNameLong").innerText = "Loading...";
    const params = new URLSearchParams(window.location.search)

    const data = await fetch(`/api/v1/course/search?${params.toString()}`)
    const res = await data.json()
    const courseInfo = res.course[0]
    const identityRes = await fetch("api/v1/user/myIdentity");
    const identity = await identityRes.json();
    const isBookmarked = identity.status == 'loggedin' ? identity.userInfo.savedCourses: null

    document.getElementById("courseCode").innerHTML = 
    `<div id="${courseInfo.courseId}" style="display: flex; justify-content: space-between;">
        <h1>${courseInfo.courseId}</h1>
        ${isBookmarked ?
                (isBookmarked.includes(courseInfo.courseId) ?
                `<button id="bookmark" style="background-color: #e6e6fa; border: none; border-radius:8px;" onclick="toggleBookmark('${courseInfo.courseId}')"> <img src="img/bookmark-fill.svg"> </button>`
                : `<button id="bookmark" style="background-color: #e6e6fa; border: none;" onclick="toggleBookmark('${courseInfo.courseId}')"> <img src='img/bookmark.svg'> </button>`)
                : ""}
        </div>`


    document.getElementById("courseNameLong").innerText = courseInfo.courseTitle
    document.getElementById("desc").innerText = courseInfo.description

    let areas = ""
    let potentialAreas = ["Diversity","EnglishComposition","IndividualsAndSocieties","NaturalWorld",
    "QuantitativeAndSymbolicReasoning", "VisualLiteraryAndPerformingArts", "Writing"]

    let newAreas = {
        "VisualLiteraryAndPerformingArts":"A&H",
        "IndividualsAndSocieties":"SSc",
        "NaturalWorld":"NSc",
        "QuantitativeAndSymbolicReasoning":"RSN",
        "Diversity": "Diversity",
        "EnglishComposition":"English Composition",
        "Writing":"Writing"
    }

    courseInfo.genEdReqs.forEach(element => {
        areas += newAreas[element] + ", "
    });

    areas = areas.slice(0, areas.length - 2)

    let creditStr = courseInfo.credits > 1 ? "Credits" : "Credit"
    const miscString = areas
    ? `${courseInfo.credits} ${creditStr} | ${areas} | Avg. Rating: N/A`
    : `${courseInfo.credits} ${creditStr} | Avg. Rating: N/a`
    document.getElementById("misc").innerHTML = `<b> ${miscString} </b>`

    await loadReviews(courseInfo.courseId)
}

function avg(arr) {
    if (arr.length == 0) {
        return "N/A"
    }
    let sum = 0
    let i = 0
    while(i < arr.length) {
        sum += arr[i]
        i++
    }
    return ((sum * 1.0) / (i * 1.0))
}