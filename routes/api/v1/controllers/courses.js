import express from 'express';

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

export default router