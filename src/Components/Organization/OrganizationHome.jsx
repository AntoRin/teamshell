import { useState, useEffect } from "react";
import GlobalNav from "../GlobalNav";
import OrgSideNav from "./OrgSideNav";
import DetailCard from "../User/DetailCard";
import "../../organization-home.css";

function OrganizationHome({ match, User }) {
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [Organization, setOrganization] = useState({});
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function getOrgData() {
         let orgRequest = await fetch(
            `http://localhost:5000/organization/details/${match.params.OrganizationName}`,
            {
               credentials: "include",
            }
         );

         let orgResponse = await orgRequest.json();
         console.log(orgResponse);

         if (orgResponse.status === "ok") {
            setIsAuthorized(true);
            setOrganization(orgResponse.Organization);
            setIsLoading(false);
         } else {
            setIsAuthorized(false);
            setOrganization({});
            setIsLoading(false);
         }
      }

      getOrgData();
   }, [match.params.OrganizationName]);

   if (isLoading) {
      return <h1>Loading...</h1>;
   } else {
      return isAuthorized ? (
         <div className="organization-home-container">
            <GlobalNav
               profileImage={User.ProfileImage}
               UniqueUsername={User.UniqueUsername}
            />
            <div className="org-main-wrapper">
               <OrgSideNav Organization={Organization} />
               <div className="org-page-body">
                  <div className="org-general-details-card">
                     <header className="org-details-header">
                        <h1>{Organization.OrganizationName}</h1>
                     </header>
                     <div className="org-details-content">
                        <DetailCard
                           header="Description"
                           detail={Organization.Description}
                        />
                        <DetailCard
                           header="Created By"
                           detail={Organization.Creator}
                        />
                        <DetailCard
                           header="No. of Projects"
                           detail={Organization.Projects.length}
                        />
                        <DetailCard
                           header="No. of Members"
                           detail={Organization.Members.length}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      ) : (
         <h1>You're not authorized to view this page</h1>
      );
   }
}

export default OrganizationHome;
