import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import EcoIcon from "@material-ui/icons/Eco";
import WbIncandescentIcon from "@material-ui/icons/WbIncandescent";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import EventIcon from "@material-ui/icons/Event";
import { Divider } from "@material-ui/core";
import formatDate from "../../utils/formatDate";

const useStyles = makeStyles({
   userChip: {
      "& .MuiChip-label": {
         fontSize: "1.3rem",
         padding: "20px",
      },
   },
   listIcon: {
      color: "rgb(108, 98, 190)",
   },
   divider: {
      "&.MuiDivider-root": {
         background: "rgb(51, 0, 111, 0.5)",
      },
   },
});

const commonTypographicProps = variant => ({
   variant,
   color: "inherit",
   gutterBottom: true,
});

function OrgGeneralDetails({ Organization }) {
   const classes = useStyles();

   const history = useHistory();

   function goToProfile(username) {
      history.push(`/user/profile/${username}`);
   }

   return (
      <Container>
         <List>
            <ListItem className={classes.listElement} divider={false}>
               <ListItemIcon>
                  <EcoIcon fontSize="large" className={classes.listIcon} />
               </ListItemIcon>
               <ListItemText
                  primary={Organization.OrganizationName}
                  primaryTypographyProps={commonTypographicProps("h5")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <WbIncandescentIcon
                     fontSize="large"
                     className={classes.listIcon}
                  />
               </ListItemIcon>
               <ListItemText
                  primary="Created by: "
                  primaryTypographyProps={{
                     ...commonTypographicProps("h6"),
                     component: "div",
                  }}
                  secondary={
                     <Chip
                        className={classes.userChip}
                        clickable={true}
                        onClick={() => goToProfile(Organization.Creator)}
                        variant="outlined"
                        label={Organization.Creator}
                        color="primary"
                        size="medium"
                        avatar={
                           <Avatar
                              src={`/api/profile/profile-image/${Organization.Creator}`}
                              alt=""
                           />
                        }
                     />
                  }
                  secondaryTypographyProps={{ component: "div" }}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <AssignmentIcon
                     fontSize="large"
                     className={classes.listIcon}
                  />
               </ListItemIcon>
               <ListItemText
                  primary="No. of projects: "
                  primaryTypographyProps={commonTypographicProps("h6")}
                  secondary={0 || Organization.Projects.length}
                  secondaryTypographyProps={commonTypographicProps("h6")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <PeopleAltIcon
                     fontSize="large"
                     className={classes.listIcon}
                  />
               </ListItemIcon>
               <ListItemText
                  primary="Members: "
                  primaryTypographyProps={commonTypographicProps("h6")}
                  secondary={Organization.Members.length}
                  secondaryTypographyProps={commonTypographicProps("h6")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
            <ListItem className={classes.listElement}>
               <ListItemIcon>
                  <EventIcon fontSize="large" className={classes.listIcon} />
               </ListItemIcon>
               <ListItemText
                  primary="Created at: "
                  primaryTypographyProps={commonTypographicProps("h6")}
                  secondary={formatDate(Organization.createdAt)}
                  secondaryTypographyProps={commonTypographicProps("h6")}
               />
            </ListItem>
            <Divider variant="middle" className={classes.divider} />
         </List>
      </Container>
   );
}

export default OrgGeneralDetails;
