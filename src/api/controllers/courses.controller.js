const Course = require('../../models/course.model')
const CourseModule = require('../../models/courseModule.model')
const Attachement = require("../../models/attachments.model")
const Lesson = require("../../models/lesson.model")
const Quiz = require("../../models/course-quiz.model")
const User = require('../../models/user.model');
const Settings = require('../../models/userSettings.model');
const CourseProgress = require('../../models/courseProgress.model');
const Enrollment = require('../../models/enrollment.model');
const Librari = require("../../models/userLibrary.model")

exports.getAllCourses = async (req, res) => {
  try {
    const userId = req.user.id

    const settings = await Settings.findOne({ user: userId })
      .select("interests language")
      .lean()

    const progresses = await CourseProgress.find({ user: userId, completed: false })
      .select("course progressPercent lastAccessedAt")
      .lean()

    const favorites = await Librari.findOne({ userId, isSystem: true, name: "Favorites" })
      .select("courses")
      .lean()

    const favoriteIds = new Set((favorites?.courses || []).map(id => id.toString()))

    const inProgressIds = progresses.map(item => item.course)

    const enrolledClassrooms = await Enrollment.find({ user: userId, status: "active" })
      .select("classroom")
      .lean()

    const classroomIds = enrolledClassrooms.map(item => item.classroom)

    const continueCourses = await Course.find({
      _id: { $in: inProgressIds }
    })
      .select("-explication")
      .populate("teacher", "name avatar")
      .populate("interests", "name slug category")
      .lean()

    const classroomCourses = await Course.find({ classroom: { $in: classroomIds } })
      .select("-explication")
      .populate("teacher", "name avatar")
      .populate("interests", "name slug category")
      .lean()

    const excludedIds = [...continueCourses.map(item => item._id.toString()), ...classroomCourses.map(item => item._id.toString())]

    const publicCourses = await Course.find({
      isPublic: true,
      language: settings?.language || "fr",
      interests: {
        $in: settings?.interests || []
      },
      _id: {
        $nin: excludedIds
      }
    })
      .select("-explication")
      .populate("teacher", "name avatar")
      .populate("interests", "name slug category")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const withFavorite = course => ({
      ...course,
      isFavorite: favoriteIds.has(
        course._id.toString()
      )
    })

    const publicCoursesFormatted = publicCourses.map(withFavorite)

    const classroomCoursesFormatted = classroomCourses.map(withFavorite)

    const continueFormatted = continueCourses.map(
      course => {
        const progress = progresses.find(
          item =>
            item.course.toString() ===
            course._id.toString()
        )

        return {
          ...withFavorite(course),
          progressPercent:
            progress?.progressPercent || 0,
          lastAccessedAt:
            progress?.lastAccessedAt || null
        }
      }
    )

    res.json({
      continueCourses: continueFormatted,
      classroomCourses: classroomCoursesFormatted,
      recommendedCourses: publicCoursesFormatted,
      tags: settings?.interests?.length || 0
    })

  } catch (error) {
    console.log(error)

    res.status(500).json({ success: false, message: "Internal server error !" })
  }
}

exports.CreateCourse = async (req, res) => {
  try {
    const { description, roomID, isPublic = true, explication, interests, title } = req.body;

    if (!explication || !interests || !title || !description || (!roomID && !isPublic)) return res.status(400).json({ success: false, msg: "Invalid data format" });

    if (!Array.isArray(interests)) return res.status(400).json({ success: false, msg: "Interest of this course must be an array" });
    const exi = await Attachement.findOne({ _id: explication }).lean()

    if (!exi) return res.status(400).json({ success: false, msg: "Explication assets not exist !" })

    let c
    if (isPublic) {
      c = await Course.create({ teacher: req.user.id, description, explication, interests, isPublic, title });
    } else {
      const existingCourse = await Course.findOne({ title, classroom: roomID }).lean();
      if (existingCourse && !isPublic) return res.status(409).json({ success: false, msg: "This course already exists", existingCourse });
      c = await Course.create({ teacher: req.user.id, description, explication, interests, isPublic, classroom: roomID, title });
    }

    const firstChapter = await CourseModule.create({ course: c._id, title: "Chapter 1", description: "This is the first chapter of the course", order: 1 })

    return res.json({ success: true, msg: "Course created successfully", data: { course: c, firstChapter } });

  } catch (e) {
    console.log("Error creating course:", e);
    res.status(500).json({ success: false, msg: "Internal Server Error", });
  }
};


exports.CreateModule = async (req, res) => {
  try {
    const { course, description, title } = req.body
    if (!course || !description || !title) return res.status(400).json({ success: false, msg: "Invalid form data!" });
    const existingCourse = await Course.findOne({ _id: course }).lean();
    if (!existingCourse) return res.status(404).json({ success: false, msg: "Course Not exist yet !" });
    const chapterCount = await CourseModule.countDocuments({ course })

    const chap = await CourseModule.create({ course, title, description, order: chapterCount + 1 })

    return res.json({ success: true, msg: `Chapter ${chapterCount + 1} created successfully`, data: chap });

  } catch (e) {
    console.log("Error creating course:", e);
    res.status(500).json({ success: false, msg: "Internal Server Error", });
  }
}


exports.CreateLesson = async (req, res) => {
  try {
    const { chapter, quiz, quiz_title, content, title, asset } = req.body;
    if (!chapter || !content || !title) return res.status(400).json({ success: false, msg: "Invalid Form Data" });
    if (quiz && !Array.isArray(quiz)) return res.status(400).json({ success: false, msg: "Quiz must be an array" });
    if (quiz && !quiz_title) return res.status(400).json({ success: false, msg: "Quiz title is required" });
    if (quiz) {
      for (const qu of quiz) {
        const { question, responses } = qu;

        if (!question) return res.status(400).json({ success: false, msg: "Each quiz item needs a question" });
        if (!responses || !Array.isArray(responses) || responses.length === 0) return res.status(400).json({ success: false, msg: "Each question needs responses" });
        const hasCorrect = responses.some(item => item.isCorrect);
        if (!hasCorrect) return res.status(400).json({ success: false, msg: "Each question needs one correct answer" });

      }
    }

    const chap = await CourseModule.findById(chapter);
    if (!chap) return res.status(404).json({ success: false, msg: "Chapter not found" });
    const lesson_count = await Lesson.countDocuments({ module: chapter });

    const lesson = await Lesson.create({ module: chapter, title, content, order: lesson_count + 1, attachment: asset || undefined });

    let c_quiz = null;

    if (quiz) {
      c_quiz = await Quiz.create({ lesson: lesson._id, title: quiz_title, content: quiz });
      lesson.quiz = c_quiz._id;
      await lesson.save();
    }

    return res.json({ success: true, msg: "Lesson created successfully", lesson, c_quiz });

  } catch (e) {
    return res.status(500).json({ success: false, msg: "Internal Server Error", });
  }
};