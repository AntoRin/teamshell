import { useState, useEffect, useContext } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import { GlobalActionStatus } from "../App";
import SolutionEditor from "../Issue/SolutionEditor";
import SolutionCard from "../Issue/SolutionCard";
import IssueCard from "../User/IssueCard";
import LinearLoader from "../UtilityComponents/LinearLoader";

const useStyles = makeStyles(theme => ({
   issueHomeContainer: {
      minHheight: "100vh",
      height: "100%",
      overflowX: "hidden",
      background: "#111",
      marginTop: navHeight => navHeight,
   },
   issueStatementDescriptionMain: {
      margin: "20px",
   },
   solutionReadSection: {
      margin: "50px",
   },
   componentTitle: {
      color: "#999",
      background: "#222",
      padding: "7px",
      marginTop: "40px",
   },
}));

function IssueHome({ location, match, User, navHeight }) {
   const [issueDetails, setIssueDetails] = useState("");
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [pageHash, setPageHash] = useState(null);

   const socket = useContext(SocketInstance);
   const setActionStatus = useContext(GlobalActionStatus);

   const classes = useStyles(navHeight);

   useEffect(() => {
      const abortFetch = new AbortController();
      async function getIssueDetails() {
         try {
            const rawData = await fetch(
               `/api/issue/details/${match.params.IssueID}`,
               { signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            const responseData = await rawData.json();

            if (responseData.status === "error") throw responseData.error;

            setIssueDetails(responseData.data);
            setIsAuthorized(true);
            setIsLoading(false);
         } catch (error) {
            if (error.name !== "AbortError") {
               setIsAuthorized(false);
               setIssueDetails("");
               setIsLoading(false);
            }
         }
      }

      getIssueDetails();

      socket.on("issue-data-change", () => getIssueDetails());

      return () => {
         abortFetch.abort();
         socket.off("issue-data-change");
      };
   }, [match.params, socket]);

   useEffect(() => {
      const { hash } = location;

      if (!hash) return;

      setPageHash(hash.split("#")[1]);
   }, [location]);

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isAuthorized ? (
         <div className={classes.issueHomeContainer}>
            <div>
               <div className={classes.issueStatementDescriptionMain}>
                  <IssueCard
                     User={User}
                     issue={issueDetails}
                     showContent={true}
                     setActionStatus={setActionStatus}
                     redirectOnDelete={true}
                  />
               </div>
               {issueDetails.Active ? (
                  <div className="solutions-write-section">
                     <Typography
                        className={classes.componentTitle}
                        align="center"
                        variant="h4"
                        gutterBottom
                     >
                        Write your solution here
                     </Typography>
                     <SolutionEditor
                        issueDetails={issueDetails}
                        User={User}
                        socket={socket}
                     />
                  </div>
               ) : (
                  <Typography
                     className={classes.componentTitle}
                     align="center"
                     variant="h4"
                     gutterBottom
                  >
                     Issue closed
                  </Typography>
               )}
               <div className={classes.solutionReadSection}>
                  {issueDetails.Solutions.length > 0
                     ? issueDetails.Solutions.map(solution => {
                          return (
                             <SolutionCard
                                pageHash={pageHash}
                                key={solution._id}
                                solution={solution}
                                User={User}
                                issueDetails={issueDetails}
                             />
                          );
                       })
                     : null}
               </div>
            </div>
         </div>
      ) : (
         <h1>Something went wrong</h1>
      );
   }
}

export default IssueHome;
