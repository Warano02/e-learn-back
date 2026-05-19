const Course = require('../../models/course.model')
const CourseModule = require('../../models/courseModule.model')
const Attachement = require("../../models/attachments.model")
const Lesson = require("../../models/lesson.model")
const Quiz = require("../../models/course-quiz.model")
const User = require('../../models/user.model')
const Settings = require('../../models/userSettings.model')
const CourseProgress = require('../../models/courseProgress.model')
const Enrollment = require('../../models/enrollment.model')
const Librari = require("../../models/userLibrary.model")
const { getCache, setCache, invalidateCache } = require("../../lib/cache")

exports.getTeacherCourse = async (req, res) => {
  try {
    const teacher = req.user.id
    const courses = await Course.find({ teacher }).select("interests favicon objectives description title isPublic").populate("interests").select("name slug category description").lean()
    res.json({ courses })
  } catch {
    console.log("Error occured while trying to get courses of teacher ", e)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

exports.getAllCourses = async (req, res) => {
  try {
    const userId = req.user.id

    const settings = await Settings.findOne({ user: userId }).select("interests language").lean()
    const progresses = await CourseProgress.find({ user: userId, completed: false }).select("course progressPercent lastAccessedAt").lean()
    const favorites = await Librari.findOne({ userId, isSystem: true, name: "Favorites" }).select("courses").lean()

    const favoriteIds = new Set((favorites?.courses || []).map(id => id.toString()))
    const inProgressIds = progresses.map(item => item.course)

    const enrolledClassrooms = await Enrollment.find({ user: userId, status: "active" }).select("classroom").lean()
    const classroomIds = enrolledClassrooms.map(item => item.classroom)

    const continueCourses = await Course.find({ _id: { $in: inProgressIds } })
      .select("-explication")
      .populate("teacher", "name avatar")
      .populate("interests", "name slug category")
      .lean()

    const classroomCourses = await Course.find({ classroom: { $in: classroomIds } })
      .select("-explication")
      .populate("teacher", "name avatar")
      .populate("interests", "name slug category")
      .lean()

    const excludedIds = [
      ...continueCourses.map(item => item._id.toString()),
      ...classroomCourses.map(item => item._id.toString())
    ]

    const publicCourses = await Course.find({
      isPublic: true,
      language: settings?.language || "fr",
      interests: { $in: settings?.interests || [] },
      _id: { $nin: excludedIds }
    })
      .select("-explication")
      .populate("teacher", "name avatar")
      .populate("interests", "name slug category")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const withFavorite = course => ({ ...course, isFavorite: favoriteIds.has(course._id.toString()) })

    res.json({
      continueCourses: continueCourses.map(course => {
        const progress = progresses.find(item => item.course.toString() === course._id.toString())
        return { ...withFavorite(course), progressPercent: progress?.progressPercent || 0, lastAccessedAt: progress?.lastAccessedAt || null }
      }),
      classroomCourses: classroomCourses.map(withFavorite),
      recommendedCourses: publicCourses.map(withFavorite),
      tags: settings?.interests?.length || 0
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Internal server error !" })
  }
}

exports.CreateCourse = async (req, res) => {
  try {
    const {
      description, roomID, isPublic = true, explication,
      interests, title, objectives, language, favicon
    } = req.body

    if (!explication || !interests || !objectives || !title || !description || (!roomID && !isPublic)) {
      return res.status(400).json({ success: false, msg: "Invalid data format" })
    }

    if (!Array.isArray(interests)) return res.status(400).json({ success: false, msg: "Interest of this course must be an array" })
    if (!Array.isArray(objectives)) return res.status(400).json({ success: false, msg: "Objectives of this course must be an array" })

    const exi = await Attachement.findOne({ _id: explication }).lean()
    if (!exi) return res.status(400).json({ success: false, msg: "Explication assets not exist !" })

    const coverUrl = req.file?.path || null

    let c
    if (isPublic) {
      c = await Course.create({
        teacher: req.user.id, description, explication, interests,
        isPublic, title, objectives,
        language: language || "en",
        favicon: favicon || undefined,
        cover: coverUrl,
      })
    } else {
      const existingCourse = await Course.findOne({ title, classroom: roomID }).lean()
      if (existingCourse) return res.status(409).json({ success: false, msg: "This course already exists", existingCourse })
      c = await Course.create({
        teacher: req.user.id, description, explication, interests,
        isPublic, classroom: roomID, title, objectives,
        language: language || "en",
        favicon: favicon || undefined,
        cover: coverUrl,
      })
    }

    const firstChapter = await CourseModule.create({
      course: c._id,
      title: "Chapter 1",
      description: "This is the first chapter of the course",
      order: 0
    })

    return res.json({ success: true, msg: "Course created successfully", data: { course: c, firstChapter } })

  } catch (e) {
    console.log("Error creating course:", e)
    res.status(500).json({ success: false, msg: "Internal Server Error" })
  }
}

exports.CreateModule = async (req, res) => {
  try {
    const { course, description, title } = req.body
    if (!course || !description || !title) return res.status(400).json({ success: false, msg: "Invalid form data!" })

    const existingCourse = await Course.findOne({ _id: course }).lean()
    if (!existingCourse) return res.status(404).json({ success: false, msg: "Course Not exist yet !" })

    const chapterCount = await CourseModule.countDocuments({ course })
    const chap = await CourseModule.create({ course, title, description, order: chapterCount + 1 })

    return res.json({ success: true, msg: `Chapter ${chapterCount + 1} created successfully`, data: chap })

  } catch (e) {
    console.log("Error creating course:", e)
    res.status(500).json({ success: false, msg: "Internal Server Error" })
  }
}

exports.CreateLesson = async (req, res) => {
  try {
    const { chapter, quiz, quiz_title, content, title, asset } = req.body
    if (!chapter || !content || !title) return res.status(400).json({ success: false, msg: "Invalid Form Data" })
    if (quiz && !Array.isArray(quiz)) return res.status(400).json({ success: false, msg: "Quiz must be an array" })
    if (quiz && !quiz_title) return res.status(400).json({ success: false, msg: "Quiz title is required" })

    if (quiz) {
      for (const qu of quiz) {
        const { question, responses } = qu
        if (!question) return res.status(400).json({ success: false, msg: "Each quiz item needs a question" })
        if (!responses || !Array.isArray(responses) || responses.length === 0) return res.status(400).json({ success: false, msg: "Each question needs responses" })
        const hasCorrect = responses.some(item => item.isCorrect)
        if (!hasCorrect) return res.status(400).json({ success: false, msg: "Each question needs one correct answer" })
      }
    }

    const chap = await CourseModule.findById(chapter)
    if (!chap) return res.status(404).json({ success: false, msg: "Chapter not found" })

    const lesson_count = await Lesson.countDocuments({ module: chapter })
    const lesson = await Lesson.create({ module: chapter, title, content, order: lesson_count + 1, attachment: asset || undefined })

    let c_quiz = null
    if (quiz) {
      c_quiz = await Quiz.create({ lesson: lesson._id, title: quiz_title, content: quiz })
      lesson.quiz = c_quiz._id
      await lesson.save()
    }

    return res.json({ success: true, msg: "Lesson created successfully", lesson, c_quiz })

  } catch (e) {
    return res.status(500).json({ success: false, msg: "Internal Server Error" })
  }
}

exports.getModules = async (req, res) => {
  try {
    const { courseId } = req.params
    const teacherId = req.user.id

    const course = await Course.findOne({ _id: courseId, teacher: teacherId }).lean()
    if (!course) return res.status(404).json({ success: false, message: "Course not found." })

    const cacheKey = `modules:${courseId}`
    const cached = await getCache(cacheKey)
    if (cached) return res.json({ success: true, modules: cached })

    const modules = await CourseModule.find({ course: courseId }).sort({ order: 1 }).lean()

    const modulesWithCount = await Promise.all(
      modules.map(async (mod) => {
        const lessonsCount = await Lesson.countDocuments({ module: mod._id })
        return {
          _id: mod._id,
          title: mod.title,
          description: mod.description,
          order: mod.order,
          estimatedDuration: mod.estimatedDuration,
          isLocked: mod.isLocked,
          lessonsCount,
        }
      })
    )

    await setCache(cacheKey, modulesWithCount)
    res.json({ success: true, modules: modulesWithCount })

  } catch (err) {
    console.error("getModules error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}

exports.createModule = async (req, res) => {
  try {
    const { courseId } = req.params
    const teacherId = req.user.id

    const course = await Course.findOne({ _id: courseId, teacher: teacherId }).lean()
    if (!course) return res.status(404).json({ success: false, message: "Course not found." })

    const lastModule = await CourseModule.findOne({ course: courseId }).sort({ order: -1 }).lean()
    const order = lastModule ? lastModule.order + 1 : 0

    const mod = await CourseModule.create({
      course: courseId,
      title: req.body.title || "New Module",
      description: req.body.description || "",
      estimatedDuration: req.body.estimatedDuration || 0,
      isLocked: false,
      order,
    })

    await invalidateCache(`modules:${courseId}`)

    res.status(201).json({
      success: true,
      module: {
        _id: mod._id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        estimatedDuration: mod.estimatedDuration,
        isLocked: mod.isLocked,
        lessonsCount: 0,
      },
    })

  } catch (err) {
    console.error("createModule error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}

exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    const teacherId = req.user.id

    const mod = await CourseModule.findById(moduleId).populate("course").exec()
    if (!mod) return res.status(404).json({ success: false, message: "Module not found." })
    if (mod.course.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." })
    }

    const allowed = ["title", "description", "estimatedDuration", "isLocked"]
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) mod[key] = req.body[key]
    })

    await mod.save()
    await invalidateCache(`modules:${mod.course._id}`)

    res.json({
      success: true,
      module: {
        _id: mod._id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        estimatedDuration: mod.estimatedDuration,
        isLocked: mod.isLocked,
      },
    })

  } catch (err) {
    console.error("updateModule error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}

exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    const teacherId = req.user.id

    const mod = await CourseModule.findById(moduleId).populate("course").exec()
    if (!mod) return res.status(404).json({ success: false, message: "Module not found." })
    if (mod.course.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." })
    }

    const courseId = mod.course._id

    await Lesson.deleteMany({ module: mod._id })
    await mod.deleteOne()
    await CourseModule.updateMany(
      { course: courseId, order: { $gt: mod.order } },
      { $inc: { order: -1 } }
    )

    await invalidateCache(`modules:${courseId}`)

    res.json({ success: true, message: "Module deleted." })

  } catch (err) {
    console.error("deleteModule error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}

exports.getLessons = async (req, res) => {
  try {
    const { moduleId } = req.params
    const teacherId = req.user.id

    const mod = await CourseModule.findById(moduleId).populate("course").lean()
    if (!mod) return res.status(404).json({ success: false, message: "Module not found." })
    if (mod.course.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." })
    }

    const cacheKey = `lessons:${moduleId}`
    const cached = await getCache(cacheKey)
    if (cached) return res.json({ success: true, lessons: cached })

    const lessons = await Lesson.find({ module: moduleId }).sort({ order: 1 }).lean()

    const formatted = lessons.map((l) => ({
      _id: l._id,
      title: l.title,
      order: l.order,
      estimatedDuration: l.estimatedDuration,
      hasQuiz: !!l.quiz,
    }))

    await setCache(cacheKey, formatted)
    res.json({ success: true, lessons: formatted })

  } catch (err) {
    console.error("getLessons error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}

exports.createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params
    const teacherId = req.user.id

    const mod = await CourseModule.findById(moduleId).populate("course").exec()
    if (!mod) return res.status(404).json({ success: false, message: "Module not found." })
    if (mod.course.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." })
    }

    const lastLesson = await Lesson.findOne({ module: moduleId }).sort({ order: -1 }).lean()
    const order = lastLesson ? lastLesson.order + 1 : 1

    const lesson = await Lesson.create({
      module: moduleId,
      title: req.body.title || "New Lesson",
      content: "",
      order,
      estimatedDuration: req.body.estimatedDuration || 10,
    })

    await invalidateCache(`lessons:${moduleId}`)

    res.status(201).json({
      success: true,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        estimatedDuration: lesson.estimatedDuration,
        hasQuiz: false,
      },
    })

  } catch (err) {
    console.error("createLesson error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}

exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    const teacherId = req.user.id

    const lesson = await Lesson.findById(lessonId).populate({ path: "module", populate: { path: "course" } }).exec()
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found." })
    if (lesson.module.course.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." })
    }

    const allowed = ["title", "estimatedDuration"]
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) lesson[key] = req.body[key]
    })

    await lesson.save()
    await invalidateCache(`lessons:${lesson.module._id}`)

    res.json({
      success: true,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        estimatedDuration: lesson.estimatedDuration,
        hasQuiz: !!lesson.quiz,
      },
    })

  } catch (err) {
    console.error("updateLesson error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}

exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params
    const teacherId = req.user.id

    const lesson = await Lesson.findById(lessonId).populate({ path: "module", populate: { path: "course" } }).exec()
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found." })
    if (lesson.module.course.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden." })
    }

    const moduleId = lesson.module._id

    if (lesson.quiz) await Quiz.deleteOne({ _id: lesson.quiz })

    await lesson.deleteOne()
    await Lesson.updateMany(
      { module: moduleId, order: { $gt: lesson.order } },
      { $inc: { order: -1 } }
    )

    await invalidateCache(`lessons:${moduleId}`)

    res.json({ success: true, message: "Lesson deleted." })

  } catch (err) {
    console.error("deleteLesson error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error." })
  }
}