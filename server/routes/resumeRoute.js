import express from "express"
import protect from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { createResume, deleteResume, duplicateResume, getPublicResumeById, getResumeById, updateResume, listVersions, restoreVersion } from "../controllers/resumeController.js";
import upload from "../config/multer.js";
import { createResumeSchema, updateResumeSchema } from "../validators/aiSchemas.js";

const resumeRouter = express.Router();

resumeRouter.post('/create', protect, validate(createResumeSchema), createResume)
resumeRouter.put('/update', protect, upload.single('image'), validate(updateResumeSchema), updateResume)
resumeRouter.post('/duplicate/:resumeId', protect, duplicateResume)
resumeRouter.delete('/delete/:resumeId', protect, deleteResume)
resumeRouter.get('/get/:resumeId', protect, getResumeById)
resumeRouter.get('/public/:resumeId', getPublicResumeById)
resumeRouter.get('/versions/:resumeId', protect, listVersions)
resumeRouter.post('/restore/:resumeId/:versionId', protect, restoreVersion)

export default resumeRouter;
