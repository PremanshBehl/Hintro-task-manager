import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: String,
    entityType: {
      type: String,
      enum: ["task", "list", "board"],
    },
    entityId: mongoose.Schema.Types.ObjectId,
    metaData: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
