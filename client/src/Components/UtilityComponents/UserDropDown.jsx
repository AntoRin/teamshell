import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import EcoIcon from "@material-ui/icons/Eco";
import CodeIcon from "@material-ui/icons/Code";
import SettingsApplicationsOutlinedIcon from "@material-ui/icons/SettingsApplicationsOutlined";
import BugReportOutlinedIcon from "@material-ui/icons/BugReportOutlined";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

const useStyles = makeStyles({
   dropdownContainer: {
      backgroundColor: "rgb(30, 32, 40)",

      "& > div": {
         zIndex: 200,
      },
   },
   listElement: {
      "&.MuiListItem-divider": {
         color: "lightblue",
      },
   },
   icons: {
      color: "lightgreen",
   },
});

const listTextProps = {
   variant: "h6",
};

function UserDropDown({ isOpen, setIsDropdownOpen, UniqueUsername }) {
   const classes = useStyles();

   const history = useHistory();

   function closeDropdown() {
      setIsDropdownOpen(false);
   }

   function goToLink(link) {
      history.push(link);
   }

   async function handleLogout() {
      try {
         let logout = await fetch("/api/auth/logout", {
            redirect: "manual",
            credentials: "include",
         });
         if (logout.type === "opaqueredirect") history.push("/");
      } catch (error) {
         console.log(error);
      }
   }

   return isOpen ? (
      <ClickAwayListener onClickAway={closeDropdown}>
         <div className={classes.dropdownContainer}>
            <List>
               <ListItem
                  className={classes.listElement}
                  dense={false}
                  button={true}
                  divider={true}
                  onClick={() => goToLink(`/user/profile/${UniqueUsername}`)}
               >
                  <ListItemAvatar>
                     <Avatar
                        src={`/api/profile/profile-image/${UniqueUsername}`}
                        alt=""
                        variant="rounded"
                     />
                  </ListItemAvatar>
                  <ListItemText
                     primary={UniqueUsername}
                     primaryTypographyProps={{
                        ...listTextProps,
                        color: "secondary",
                     }}
                  />
               </ListItem>
               <ListItem
                  className={classes.listElement}
                  dense={true}
                  button={true}
                  divider={true}
                  onClick={() =>
                     goToLink(
                        `/user/profile/${UniqueUsername}?tab=organizations`
                     )
                  }
               >
                  <ListItemIcon>
                     <EcoIcon className={classes.icons} />
                  </ListItemIcon>
                  <ListItemText
                     primary="Organizations"
                     primaryTypographyProps={listTextProps}
                  />
               </ListItem>
               <ListItem
                  className={classes.listElement}
                  dense={true}
                  button={true}
                  divider={true}
                  onClick={() =>
                     goToLink(`/user/profile/${UniqueUsername}?tab=projects`)
                  }
               >
                  <ListItemIcon>
                     <CodeIcon className={classes.icons} />
                  </ListItemIcon>
                  <ListItemText
                     primary="Projects"
                     primaryTypographyProps={listTextProps}
                  />
               </ListItem>
               <ListItem
                  className={classes.listElement}
                  dense={true}
                  button={true}
                  divider={true}
                  onClick={() =>
                     goToLink(`/user/profile/${UniqueUsername}?tab=issues`)
                  }
               >
                  <ListItemIcon>
                     <BugReportOutlinedIcon className={classes.icons} />
                  </ListItemIcon>
                  <ListItemText
                     primary="Issues"
                     primaryTypographyProps={listTextProps}
                  />
               </ListItem>
               <ListItem
                  className={classes.listElement}
                  dense={true}
                  button={true}
                  divider={true}
                  onClick={() =>
                     goToLink(`/user/profile/${UniqueUsername}?tab=update`)
                  }
               >
                  <ListItemIcon>
                     <SettingsApplicationsOutlinedIcon
                        className={classes.icons}
                     />
                  </ListItemIcon>
                  <ListItemText
                     primary="Settings"
                     primaryTypographyProps={listTextProps}
                  />
               </ListItem>
               <ListItem
                  className={classes.listElement}
                  dense={true}
                  button={true}
                  divider={true}
                  onClick={handleLogout}
               >
                  <ListItemIcon>
                     <MeetingRoomIcon className={classes.icons} />
                  </ListItemIcon>
                  <ListItemText
                     primary="Logout"
                     primaryTypographyProps={listTextProps}
                  />
               </ListItem>
            </List>
         </div>
      </ClickAwayListener>
   ) : null;
}

export default UserDropDown;
