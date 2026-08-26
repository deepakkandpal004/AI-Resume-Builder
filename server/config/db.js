import mongoose from "mongoose";
import logger from "../observability/logger.js";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
        logger.info("MongoDB connected successfully");
        });

        let mongodbURI = process.env.MONGODB_URI;
        const projectName = "resume-builder"

        if(!mongodbURI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        if(mongodbURI.endsWith('/')) {
            mongodbURI = mongodbURI.slice(0, -1);
        }

        await mongoose.connect(`${mongodbURI}/${projectName}`);
        } catch (error) {
      logger.error("Error connecting to MongoDB:", error.message);
      process.exit(1);
    }
}

export default connectDB;
