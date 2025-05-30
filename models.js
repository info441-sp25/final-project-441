import mongoose from 'mongoose'

const models = {} // dictionary of all the models

console.log("connecting to mongodb")

// name of db -> web-sharer-a3
await mongoose.connect('mongodb+srv://laurak11:INFO441password@cluster0.e6e59z1.mongodb.net/!graduated?retryWrites=true&w=majority&appName=Cluster0')
console.log("successfully conected to mongodb")

const classSchema = new mongoose.Schema({
    courseId: String, // full course name eg 'INFO441', no spaces
    courseNumber: String,
    courseTitle: String,
    avgRating: Number,
    courseCollege: String, //engineering, info, etc.
    credits: Number,
    description: String,
    genEdReqs: [String],
    tags: [String],
    reviews: [Number]
})

const userSchema = new mongoose.Schema({
    userId: Number,
    username: String,
    major: String,
    biography: String,
    profileImageUrl: String,
    savedCourses: [Number],
    coursesTaken: [Number],
    reviews: [Number]
})

const reviewSchema = new mongoose.Schema({
    reviewId: Number,
    numStars: Number,
    comment: String
})

// model
models.Class = mongoose.model('Class', classSchema)
models.User = mongoose.model('User', userSchema)
models.Review = mongoose.model('Review', reviewSchema)
console.log("finished creating models")

export default models