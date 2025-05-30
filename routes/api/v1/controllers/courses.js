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
        const filteredCourses = await req.models.Class.find({$and : filter}).lean()
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
        const course = await req.models.Class.findOne({courseCode: courseCode}).lean()
        res.status(200).json(course)    
    } catch (e) {
        console.log("ERROR: \n" + e)
        res.status(500).json({"status":"error", "error":e.message})
    }
})

//makes the api call and saves to db if course isn't found
router.get("/search", async(req, res) => {
    console.log("in search")
    console.log(req.query)
    try {
        let {course, department, quarter} = req.query
        // let courseId = course.replace(/\s/g, '')

        course = course.toUpperCase().replace(/\s+/g, '').replace(/(\D+)(\d+)/, '$1 $2')
        console.log("This is the formatted course", course)

        const courseObj = await req.models.Class.findOne({courseId: course})

        if (courseObj) {
            console.log("found in db")
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
            // console.log("calling uw api")
            // let processed_course = course
            // if(!course.includes(" ")) {
            //     processed_course = (
            //         course.slice(0, course.length - 3) + " " + course.slice(course.length - 3)
            //     )
            // }
            const finalQuarter = quarter || 'Spring'
            const finalDepartment = department || course.split(" ")[0]
            const course_num = course.split(" ")[1]

            const apiRes = await fetch(`https://ws.admin.washington.edu/student/v5/course/2025,${finalQuarter},${finalDepartment},${course_num}`, {
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
                tags: [], 
                reviews: []
            }
            return  res.json({course: courseJson, create: true})
        }
    } catch (err) {
        res.status(500).json({status: "error", error: err})
    }
})

router.post('/', async (req, res) => {
    try {

        console.log("this is the body", req.body)
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

        console.log("this is the new course", newCourse)

        await newCourse.save()
        res.json({status: "success", message: "post saved"})

    } catch (err) {
        res.status(500).json({status: "error", error: err})
    }

})

export default router