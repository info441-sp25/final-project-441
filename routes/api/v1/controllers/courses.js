import express from 'express';
import fetch from 'node-fetch'

var router = express.Router();

// coursecode case endpoint (for detail view) - same as ^ but w/ primary key
    // Still lwkey unsure how we want frontend rendering  to happen... will talk about it
// @pre: request in form of GET api/{version}/courses/courseDetails?courseCode=...
// @returns: json object of class w/ given coursecode
router.get('/courseDetails', async (req, res) => {
    const {courseCode} = req.query
    try {
        const course = await req.models.Class.findOne({courseCode: courseCode}).lean()
        res.status(200).json(course)    
    } catch (e) {
        console.log("ERROR: \n" + e)
        res.status(500).json({"status":"error", "error":e.message})
    }
})

// repurposed course/ endpoint to return all coursesAdd commentMore actions
router.get('/', async (req, res) => {
    const coursesObj = await req.models.Class.find()
    // const coursesJson = await coursesObj.json()
    console.log("in allcourses endpoint")
    // console.log(coursesObj)

    // const courseJson = await coursesObj.json()

    res.json(coursesObj)
    
})

//makes the api call and saves to db if course isn't found
router.get("/search", async(req, res) => {
    try {
        let {course, department, level} = req.query
        let courseObj

        // case 1: course code is provided, no other filters considered, looking for one result in db
        if (course) {
            course = course.toUpperCase().replace(/\s+/g, '').replace(/(\D+)(\d+)/, '$1 $2')
            courseObj = await req.models.Class.findOne({courseId: course})
            courseObj = courseObj ? [courseObj] : []
        // case 2: filters only provided
        } else if (department && !level){
            courseObj = await req.models.Class.find({tags : department}).exec()
        } else if (level && !department) {
            courseObj = await req.models.Class.find({tags : level}).exec()
        } else if (level && department) {
            courseObj = await req.models.Class.find({tags : { $all: [department, level] }}).exec()
        }

        // mapping each course result to course object
        if (courseObj && courseObj.length > 0) {
            courseObj = courseObj.map(course => course.toObject())
            const courses = courseObj.map(course => {
                return {
                    // _id: course._id,
                    courseId: course.courseId,
                    courseNumber: course.courseNumber, 
                    courseTitle: course.courseTitle, 
                    avgRating: course.avgRating, 
                    courseCollege: course.courseCollege, 
                    credits: course.credits, 
                    tags: course.tags, 
                    reviews: course.reviews,
                    description: course.description,
                    genEdReqs: course.genEdReqs
                }
                
            })
           
            return res.json({course: courses, create: false})
        } else { 
            // course is not already in db - make API call
            // only fetches if full course code is provided 
            let course_num
            if (course) {
                course_num = course.split(" ")[1]
                const finalDepartment = department || course.split(" ")[0]

                const apiRes = await fetch(`https://ws.admin.washington.edu/student/v5/course/2025,Spring,${finalDepartment},${course_num}`, {
                    method: 'GET', 
                    headers: {
                        Authorization : 'Bearer 3E406D01-E38F-473C-B255-113E5BD77339', 
                        Accept : 'application/json'
                    }
                })

                if (!apiRes.ok) {
                return res.status(404).json({error: "no course found"})
                }

                let data = await apiRes.json()

                const courseJson = {
                    courseId: data.Curriculum.CurriculumAbbreviation + " " + data.CourseNumber, 
                    courseNumber: course_num, 
                    courseTitle: data.CourseTitleLong, 
                    avgRating: 0, 
                    courseCollege: data.CourseCollege, 
                    description: data.CourseDescription,
                    genEdReqs: data.GeneralEducationRequirements,
                    credits: data.MinimumTermCredit,
                    tags: [finalDepartment, course_num[0]+ "00"], 
                    reviews: []
                }
                return  res.json({course: courseJson, create: true})
            }
            return res.status(400).json({status: "error", message: "Please provide more course information" })
        }
    } catch (err) {
        res.status(500).json({status: "error", error: err.message})
    }
})

router.post('/', async (req, res) => {
    try {
        let {
            courseId,
            courseNumber,
            courseTitle,  
            avgRating,
            courseCollege,
            credits,
            description,
            genEdReqs,
            tags,
            reviews
          } = req.body;

          genEdReqs = Object.entries(genEdReqs)
          .filter(([_, value]) => value)
          .map(([key]) => key)
    
        let newCourse = new req.models.Class({
            courseId,
            courseNumber,
            courseTitle, 
            avgRating,
            courseCollege,
            credits,
            description,
            genEdReqs,
            tags, 
            reviews
        })
        await newCourse.save()
        res.json({status: "success", message: "post saved"})

    } catch (err) {
        res.status(500).json({status: "error", error: err})
    }

})

router.post('/review', async (req, res) => {
    try {
        const { courseId, review } = req.body
        const username = req.session.account.username

        let newReview = new req.models.Review({
            comment: review, 
            user: username, 
            courseId: courseId
        })
        await newReview.save()

        const course = await req.models.Class.findOne({courseId: courseId})
        course.reviews.push(newReview._id.toString())
        await course.save()

        res.json({status: 'success', message: "added new review to db"})
    } catch (err) {
        res.status(500).json({status: "error", error: err.message})
    }
})

router.get('/review', async (req, res) => {
    try {
        const course = await req.models.Class.findOne({courseId: req.query.courseId})
        const reviewArr = await Promise.all(course.reviews.map(async review => {
            return await req.models.Review.findOne({_id: review})
        }))

        const reviewRes = reviewArr.map(review => (
            {
                comment: review.comment, 
                user: review.user
            }))
        res.json(reviewRes)
    } catch (err) {
        res.status(500).json({status: "error", error: err.message})
    }
    
})

export default router