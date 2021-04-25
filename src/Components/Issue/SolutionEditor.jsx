import { useRef } from "react";
import SunEditor from "suneditor-react";
import { solution_editor_config } from "../../config/editor_config";
import "suneditor/dist/css/suneditor.min.css";
import "../../styles/solution-editor.css";

function SolutionCard({ issueDetails, User }) {
   const editorRef = useRef();

   async function handleNewComment(event) {
      event.preventDefault();

      let solutionPlainText = editorRef.current.editor.core.getContents();

      let solutionEncoded = editorRef.current.editor.util.HTMLEncoder(
         solutionPlainText
      );

      let body = {
         Issue_id: issueDetails._id,
         Project_id: issueDetails.Project_id,
         SolutionBody: solutionEncoded,
         SolutionBy: User.UniqueUsername,
      };

      let postOptions = {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(body),
         credentials: "include",
      };

      let newSolution = await fetch(
         "http://localhost:5000/issue/solution/create",
         postOptions
      );
      let solutionStatus = await newSolution.json();
      console.log(solutionStatus);
   }

   return (
      <div className="solution-editor-container">
         <form onSubmit={handleNewComment} id="solutionForm">
            <SunEditor
               ref={editorRef}
               setOptions={solution_editor_config.options}
            />
            <div className="solution-submit-btn">
               <button
                  type="submit"
                  className="form-action-btn bright btn-long"
               >
                  Submit
               </button>
            </div>
         </form>
      </div>
   );
}

export default SolutionCard;