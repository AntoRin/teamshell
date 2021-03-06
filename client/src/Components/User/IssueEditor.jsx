import { useState, useRef } from "react";
import SunEditor from "suneditor-react";
import Button from "@material-ui/core/Button";
import AddBoxSharpIcon from "@material-ui/icons/AddBoxSharp";
import { makeStyles } from "@material-ui/core/styles";
import { issue_editor_config } from "../../config/editor_config";
import "../../styles/issue-editor.css";
import "suneditor/dist/css/suneditor.min.css";

const useStyles = makeStyles({
   root: {
      "& .MuiButton-label": {
         fontSize: "1.1rem",
         textTransform: "none",
         fontFamily: `"Quicksand", "sans-serif"`,
         fontWeight: 700,
      },
      position: "relative",
      left: "50%",
      transform: "translateX(-50%)",
      margin: "5px",
   },
});

function IssueEditor({ activeProject, User, done }) {
   const classes = useStyles();
   const [issueTitle, setIssueTitle] = useState("");

   const editorRef = useRef();

   function handleChange(event) {
      setIssueTitle(event.target.value);
   }

   async function handleIssueCreation(event) {
      event.preventDefault();

      if (!/.*\S.*/.test(editorRef.current.editor.getText().trim())) return;

      const userInActiveProject = User.Projects.find(project => project.ProjectName === activeProject);

      const Project_id = userInActiveProject._id;

      if (!Project_id) return;

      try {
         const IssueDescriptionRaw = editorRef.current.editor.core.getContents();

         const IssueDescription = editorRef.current.editor.util.HTMLEncoder(IssueDescriptionRaw);

         const body = {
            IssueTitle: issueTitle,
            IssueDescription,
            ProjectContext: activeProject,
            Project_id,
            Creator: {
               UniqueUsername: User.UniqueUsername,
               User_id: User._id,
            },
         };

         const postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         const newIssueSubmit = await fetch("/api/issue/create", postOptions);
         const newIssueResponse = await newIssueSubmit.json();

         if (newIssueResponse.status === "error") throw newIssueResponse.error;

         setIssueTitle("");
         editorRef.current.editor.core.setContents("");
         done();
      } catch (error) {
         console.log(error);
      }
   }

   return (
      <div className="issue-editor-container">
         <form onSubmit={handleIssueCreation} id="issueEditorForm" autoComplete="off">
            <div className="issue-title">
               <input value={issueTitle} onChange={handleChange} type="text" id="issueTitleInput" required placeholder="Issue Title" />
            </div>
            <div className="issue-body">
               <SunEditor ref={editorRef} setOptions={issue_editor_config.options} />
            </div>
            <Button
               type="submit"
               className={classes.root}
               size="medium"
               variant="contained"
               color="default"
               endIcon={<AddBoxSharpIcon fontSize="large" />}
            >
               Create
            </Button>
         </form>
      </div>
   );
}

export default IssueEditor;
