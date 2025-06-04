import express from 'express';

const router = express.Router();

router.get("/myIdentity", async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.json({ status: "loggedout" });
  }

  const { username } = req.session.account;

  try {
    let user = await req.models.User.findOne({ username });

    // Auto-create the user on first login
    if (!user) {
      user = await req.models.User.create({
        username,
        major: "",
        biography: "",
        savedCourses: [],
        coursesTaken: [],
        reviews: []
      });
    }

    res.json({
      status: "loggedin",
      userInfo: {
        name: user.username,
        username: user.username,
        major: user.major || "Not provided",
        bio: user.biography || "Not provided", 
        savedCourses: user.savedCourses
      }
    });
  } catch (error) {
    console.error("Failed to fetch user identity:", error);
    res.status(500).json({ status: "error", message: "Something went wrong" });
  }
})

// GET saved courses
// @pre: GET api/v1/users/saved?userID=...
// @post: returns JSON arr of saved course info
router.get('/saved', async (req, res) => {
  try {
    const user = await req.models.User.findOne({userId : req.query.userId})

    if (!user) {
      return res.status(404).json({error: "User not found"})
    }
    // arr of saved courses
    const savedCourses = await Promise.all(user.savedCourses.map(async course => {
      return await req.models.Course.findOne({courseId : course})
    }))

    const savedPreview = savedCourses.map(course => {
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
    res.json({saved: savedPreview})
  } catch (err) {
    return res.status(500).json({status: "error", "error": err})
  }
  
})

// POST saved courses
// @pre: POST api/v1/users/saved
// BODY: courseId, userId
// @post: saves courseId to savedCourse arr for user
router.post('/saved', async (req, res) => {
  try {

    console.log("this is the body", req.body)
    let user = await req.models.User.findOne({userId: req.body.userId})
    console.log("these are the saved courses", user.savedCourses)

    // if course not saved add it
    if (!user.savedCourses.includes(req.body.courseId)) {
      user.savedCourses.push(req.body.courseId)
      await user.save()
      console.log("course added to user")
      return res.json({status: "success", message: "course added", saved: user.savedCourses})
    } else {
      // if course already added, remove it
      let filteredCourses = user.savedCourses.filter(course => course != req.body.courseId)
      user.savedCourses = filteredCourses
      await user.save()
      console.log("course deleted from user")
      return res.json({status: "success", message: "course removed", saved: user.savedCourses})
    }
  } catch (err) {
    res.status(500).json({status: "error", error: err})
  }

})


export default router;