import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/dcjkx9uxr/image/upload/v1763738752/Gemini_Generated_Image_shyyonshyyonshyy_kzs6bz.png",
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


},

    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;