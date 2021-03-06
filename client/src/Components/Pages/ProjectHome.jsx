import { useState, useEffect, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, makeStyles, Typography } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import SettingsIcon from "@material-ui/icons/Settings";
import IconButton from "@material-ui/core/IconButton";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { GlobalActionStatus } from "../App";
import ProjectTabPanel from "../Project/ProjectTabPanel";
import ProjectSettingsModal from "../Project/ProjectSettingsModal";
import LinearLoader from "../UtilityComponents/LinearLoader";

const useStyles = makeStyles(theme => ({
   projectHomeConainer: {
      marginTop: navHeight => navHeight,
   },
   root: navHeight => ({
      flexGrow: 1,
      backgroundColor: "rgb(18, 18, 23)",
      display: "flex",
      minHeight: `calc(100vh - ${navHeight}px)`,
      overflowY: "scroll",
      overflowX: "hidden",
      fontFamily: `"Roboto", sans-serif`,
   }),
   tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor: "#111",
   },
   tab: {
      margin: "15px",
   },
   settings: {
      position: "fixed",
      bottom: "5px",
      left: "5px",
   },
   crumbs: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: "10px",
      padding: "5px",
      borderBottom: "1px dashed rgb(108, 98, 190)",
   },
   crumbLinks: {
      textDecoration: "none",
   },
}));

function ProjectHome({ match, User, navHeight }) {
   const classes = useStyles(navHeight);

   const [isLoading, setIsLoading] = useState(true);
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [parentOrg, setParentOrg] = useState({});
   const [Project, setProject] = useState({});
   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
   const [tabName, setTabName] = useState("General Details");

   const setActionStatus = useContext(GlobalActionStatus);

   const history = useHistory();

   useEffect(() => {
      let abortFetch = new AbortController();

      async function getProjectDetails() {
         try {
            let orgRequest = await fetch(
               `/api/organization/details/${match.params.OrganizationName}`,
               {
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let orgResponse = await orgRequest.json();

            if (orgResponse.status === "ok") {
               setParentOrg(orgResponse.Organization);
            } else {
               setParentOrg({});
               setIsAuthorized(false);
               history.push("/user/home");
               return;
            }

            let projectRequest = await fetch(
               `/api/project/details/${match.params.ProjectName}`,
               {
                  credentials: "include",
                  signal: abortFetch.signal,
               }
            );

            if (abortFetch.signal.aborted) return;

            let projectResponse = await projectRequest.json();

            if (projectResponse.status === "error") throw projectResponse.error;

            setProject(projectResponse.Project);
            setIsAuthorized(true);
            setIsLoading(false);
         } catch (error) {
            if (error.name !== "AbortError") {
               setParentOrg({});
               setProject({});
               setIsAuthorized(false);
               return history.push("/user/home");
            }
         }
      }

      getProjectDetails();

      return () => abortFetch.abort();
   }, [match, history]);

   function handleTabChange(event) {
      setTabName(event.target.textContent);
   }

   function openSettingsModal() {
      setIsSettingsOpen(true);
   }

   async function handleJoinRequest() {
      try {
         let requestData = {
            projectName: Project.ProjectName,
         };

         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
         };

         let responseStream = await fetch(
            "/api/project/join/new-user",
            postOptions
         );
         let response = await responseStream.json();

         if (response.status === "error") throw response.error;

         setActionStatus({ info: response.data, type: "info" });
      } catch (error) {
         setActionStatus({ info: error, type: "error" });
      }
   }

   async function handleLeaveProject() {
      try {
         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
         };

         let responseStream = await fetch(
            `/api/project/leave/${Project.ProjectName}`,
            postOptions
         );

         let response = await responseStream.json();

         if (response.status === "error") throw response.error;

         setActionStatus({ info: response.data, type: "info" });
      } catch (error) {
         console.log(error);
      }
   }

   if (isLoading) {
      return <LinearLoader />;
   } else {
      return isAuthorized ? (
         <div className={classes.projectHomeConainer}>
            <div className={classes.crumbs}>
               <Breadcrumbs separator={<NavigateNextIcon color="primary" />}>
                  <Link
                     className={classes.crumbLinks}
                     to={`/organization/${parentOrg.OrganizationName}`}
                  >
                     <Typography
                        color="secondary"
                        variant="h6"
                        gutterBottom={true}
                     >
                        {parentOrg.OrganizationName}
                     </Typography>
                  </Link>
                  <Link
                     className={classes.crumbLinks}
                     to={`/project/${parentOrg.OrganizationName}/${Project.ProjectName}`}
                  >
                     <Typography
                        color="secondary"
                        variant="h6"
                        gutterBottom={true}
                     >
                        {Project.ProjectName}
                     </Typography>
                  </Link>
               </Breadcrumbs>
               <Button
                  color="secondary"
                  variant="outlined"
                  onClick={
                     Project.Members.includes(User.UniqueUsername)
                        ? handleLeaveProject
                        : handleJoinRequest
                  }
               >
                  {Project.Members.includes(User.UniqueUsername)
                     ? "Leave"
                     : "Join"}
               </Button>
            </div>
            <div className={classes.root}>
               <Tabs
                  orientation="vertical"
                  indicatorColor="primary"
                  value={tabName}
                  onChange={handleTabChange}
                  className={classes.tabs}
               >
                  <Tab
                     className={classes.tab}
                     label="General Details"
                     value="General Details"
                  />
                  <Tab className={classes.tab} label="Issues" value="Issues" />
                  <Tab
                     className={classes.tab}
                     label="Members"
                     value="Members"
                  />
               </Tabs>
               <ProjectTabPanel tabName={tabName} Project={Project} />
               {Project.Creator === User.UniqueUsername && (
                  <IconButton
                     className={classes.settings}
                     onClick={openSettingsModal}
                  >
                     <SettingsIcon color="primary" />
                  </IconButton>
               )}
               <ProjectSettingsModal
                  User={User}
                  Project={Project}
                  isSettingsOpen={isSettingsOpen}
                  setIsSettingsOpen={setIsSettingsOpen}
               />
            </div>
         </div>
      ) : (
         <h1>There was an error</h1>
      );
   }
}

export default ProjectHome;
