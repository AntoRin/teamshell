import { useHistory } from "react-router-dom";
import "../../styles/landing-card.css";

function LandingCard() {
   const history = useHistory();
   return (
      <div className="landing-page-main">
         <div className="action-card">
            <header>
               <h1>Keep Track of All Your Issues and Bugs</h1>
            </header>
            <div className="action-link">
               <button
                  id="landingCardBtn"
                  onClick={() => history.push("/register")}
               >
                  REGISTER
               </button>
            </div>
         </div>
      </div>
   );
}

export default LandingCard;
