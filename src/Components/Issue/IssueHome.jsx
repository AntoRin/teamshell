import { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core";
import GlobalNav from "../GlobalNav";
import SolutionEditor from "./SolutionEditor";
import SolutionCard from "./SolutionCard";
import IssueCard from "../User/IssueCard";
import "../../styles/issue-home.css";

const useStyles = makeStyles(theme => ({
   "component-title": {
      color: "lightgreen",
      background: "#222",
      padding: "7px",
      marginTop: "50px",
   },
}));

function IssueHome({ match, User, socket }) {
   const classes = useStyles();

   const [issueDetails, setIssueDetails] = useState("");
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      let abortFetch = new AbortController();
      async function getIssueDetails() {
         try {
            let rawData = await fetch(
               `http://localhost:5000/issue/details/${match.params.IssueID}`,
               { credentials: "include", signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let responseData = await rawData.json();

            if (responseData.status === "error") throw responseData.error;

            setIssueDetails(responseData.data);
            setIsAuthorized(true);
            setIsLoading(false);
         } catch (error) {
            console.log(error);
            setIsAuthorized(false);
            setIssueDetails("");
            setIsLoading(false);
         }
      }

      getIssueDetails();

      socket.on("Data Available", () => getIssueDetails());

      return () => {
         abortFetch.abort();
         socket.off("Data Available");
      };
   }, [match.params, socket]);

   useEffect(() => {});

   if (isLoading) {
      return <h1>Loading...</h1>;
   } else {
      return isAuthorized ? (
         <div className="issue-home-container">
            <GlobalNav
               ProfileImage={User.ProfileImage}
               UniqueUsername={User.UniqueUsername}
            />
            <div className="issue-home-contents-wrapper">
               <div className="issue-statement-description-main">
                  <IssueCard issue={issueDetails} showContent={true} />
               </div>
               <div className="solutions-write-section">
                  <Typography
                     className={classes["component-title"]}
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
               <div className="solutions-read-section">
                  {issueDetails.Solutions.length > 0
                     ? issueDetails.Solutions.map(solution => {
                          return (
                             <SolutionCard
                                key={solution._id}
                                solution={solution}
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
