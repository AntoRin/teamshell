import { useState } from "react";
import CloseIcon from "@material-ui/icons/Close";
import "../../org-settings-modal.css";

function OrgSettingsModal({ Organization, setIsSettingsOpen }) {
   const [newDescription, setNewDescription] = useState("");

   function closeSettingsModal() {
      setIsSettingsOpen(false);
   }

   function handleDescriptionChange(event) {
      setNewDescription(event.target.value);
   }

   async function updateOrgSettings(event) {
      event.preventDefault();

      let body = {
         Org: Organization.OrganizationName,
         Description: newDescription,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let updateRequest = await fetch(
         "http://localhost:5000/organization/edit",
         postOptions
      );
      let updateResponse = await updateRequest.json();
      if (updateResponse.status === "ok") window.location.reload();
   }

   return (
      <div className="settings-modal-container">
         <div className="org-settings-card">
            <div className="settings-elements-wrapper">
               <div className="org-settings-form">
                  <h2>Basic Settings</h2>
                  <form onSubmit={updateOrgSettings}>
                     <textarea
                        onChange={handleDescriptionChange}
                        value={newDescription}
                        className="org-modal-textfield"
                        type="text"
                        placeholder="Change Description"
                        rows="5"
                        required
                     ></textarea>
                     <br />
                     <button className="form-action-btn bright" type="submit">
                        Update
                     </button>
                  </form>
               </div>
               <h2>Advanced Settings</h2>
               <div className="org-creator-settings">
                  <div className="add-user-setting">
                     <button className="settings-btn" type="button">
                        Add a User
                     </button>
                  </div>
                  <div className="create-project-setting">
                     <button className="settings-btn" type="button">
                        Create a Project
                     </button>
                  </div>
               </div>
            </div>
         </div>
         <CloseIcon
            fontSize="large"
            onClick={closeSettingsModal}
            className="modal-close-btn"
         />
      </div>
   );
}

export default OrgSettingsModal;
