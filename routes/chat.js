const { Router } = require("express");
const router = Router();
const Chat = require("../models/Chat");
const ProjectChat = require("../models/ProjectChat");

router.get("/chat-history", async (req, res, next) => {
   let { UniqueUsername } = req.thisUser;

   try {
      let chatHistory = await Chat.find(
         { Users: UniqueUsername },
         { Messages: 0 }
      ).sort({ updatedAt: -1 });

      let memberList = chatHistory.map(chat => {
         let thisRecipient = chat.Users.find(user => user !== UniqueUsername);
         return thisRecipient;
      });

      return res.json({ status: "ok", data: memberList });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.get("/all-messages", async (req, res, next) => {
   let { User1, User2 } = req.query;
   let sorter = [User1, User2];
   sorter.sort();
   let ChatID = sorter[0] + sorter[1];

   try {
      let chat = await Chat.findOne({ ChatID });

      return chat
         ? res.json({ status: "ok", data: chat })
         : res.json({ status: "ok", data: [] });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

router.get("/project/:projectName", async (req, res, next) => {
   let projectName = req.params.projectName;

   try {
      let chat = await ProjectChat.findOne({ ProjectName: projectName }).lean();

      if (!chat) return res.json({ status: "ok", data: null });

      let messages = chat.Messages;

      orderedMessages = messages.reverse();

      return res.json({ status: "ok", data: orderedMessages });
   } catch (error) {
      console.log(error);
      return next(error);
   }
});

module.exports = router;
