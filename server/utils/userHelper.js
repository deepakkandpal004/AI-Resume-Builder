import User from "../models/User.js";

export const getMongoUserId = async (firebaseUid) => {
  const user = await User.findOne({ firebaseUid }).select("_id");
  return user?._id;
};

export const getMongoUser = async (firebaseUid) => {
  return User.findOne({ firebaseUid });
};
