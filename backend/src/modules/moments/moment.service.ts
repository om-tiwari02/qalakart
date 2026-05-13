import { Moment } from "./moment.model.js";

export async function createMoment(userId: string, data: { imageUrl: string; caption: string }) {
  return Moment.create({ ...data, userId });
}

export async function getMoments() {
  return Moment.find()
    .sort({ createdAt: -1 })
    .populate("userId", "firstName lastName")
    .populate("comments.userId", "firstName lastName")
    .exec();
}

export async function toggleLike(momentId: string, userId: string) {
  const moment = await Moment.findById(momentId);
  if (!moment) {
    const err = new Error("Moment not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  const likeIndex = moment.likes.findIndex((id) => String(id) === userId);
  if (likeIndex > -1) {
    moment.likes.splice(likeIndex, 1);
  } else {
    moment.likes.push(userId as any);
  }

  return moment.save();
}

export async function addComment(momentId: string, userId: string, text: string) {
  const moment = await Moment.findById(momentId);
  if (!moment) {
    const err = new Error("Moment not found") as Error & { statusCode?: number };
    err.statusCode = 404;
    throw err;
  }

  moment.comments.push({ userId: userId as any, text, createdAt: new Date() });
  return moment.save();
}
