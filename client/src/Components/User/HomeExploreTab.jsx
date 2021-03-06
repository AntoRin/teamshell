import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CenteredLoader from "../UtilityComponents/CenteredLoader";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles({
   exploreOrgsContainer: {
      width: "100%",
      height: "100%",
      position: "relative",
      overflowY: "scroll",
   },
   resultContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      "& .MuiCard-root": {
         backgroundColor: "#777",
         margin: "20px",
      },
   },
   cardContainer: {
      width: "75%",
      "& .MuiCardActions-root": {
         borderTop: "1px solid #111",
         "& .MuiButton-root": {
            border: "1px solid #111",
            backgroundColor: "#555",
         },
      },
   },
   cardTitle: {
      fontWeight: "1000",
      fontSize: "1.3rem",
   },
   pos: {
      marginBottom: 12,
   },
   loadMore: {
      position: "fixed",
      bottom: "20px",
      left: sidePanelWidth => `calc(50vw + ${sidePanelWidth / 2}px)`,
      transform: "translateX(-50%)",
      "& .MuiChip-root": {},
   },
});

function HomeExploreTab({ tab, sidePanelWidth }) {
   const [exploreOrgs, setExploreOrgs] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [loadMore, setLoadMore] = useState(false);

   const history = useHistory();

   const classes = useStyles(sidePanelWidth);

   useEffect(() => {
      if (tab !== "explore") return;
      if (exploreOrgs && !loadMore) return;

      const abortFetch = new AbortController();

      (async () => {
         setIsLoading(true);

         try {
            const responseStream = await fetch("/api/organization/explore", {
               signal: abortFetch.signal,
            });

            if (abortFetch.signal.aborted) return;

            const response = await responseStream.json();

            if (response.status === "error") throw new Error(response.error);

            setExploreOrgs(response.data.exploreOrganizations);
         } catch (error) {
            if (error.name !== "AbortError") {
               console.log(error);
            }
         } finally {
            if (!abortFetch.signal.aborted) {
               setLoadMore(false);
               setIsLoading(false);
            }
         }
      })();

      return () => abortFetch.abort();
   }, [tab, exploreOrgs, loadMore]);

   function goToOrganization(orgName) {
      history.push(`/organization/${orgName}`);
   }

   function loadMoreOrgs() {
      setLoadMore(true);
   }

   return tab === "explore" ? (
      <div className={classes.exploreOrgsContainer}>
         {exploreOrgs &&
            exploreOrgs.length > 0 &&
            exploreOrgs.map(org => (
               <div key={org._id} className={classes.resultContainer}>
                  <Card className={classes.cardContainer}>
                     <CardContent>
                        <Typography
                           className={classes.cardTitle}
                           color="textSecondary"
                           gutterBottom
                        >
                           Organization
                        </Typography>
                        <Typography variant="h5" component="h2">
                           Name: {org.OrganizationName}
                        </Typography>
                        <Typography
                           className={classes.pos}
                           color="textSecondary"
                        >
                           {org.Public ? "Public" : "Private"}
                        </Typography>
                        <Typography variant="body2" component="p">
                           {org.Description}
                        </Typography>
                     </CardContent>
                     <CardActions>
                        <Button
                           size="small"
                           onClick={() =>
                              goToOrganization(org.OrganizationName)
                           }
                        >
                           Learn More
                        </Button>
                     </CardActions>
                  </Card>
               </div>
            ))}
         <div className={classes.loadMore}>
            <Chip label="Load more" clickable onClick={loadMoreOrgs} />
         </div>
         {isLoading && <CenteredLoader absolutelyPositioned />}
      </div>
   ) : null;
}

export default HomeExploreTab;
