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
      Notifications: {
         type: [
            {
               Initiator: {
                  type: {
                     UniqueUsername: String,
                     ProfileImage: String,
                  },
                  required: true,
               },
               InfoType: {
                  type: String,
                  required: true,
               },
               Target: {
                  type: {
                     Category: String,
                     Name: String,
                     Info: String,
                  },
               },
               ActivityContent: {
                  type: {
                     Action: { type: String, required: true },
                     Keyword: { type: String, required: true },
                  },
               },
               Hyperlink: {
                  type: String,
                  required: true,
               },
               Seen: {
                  type: Boolean,
                  required: true,
                  default: false,
               },
               createdAt: {
                  type: Date,
                  default: Date.now,
               },
            },
         ],
         default: [],
      },
      Organizations: {
         type: [
            {
               OrganizationName: { type: String, required: true },
               Status: { type: String, required: true },
            },
         ],
         default: [],
      },
      Projects: {
         type: [
            {
               ProjectName: { type: String, required: true },
               ParentOrganization: { type: String, required: true },
               Status: { type: String, required: true },
            },
         ],
         default: [],
      },
      Issues: {
         type: {
            Created: {
               type: [
                  {
                     IssueTitle: { type: String, required: true },
                     ProjectContext: { type: String, required: true },
                  },
               ],
               default: [],
            },
         },
         default: {
            Created: [],
         },
      },
      Solutions: {
         type: {
            Created: {
               type: [
                  {
                     _id: { type: mongoose.Types.ObjectId, required: true },
                     IssueContext: {
                        type: {
                           _id: mongoose.Types.ObjectId,
                           IssueTitle: String,
                        },
                        required: true,
                     },
                  },
               ],
            },
            Liked: {
               type: [
                  {
                     _id: { type: mongoose.Types.ObjectId, required: true },
                     IssueContext: {
                        type: {
                           _id: mongoose.Types.ObjectId,
                           IssueTitle: String,
                        },
                        required: true,
                     },
                  },
               ],
            },
         },
         default: {
            Created: [],
            Following: [],
         },
      },
   },
   { timestamps: true }
);

const User = mongoose.model("User", UserSchema, "Users");

module.exports = User;
