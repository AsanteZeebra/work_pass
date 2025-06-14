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
  const [employee_Name, setEmployeeName] = useState("");
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
    const storedEmployeeName = localStorage.getItem("username");
    if (storedEmployeeName) {
      setEmployeeName(storedEmployeeName);
    } else {
      toast.error("Employee not found");
    }
  }, []);

  // Fetch tasks
  useEffect(() => {
    if (employee_Name) {
      setLoading(true);
      axios
        .post(
          `http://localhost/wp_api/tasks/find_task.php`,
          { assigned_to: employee_Name },
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
  }, [employee_Name]);

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
        {loading ? (
          <div className="col-12 text-center">
            <ClipLoader color="#36d7b7" loading={loading} size={50} />
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div className="card overflow-auto h-80">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>
                    <strong>Task: {task.task_name}</strong>
                  </span>
                  <span
                    className={`badge ${
                      task.status === "Completed" ? "bg-success" : "bg-warning"
                    }`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`badge ${
                      task.urgent === "Very Urgent" ? "bg-danger" : "bg-primary"
                    }`}
                  >
                    {task.urgent}
                  </span>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{task.description}</h5>
                  <p>{task.details}</p>
                </div>
                <div className="card-footer text-end">
                  <div className="d-flex justify-content-end mt-3">
                    <Link
                      to="/start_task"
                      className="btn btn-success w-100"
                      onClick={() => localStorage.setItem("task_id", task.task_id)}
                    >
                      Start Task
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p>No tasks available</p>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default Rec_task_list;