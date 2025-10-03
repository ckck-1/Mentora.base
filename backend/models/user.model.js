import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  
  avatar: { type: String, default: "" },
  
  
  aiChats: [
    {
      question: String,
      aiAnswer: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  subscriptionPlan: { 
    type: String, 
    enum: ["free", "basic", "premium"], 
    default: "free" 
  },
  subscriptionExpires: { type: Date },
  streakDays: { type: Number, default: 0 },
  badges: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

const User =mongoose.model("User", UserSchema);
export default User;
