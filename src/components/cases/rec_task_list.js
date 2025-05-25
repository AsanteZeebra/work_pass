import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

const Rec_task_list = ({ onChange }) => {
  const [token] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

   const [taskData,setTaskData]=useState(null);

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

    const Fetch_Task = async () => {
    try {
      const response = await axios.post("http://localhost/wp_api/Clients/fetch_customer_info.php",
       
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.status === "success") {
        setTaskData(response.data.case);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case details. Please try again.");
    }
  };
  
  return (
    <>
      <div className="pagetitle">
        <h1>Tasks</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/dashboard">Tasks</Link>
            </li>
            <li className="breadcrumb-item active">task_list</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-4">
              <div className="card recent-sales overflow-auto">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span><strong>Task: Candidates Registration</strong></span>
                  <span className="badge bg-danger">Pending</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title">Card with header and footer</h5>
                  Ut in ea error laudantium quas omnis officia. Sit sed praesentium voluptas. Corrupti inventore consequatur nisi necessitatibus modi consequuntur soluta id. Enim autem est esse natus assumenda. Non sunt dignissimos officiis expedita. Consequatur sint repellendus voluptas.
                 
                </div>
                <div className="card-footer text-end">
                <div className="d-flex justify-content-end mt-3">
                    <Link to="/start_task" className="btn btn-success w-100">Start Task</Link>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Rec_task_list;