import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import TimeAgo from "react-timeago";

const Assigned_task = (comment) => {
  const [token] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [assigned_to, setAssignedto] = useState("");
  const [tasks, setTasks] = useState([]);
  // Memoize handleLogout to prevent re-creation
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

 

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        await axios.post(
          "http://localhost/wp_api/authentication/verify_token.php",
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        toast.error("Unauthorized");
        handleLogout();
      }
    };

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          handleLogout();
        } else {
          const timeout = (decodedToken.exp - currentTime) * 1000;
          const logoutTimer = setTimeout(() => {
            handleLogout();
          }, timeout);
          verifyToken(token);
          return () => clearTimeout(logoutTimer);
        }
      } catch (error) {
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate, handleLogout]);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setAssignedto(storedName);
    } else {
      toast.error("Username not found");
    }
  }, []);

  // Fetch tasks
  useEffect(() => {
    if (assigned_to) {
      setLoading(true);
      axios
        .post(
          `http://localhost/wp_api/cases/fetch_case_byname.php`,
          { assigned_to: assigned_to },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.data && response.data.cases) {
            setTasks(response.data.cases);
            console.log("cases fetched successfully:", response.data.cases);
          } else {
            console.error("No tasks found in response:", response.data);
            toast.error("No data found",response.data);
          }
          setLoading(false);
        })
        .catch((error) => {
          toast.error("Error fetching tasks");
          setLoading(false);
        });
    }
  }, [assigned_to]);

  
  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Assigned Cases</h5>

          <div className="list-group scrollable">
            {loading ? (
              <div className="col-12 text-center">
                <ClipLoader color="#36d7b7" loading={loading} size={50} />
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Link
                  key={index}
                  to="#"
                  className="list-group-item list-group-item-action "
                  aria-current="true"
                >
                  <div className="d-flex w-100 justify-content-between">
                   <b> <h5 className="mb-1">{task.customer_name}</h5></b>
                    <small className="text-muted">
                     Case Created_at: <TimeAgo date={task.date_created} />
                    </small>
                  </div>
                  <p className="mb-1">{task.country}{" "}{task.application_type}</p>
                  <small>Latest Update: {task.message}{" - "} <TimeAgo date={task.date_updated} />. </small>
                </Link>
              ))
            ) : (
              <div className="col-12">
                <p className="text-muted"><i className="bi bi-exclamation-triangle"></i> No Cases Assigned to you</p>
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Assigned_task;