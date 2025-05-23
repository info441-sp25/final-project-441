import express from 'express';
import fetch from 'node-fetch'

var router = express.Router();

// TODO: Test


// takes filter parameters, returns matching courses from mongodb collection
// @pre: request in form of GET api/{version}/courses?name=...&department=...&quarter=...
    // any parameter can be null (but if all null, then just retrieves every course)
// @returns: json array of classes meeting filter params
router.get('/', async (req, res) => {

    const {name=null, department=null, quarter=null} = req.query

    const filter = [{}] 

    name !== null && filter.push({courseCode: { $regex: /\*name\*/, $options: 'i' }}) // td: double check regex
    department !== null && filter.push({department: department})
    quarter !== null && filter.push({prevQuarters: quarter}) 

    try {
        const filteredCourses = await req.models.Course.find({$and : filter}).lean()
        res.status(200).json(filteredCourses)    
    } catch (e) {
        console.log("ERROR: \n" + e)
        res.status(500).json({"status":"error", "error":e.message})
    }
})

// coursecode case endpoint (for detail view) - same as ^ but w/ primary key
    // Still lwkey unsure how we want frontend rendering  to happen... will talk about it
// @pre: request in form of GET api/{version}/courses/courseDetails?courseCode=...
// @returns: json object of class w/ given coursecode
router.get('/courseDetails', async (req, res) => {
    const {courseCode} = req.query
    try {
        const course = await req.models.Course.findOne({courseCode: courseCode}).lean()
        res.status(200).json(course)    
    } catch (e) {
        console.log("ERROR: \n" + e)
        res.status(500).json({"status":"error", "error":e.message})
    }
})

//makes the api call and saves to db if course isn't found
router.get("/search", async(req, res) => {
    try {
        const {course, department, quarter} = req.query
        let courseId = course.replace(/\s/g, '')

        const courseObj = await req.models.Course.findOne({courseId: courseId})

        if (courseObj) {
        const courseJson = {
            _id: courseObj._id,
            courseId: courseObj.courseId,
            courseNumber: courseObj.courseNumber, 
            courseTitle: courseObj.courseTitle, 
            avgRating: courseObj.avgRating, 
            courseCollege: courseObj.courseCollege, 
            credits: courseObj.credits, 
            tags: courseObj.tags, 
            reviews: courseObj.reviews
        }
        return res.json({course: courseJson, create: false})
        } else { // course is not already in db
            const finalQuarter = quarter || 'Spring'
            const finalDepartment = department || course.split(" ")[0]
            const course_num = course.split(" ")[1]

            const apiRes = await fetch(`https://ws.admin.washington.edu/student/v5/course/2025/${finalQuarter}/${finalDepartment}/${course_num}`, {
                method: 'GET', 
                headers: {
                    Authorization : 'Bearer 3E406D01-E38F-473C-B255-113E5BD77339', 
                    Accept : 'application/json'
                }
            })

            if (!apiRes.ok) {
                res.status(404).json({error: "no course found"})
            }

            let data = await apiRes.json()

            const courseJson = {
                courseId: courseId, 
                courseNumber: course_num, 
                courtTitle: data.CourseTitle, 
                avgRating: 0, 
                courseCollege: data.CourseCollege, 
                credits: data.MinimumTermCredit,
                tags: [], 
                reviews: []
            }
            res.json({course: courseJson, create: true})
        }
    } catch (err) {
        res.status(500).json({status: "error", error: err})
    }
})

router.post('/', async (req, res) => {
    try {
        const {
            courseId,
            courseNumber,
            courseTitle,  
            avgRating,
            courseCollege,
            credits,
            tags,
            reviews
          } = req.body;
    
        const newCourse = new req.models.Course({
            courseId,
            courseNumber,
            courseTitle, 
            avgRating,
            courseCollege,
            credits,
            tags, 
            reviews
        })

        await newCourse.save()
        res.json({status: "success", message: "post saved"})

    } catch (err) {
        res.status(500).json({status: "error", error: err})
    }

})

export default router