import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment/moment";

const ActivityLogs = ({timestamp }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [now, setNow] = React.useState(moment());

  // Memoize handleLogout to prevent re-creation
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.removeItem("username"); // Remove username from localStorage
    localStorage.clear();
    navigate("/login"); // Redirect to login page
  }, [navigate]); // Dependency ensures it doesn't change on every render

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const response = await axios.post(
          "http://main.fremikeconsult.com/wp_api/authentication/verify_token.php",
          {}, // Empty body since it's a POST request
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        //console.log("Token is valid:", response.data);
      } catch (error) {
        //console.error("Token validation error:", error);
        toast.success("Unauthorized", error);
        handleLogout();
      }
    };

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds

        if (decodedToken.exp < currentTime) {
          handleLogout();
        } else {
          const timeout = (decodedToken.exp - currentTime) * 1000; // Convert to milliseconds
          const logoutTimer = setTimeout(() => {
            handleLogout();
          }, timeout);

          // Call verifyToken before returning
          verifyToken(token);

          // Cleanup the timer when the component unmounts
          return () => clearTimeout(logoutTimer);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate, handleLogout]); // Now handleLogout is included

  React.useEffect(() => {
    const interval = setInterval(() => setNow(moment()), 60000); // update every 1 min
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="pagetitle">
        <h1>Cases</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Cases</a>
            </li>
            <li className="breadcrumb-item active">activity_logs</li>
          </ol>
        </nav>
      </div>
      <div className="row">

  <div className="col-lg-4">
<div className="card">
  <div className="card-body">
    <h5 className="card-title">Activity Logs</h5>

   

    </div>
    </div>
  </div>
  <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="bi bi-arrow-bar-right fs-3"></i>
                  Primary Block Quotes
                </h3>
              </div>
              
              <div className="card-body">
                <blockquote>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
                  <footer>Someone famous in <cite title="Source Title">Source Title</cite></footer>
                </blockquote>
              </div>
             
            </div>
            
          </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ActivityLogs;
