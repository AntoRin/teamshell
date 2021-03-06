import { useState, useContext } from "react";
import { useHistory, Link } from "react-router-dom";
import GitHubIcon from "@material-ui/icons/GitHub";
import GTranslateIcon from "@material-ui/icons/GTranslate";
import HomeIcon from "@material-ui/icons/Home";
import { GlobalActionStatus } from "../App";
import CenteredLoader from "../UtilityComponents/CenteredLoader";
import "../../styles/register-login.css";

function Login() {
   const [inputs, setInputs] = useState({
      userId: "",
      password: "",
   });
   const [isLoading, setIsLoading] = useState(false);

   const setActionStatus = useContext(GlobalActionStatus);

   const history = useHistory();

   function handleChange(event) {
      setInputs({
         ...inputs,
         [event.target.id]: event.target.value,
      });
   }

   async function handleGithubLogin() {
      if (process.env.NODE_ENV === "production")
         window.location.pathname = "/api/auth/login/github";
      else window.location.href = "http://localhost:5000/api/auth/login/github";
   }

   async function handleGoogleLogin() {
      if (process.env.NODE_ENV === "production")
         window.location.pathname = "/api/auth/login/google";
      else window.location.href = "http://localhost:5000/api/auth/login/google";
   }

   async function handleLogin(event) {
      event.preventDefault();
      if (isLoading) return;

      try {
         setIsLoading(true);

         let body = {
            Email: inputs.userId,
            Password: inputs.password,
         };

         let postOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         };

         let loginResponseStream = await fetch("/api/auth/login", postOptions);
         let responseData = await loginResponseStream.json();

         if (responseData.status === "error") throw responseData.error;

         setIsLoading(false);
         return history.replace("/user/home");
      } catch (error) {
         setActionStatus({ info: error, type: "error" });
         setIsLoading(false);
      }
   }

   return (
      <div className="form-container">
         {isLoading && <CenteredLoader />}
         <div className="form-card">
            <form onSubmit={handleLogin} id="userDetailsForm">
               <div className="form-elements">
                  <header className="form-header">Login</header>
                  <div className="email-field">
                     <input
                        onChange={handleChange}
                        value={inputs.userId}
                        placeholder="Email"
                        type="text"
                        id="userId"
                        required
                     />
                  </div>
                  <div className="password-field">
                     <input
                        onChange={handleChange}
                        value={inputs.password}
                        placeholder="Password"
                        autoComplete="off"
                        type="password"
                        id="password"
                        required
                     />
                  </div>
                  <div className="form-submit">
                     <button id="submitBtn" type="submit">
                        Continue
                     </button>
                  </div>
                  <div className="entry-redirect">
                     <span>
                        <p>Not registered?</p>
                     </span>
                     <span>
                        <Link to="/register">Register</Link>
                     </span>
                  </div>
               </div>
            </form>
            <div className="github-login">
               <GitHubIcon onClick={handleGithubLogin} fontSize="large" />
               <GTranslateIcon onClick={handleGoogleLogin} fontSize="large" />
            </div>
         </div>
         <div onClick={() => history.push("/")} className="home-redirect">
            <HomeIcon />
         </div>
      </div>
   );
}

export default Login;
