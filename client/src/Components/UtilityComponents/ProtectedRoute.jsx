import React, { useState, useEffect, createContext } from "react";
import { Route, Redirect } from "react-router-dom";
import io from "socket.io-client";
import GlobalNav from "./GlobalNav";
import ChatBox from "../User/ChatBox";
import ThemeLoader from "./ThemeLoader";

export const SocketInstance = createContext();

function ProtectedRoute({ component: Component, ...props }) {
   const [User, setUser] = useState({});
   const [authenticated, setAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [socket, setSocket] = useState(null);
   const [chatSettings, setChatSettings] = useState({
      open: false,
      recipient: null,
   });
   const [navHeight, setNavHeight] = useState(90);

   useEffect(() => {
      setSocket(
         io({
            withCredentials: true,
            reconnectionAttempts: 5,
         })
      );
   }, []);

   useEffect(() => {
      return () => {
         if (socket && socket.connected) socket.disconnect();
      };
   }, [socket]);

   useEffect(() => {
      let abortFetch = new AbortController();

      async function verifyUser() {
         try {
            let auth = await fetch("/api/auth/verify", {
               signal: abortFetch.signal,
            });

            if (abortFetch.signal.aborted) return;

            let serverResponse = await auth.json();
            if (serverResponse.status === "ok") {
               setAuthenticated(true);
               setUser(serverResponse.User);
               setIsLoading(false);
            } else {
               setAuthenticated(false);
               setIsLoading(false);
            }
         } catch (error) {
            console.log("The request was aborted");
         }
      }
      verifyUser();

      return () => abortFetch.abort();
   }, [Component]);

   if (isLoading || !socket) {
      return <ThemeLoader />;
   } else {
      return authenticated ? (
         <SocketInstance.Provider value={socket}>
            <Route
               {...props}
               render={componentProps => {
                  return (
                     <>
                        <GlobalNav
                           UniqueUsername={User.UniqueUsername}
                           ProfileImage={User.ProfileImage}
                           setChatSettings={setChatSettings}
                           setNavHeight={setNavHeight}
                        />
                        <Component
                           {...componentProps}
                           setChatSettings={setChatSettings}
                           User={User}
                           navHeight={navHeight}
                        />
                        {chatSettings.open && (
                           <ChatBox
                              User={User}
                              chatSettings={chatSettings}
                              setChatSettings={setChatSettings}
                           />
                        )}
                     </>
                  );
               }}
            />
         </SocketInstance.Provider>
      ) : (
         <Redirect to="/" />
      );
   }
}

export default ProtectedRoute;
