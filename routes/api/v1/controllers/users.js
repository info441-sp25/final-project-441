import express from 'express';
var router = express.Router();


router.get('/myIdentity', (req, res) => {
  let name = req.session.account.name
  res.json(name)
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

    const savedPreview = savedCourses.map(saved => {
      {}
      // need to extract information from savedCourses
    })
  } catch (err) {
    return res.status(500).json({status: "error", "error": err})
  }
  res.send(savedPreview)
})

// POST saved courses
// @pre: POST api/v1/users/saved 
// BODY: courseId, userId
// @post: saves courseId to savedCourse arr for user 
router.post('/saved', async (req, res) => {
  try {
    let user = req.models.User.findOne({userId: req.body.userId})
    if (!user.savedCourses.includes(req.body.courseId)) {
      user.savedCourses.push(req.body.courseId)
      await user.save()
      res.json({status: "success"})
    } else {
      res.json({status: "success", message: "class already saved by user"})
    }
  } catch (err) {
    res.status(500).json({status: "error", error: err})
  }
  
})

export default router;
