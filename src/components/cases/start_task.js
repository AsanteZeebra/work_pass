import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

const Start_task = () => {
  const [token] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
 
  const [task_ID, setTaskID] = useState("");
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
    const storedTaskID = localStorage.getItem("task_id");
    if (storedTaskID) {
      setTaskID(storedTaskID);
    } else {
      toast.error("Task ID not found");
    }
  }, []);

  // Fetch tasks
  useEffect(() => {
    if (task_ID) {
      setLoading(true);
      axios
        .post(
          `http://localhost/wp_api/tasks/find_task_id.php`,
          { task_id: task_ID },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.data && response.data.tasks) {
            setTasks(response.data.tasks);
            console.log("Tasks fetched successfully:", response.data.tasks);
          } else {
            console.error("No tasks found in response:", response.data);
            toast.error("No data found");
          }
          setLoading(false);
        })
        .catch((error) => {
          toast.error("Error fetching tasks");
          setLoading(false);
        });
    }
  }, [task_ID]);
  return (
    <>
      <div className="pagetitle">
        <h1>Tasks</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/dashboard">Tasks</Link>
            </li>
            <li className="breadcrumb-item active">start_task</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center">
                <ClipLoader color="#36d7b7" loading={loading} size={50} />
              </div>
            ) : tasks.length > 0 ? (
              <>
                <div className="row mt-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="col-md-12">
                      <div className="card recent-sales overflow-auto h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <span>
                            <strong>Task ID: {task.task_id}</strong>
                          </span>
                        </div>
                        <div className="card-body">
                          <h5 className="card-title">{task.task_name}</h5>
                          <div>{task.description}</div>
                          <div>{task.details}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="col-12">
                  <div className="card recent-sales overflow-auto">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span>
                        <strong>Submit proof for completion</strong>
                      </span>
                    </div>
                    <div className="card-body">
                      <form>
                        <div className="mb-3">
                          <label htmlFor="proof" className="form-label">
                            Upload Proof
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            id="proof"
                            name="proof"
                            accept=".jpg,.jpeg,.png,.pdf"
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="comments" className="form-label">
                            Comments
                          </label>
                          <textarea
                            className="form-control"
                            id="comments"
                            name="comments"
                            rows="3"
                          ></textarea>
                        </div>
                      </form>

                      <div className="card-footer text-end">
                        <button className="btn btn-success">
                          Submit for approval
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-12">
                <p>No tasks available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Start_task;