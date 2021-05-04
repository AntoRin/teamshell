import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NotificationsIcon from "@material-ui/icons/Notifications";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import { ClickAwayListener } from "@material-ui/core";
import Notifications from "./Notifications";
import UserDropDown from "./UserDropDown";
import "../../styles/global-nav.css";

function GlobalNav({ ProfileImage, UniqueUsername }) {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const [activeNotifications, setActiveNotifications] = useState(false);
   const [textSearch, setTextSearch] = useState("");
   const [searchResults, setSearchResults] = useState([]);

   const NotifyIcon = activeNotifications
      ? NotificationsActiveIcon
      : NotificationsIcon;

   useEffect(() => {
      if (!activeNotifications || !isNotificationsOpen) return;

      let abortFetch = new AbortController();

      async function changeNotificationSeenStatus() {
         let responseStream = await fetch("/profile/notifications/seen", {
            credentials: "include",
            signal: abortFetch.signal,
         });

         let responseData = await responseStream.json();
         console.log(responseData);
      }

      changeNotificationSeenStatus();

      return () => abortFetch.abort();
   }, [isNotificationsOpen, activeNotifications]);

   useEffect(() => {
      if (!textSearch) return;

      async function getSearchResults() {
         let query = textSearch;
         let searchStream = await fetch(`/profile/search?user=${query}`, {
            credentials: "include",
         });
         let resultData = await searchStream.json();

         resultData.data
            ? setSearchResults(resultData.data)
            : setSearchResults([]);
      }

      getSearchResults();
   }, [textSearch]);

   function openDropdown() {
      setIsDropdownOpen(prev => !prev);
   }

   function toggleNotifications() {
      setIsNotificationsOpen(prev => !prev);
   }

   function handleSearchChange(event) {
      setTextSearch(event.target.value);
   }

   function closeSearchResults() {
      setSearchResults([]);
   }

   return (
      <nav className="global-nav-container">
         <div className="nav-wrapper">
            <div className="general-nav-section">
               <div className="nav-logo">
                  <Link to="/user/home">{`<CoLab />`}</Link>
               </div>
            </div>
            <div className="user-section">
               <div className="user-links-section">
                  <Link to="/user/environment">Your Environment</Link>
               </div>
               <div className="notifications-section">
                  <NotifyIcon
                     className="notification-icon"
                     onClick={toggleNotifications}
                  />
                  <Notifications
                     setActiveNotifications={setActiveNotifications}
                     isNotificationsOpen={isNotificationsOpen}
                     setIsNotificationsOpen={setIsNotificationsOpen}
                  />
               </div>
               <div className="profile-section">
                  <img
                     onClick={openDropdown}
                     id="userProfileImage"
                     src={ProfileImage}
                     alt=""
                  />
                  <div className="user-drop-down">
                     <UserDropDown
                        id="userProfileDropDown"
                        UniqueUsername={UniqueUsername}
                        isOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                     />
                  </div>
               </div>
            </div>
         </div>
         <ClickAwayListener onClickAway={closeSearchResults}>
            <div className="text-search">
               <input
                  type="text"
                  className="search-bar"
                  placeholder="In your organization..."
                  value={textSearch}
                  onChange={handleSearchChange}
               />
               {searchResults.length > 0 && (
                  <div className="search-results-list">
                     {searchResults.map(result => {
                        return (
                           <div key={result} className="search-list-element">
                              {result}
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         </ClickAwayListener>
      </nav>
   );
}

export default GlobalNav;