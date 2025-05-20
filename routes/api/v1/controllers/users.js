import express from 'express';
var router = express.Router();

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

    const savedPreview = savedCourses.map(saved => {
      {}
      // need to extract information from savedCourses
    })
  } catch (err) {
    return res.status(500).json({status: "error", "error": err})
  }
  res.send(savedPreview)
})


export default router;
