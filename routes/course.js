//[SECTION] Dependencies and Modules
const express = require("express");
const courseController = require("../controllers/course");

const auth = require("../auth");
const {verify, verifyAdmin} = auth;

//[SECTION] Routing Component
const router = express.Router();

//[SECTION] Route for creating a course
router.post("/", verify, verifyAdmin, courseController.addCourse);

//[SECTION] Route for retrieving all courses
router.get("/all", verify, verifyAdmin, courseController.getAllCourses);

router.get("/", courseController.getAllActive);

// router.post("/specific", courseController.getCourse);
router.get("/:courseId", courseController.getCourse);

//[SECTION] Route for updating a course (Admin)
router.patch("/:courseId", verify, verifyAdmin, courseController.updateCourse);

//[SECTION] Route to archiving a course (Admin)
router.patch("/:courseId/archive", verify, verifyAdmin, courseController.archiveCourse);

//[SECTION] Route to activating a course (Admin)
router.patch("/:courseId/activate", verify, verifyAdmin, courseController.activateCourse);

//[SECTION] Route to search for courses by course name
//router.post("/search", courseController.searchCoursesByName);

router.post('/search', courseController.searchCoursesByPriceRange);


//[SECTION] Export Route System
// Allows us to export the "router" object that will be accessed in our "index.js" file
module.exports = router;