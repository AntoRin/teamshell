import { useState, useEffect, useContext, useRef } from "react";
import { Button, makeStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MinimizeIcon from "@material-ui/icons/Minimize";
import SendIcon from "@material-ui/icons/Send";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import CenteredLoader from "../UtilityComponents/CenteredLoader";
import "../../styles/chatbox.css";

const useStyles = makeStyles({
   toolIcon: {
      cursor: "pointer",
   },
   mg: {
      margin: "10px",
   },
   chatLoader: {
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
   },
});

function ChatBox({ User, chatSettings, setChatSettings }) {
   const classes = useStyles();

   const [allChat, setAllChat] = useState([]);
   const [message, setMessage] = useState("");
   const [minimized, setMinimized] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const socket = useContext(SocketInstance);

   const chatRef = useRef();

   useEffect(() => {
      if (!chatSettings.recipient) {
         setChatSettings({
            open: false,
            recipient: null,
         });
      }
   }, [chatSettings, setChatSettings]);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getChat() {
         if (!chatSettings.recipient) return;

         setIsLoading(true);

         let User1 = User.UniqueUsername;
         let User2 = chatSettings.recipient;

         try {
            let responseStream = await fetch(
               `/api/chat/all-messages?User1=${User1}&User2=${User2}`,
               { signal: abortFetch.signal }
            );
            let responseData = await responseStream.json();
            let chat = responseData.data.Messages;
            if (!chat) {
               setIsLoading(false);
               return;
            }
            let chatLatest = chat.reverse();
            setAllChat(chatLatest);
            setIsLoading(false);
         } catch (error) {
            console.log(error);
         }
      }
      getChat();

      setMinimized(false);

      return () => abortFetch.abort();
   }, [chatSettings.recipient, User.UniqueUsername]);

   useEffect(() => {
      let sorter = [User.UniqueUsername, chatSettings.recipient];
      sorter.sort();
      socket.on(`new-message-${sorter[0]}${sorter[1]}`, messageData => {
         setAllChat(prev => [...prev, messageData.Messages[0]]);
      });

      return () => socket.off(`new-message-${sorter[0]}${sorter[1]}`);
   }, [socket, User.UniqueUsername, chatSettings.recipient]);

   useEffect(() => {
      if (chatRef.current)
         chatRef.current.scrollTop += chatRef.current.scrollHeight;
   }, [allChat, minimized, isLoading]);

   function closeChat() {
      setChatSettings({
         open: false,
         recipient: null,
      });
   }

   function toggleWindowMinimize() {
      setMinimized(prev => !prev);
   }

   function handleInputChange(event) {
      setMessage(event.target.value);
   }

   function handleNewMessage(event) {
      event.preventDefault();

      let messageData = {
         from: User.UniqueUsername,
         to: chatSettings.recipient,
         content: message,
      };

      socket.emit("message", messageData);

      setMessage("");
   }

   return !minimized ? (
      <div className="chatbox-container">
         <div className="chatbox-header">
            <div className="chatbox-recipient-banner">
               <Avatar
                  src={`/api/profile/profile-image/${chatSettings.recipient}`}
                  alt=""
               />
               <h4>{chatSettings.recipient}</h4>
            </div>
            <div className="chatbox-controls">
               <IconButton onClick={toggleWindowMinimize}>
                  <MinimizeIcon className={classes.toolIcon} size="large" />
               </IconButton>
               <IconButton onClick={closeChat}>
                  <CloseIcon className={classes.toolIcon} size="large" />
               </IconButton>
            </div>
         </div>
         <div ref={chatRef} className="chat-messages-display">
            {isLoading ? (
               <CenteredLoader absolutelyPositioned={true} />
            ) : (
               allChat.length > 0 &&
               allChat.map((data, index) => {
                  return (
                     <div
                        key={data._id || index}
                        className={
                           data.from === User.UniqueUsername
                              ? "right-flex message-block"
                              : "left-flex message-block"
                        }
                     >
                        <div
                           className={
                              data.from === User.UniqueUsername
                                 ? "right-flex message-content-wrapper message-special"
                                 : "left-flex message-content-wrapper"
                           }
                        >
                           <div className="message-author">{data.from}</div>
                           <div className="message-content">{data.content}</div>
                        </div>
                     </div>
                  );
               })
            )}
         </div>
         <div className="chat-message-editor">
            <div className="chat-message-input">
               <form id="chatForm" onSubmit={handleNewMessage}>
                  <input
                     onChange={handleInputChange}
                     value={message}
                     type="text"
                     id="chatInput"
                     autoComplete="off"
                     required
                  />
                  <Button type="submit">
                     <SendIcon color="primary" />
                  </Button>
               </form>
            </div>
         </div>
      </div>
   ) : (
      <div className="chatbox-min-controls" onClick={toggleWindowMinimize}>
         <IconButton onClick={closeChat}>
            <CloseIcon
               className={classes.toolIcon + " " + classes.mg}
               size="large"
            />
         </IconButton>
      </div>
   );
}

export default ChatBox;
