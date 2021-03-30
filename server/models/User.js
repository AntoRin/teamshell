const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
   {
      UniqueUsername: {
         type: String,
         required: true,
         unique: true,
      },
      Username: {
         type: String,
         default: "",
      },
      Email: {
         type: String,
         required: true,
         unique: true,
      },
      Password: {
         type: String,
         required: true,
      },
      ProfileImage: {
         type: String,
         default: "No Image",
      },
      Bio: {
         type: String,
         default: "",
      },
      Organizations: {
         type: Array,
         default: [],
      },
      Projects: {
         type: Array,
         default: [],
      },
      Issues: {
         type: Array,
         default: [],
      },
   },
   { timestamps: true }
);

const User = mongoose.model("User", UserSchema, "Users");

module.exports = User;