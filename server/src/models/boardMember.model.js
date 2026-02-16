import mongoose from "mongoose";

const boardMemberSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);

// prevent duplicate members
boardMemberSchema.index({ boardId: 1, userId: 1 }, { unique: true });

export default mongoose.model("BoardMember", boardMemberSchema);
