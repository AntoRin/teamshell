import { Link } from "react-router-dom";
import AddBoxIcon from "@material-ui/icons/AddBox";
import GlobalNav from "../GlobalNav";
import "../../user-home.css";

function UserHome({ User }) {
   return (
      <div className="home-container">
         <GlobalNav
            profileImage={User.ProfileImage}
            UniqueUsername={User.UniqueUsername}
         />
         <div className="home-main">
            <div className="user-details">
               <div className="details-section">
                  <h3 className="member-list-header">Organizations</h3>
                  {User.Organizations.map((org, index) => {
                     return (
                        <div className="member-list-item" key={index}>
                           {org}
                        </div>
                     );
                  })}
                  <div className="create-org-btn">
                     <button className="create-btn">
                        <span>New Organization</span>
                        <AddBoxIcon />
                     </button>
                  </div>
               </div>
               <div className="details-section">
                  <h3 className="member-list-header">Projects</h3>
                  {User.Projects.map((project, index) => {
                     return (
                        <div className="member-list-item" key={index}>
                           {project}
                        </div>
                     );
                  })}
                  <div className="create-org-btn">
                     <button className="create-btn">
                        <span>New Project</span>
                        <AddBoxIcon />
                     </button>
                  </div>
               </div>
            </div>
            <div className="home-workspace">
               <h1 style={{ color: "gray" }}>No work progress to show😴</h1>
            </div>
            <div className="side-info">
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/docs">
                     Docs
                  </Link>
               </div>
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/api">
                     API
                  </Link>
               </div>
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/help">
                     Help
                  </Link>
               </div>
               <div className="aside-help-links">
                  <Link className="stripped-down-link" to="/explore">
                     Explore
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}

export default UserHome;
