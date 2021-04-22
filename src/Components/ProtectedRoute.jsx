import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import io from "socket.io-client";

//--------------------Remove credentials for cross-origin------------------

function ProtectedRoute({ component: Component, ...props }) {
   const [User, setUser] = useState({});
   const [authenticated, setAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [socket, setSocket] = useState("");

   useEffect(() => {
      setSocket(io("http://localhost:5000"));
   }, []);

   useEffect(() => {
      let abortFetch = new AbortController();
      async function verifyUser() {
         try {
            let auth = await fetch("http://localhost:5000/auth/verify", {
               credentials: "include",
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
      return (
         <div>
            <h1>Loading...</h1>
         </div>
      );
   } else {
      return authenticated ? (
         <Route
            {...props}
            render={componentProps => {
               return (
                  <Component {...componentProps} socket={socket} User={User} />
               );
            }}
         />
      ) : (
         <Redirect to="/" />
      );
   }
}

export default ProtectedRoute;
