import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5"; // DataTables Buttons with Bootstrap styling
import "datatables.net-buttons/js/dataTables.buttons"; // Core buttons feature
import "datatables.net-buttons/js/buttons.html5"; // Export buttons (CSV, Excel, PDF)
import "datatables.net-buttons/js/buttons.print"; // Print button
import "jszip"; // Required for Excel export
import "pdfmake"; // Required for PDF export
import "pdfmake/build/vfs_fonts"; // PDF fonts
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CSS Imports
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

const Tasks = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [task, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Add this line

  const handleLogout = useCallback(() => {
    setToken(null); // Set token state to null
    localStorage.clear(); // Clear all items from localStorage
    navigate("/login"); // Redirect to login page
  }, [navigate]); // Dependency ensures it doesn't change on every render

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const response = await axios.post(
          "http://localhost/wp_api/authentication/verify_token.php",
          {}, // Empty body since it's a POST request
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Token is valid:", response.data);
      } catch (error) {
        console.error("Token validation error:", error);
        toast.error("Token validation error");
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
        toast.error("Error decoding token");
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate, handleLogout]); // Now handleLogout is included

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost/wp_api/tasks/fetch_tasks.php")
      .then((response) => {
        setTasks(response.data.task || []); // Ensure tasks is an array
        setLoading(false);

        // Initialize DataTable after data is fetched
        $("#myTable").DataTable({
          responsive: true,
          lengthMenu: [5, 10, 25, 50],
          pageLength: 10,
          paging: true,
          searching: true,
          destroy: true,
          dom: "Bfrtip",
          buttons: [
            {
              extend: "csv",
              text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
              className: "btn btn-light",
            },
            {
              extend: "pdf",
              text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
              className: "btn btn-light",
            },
            {
              extend: "print",
              text: '<i class="bi bi-printer"></i> Print',
              className: "btn btn-light",
              customize: function (win) {
                $(win.document.body)
                  .find("table")
                  .addClass("display")
                  .css("font-size", "9pt");
                $(win.document.body).find("h1").css("text-align", "center");
                $(win.document.head).append(
                  '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.1.3/css/bootstrap.min.css" type="text/css" />'
                );
              },
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users");
        setLoading(false);
      });

    // Cleanup DataTable on component unmount
    return () => {
      if ($.fn.DataTable.isDataTable("#myTable")) {
        $("#myTable").DataTable().destroy();
      }
    };
  }, []);

  const handledata = (employee_id) => {
    localStorage.setItem("emp_id", employee_id);
  };

  const [error, setError] = useState("");
  const [countData, SetCountData] = useState(null);
  const [PercentageData, SetPercentageData] = useState(null);

  useEffect(() => {
    fetchcount();
    fecthPercentage(); // Fetch percentage data on component mount
  }, []); // Fetch count data on component mount

  useEffect(() => {
    fecthPercentage();
  }, []);

  const fecthPercentage = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/tasks/task_percentage.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        SetPercentageData({
          Total: response.data.percentage_changes?.total_tasks || 0,
          Pending: response.data.percentage_changes?.pending_tasks || 0,
          Complete: response.data.percentage_changes?.completed_tasks || 0,
          Stuck: response.data.percentage_changes?.stuck_tasks || 0,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching percentage data:", error);
      setError("Error fetching percentage data. Please try again.", error);
    }
  };

  const fetchcount = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/tasks/count_tasks.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        SetCountData({
          total_task: response.data.all_tasks,
          total_pending: response.data.Pending_tasks,
          total_complete: response.data.Complete_tasks,
          total_stuck: response.data.Stuck_tasks,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case data. Please try again.");
    }
  };

  return (
    <>
      <div className="pagetitle">
        <h1>Tasks</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">dashbaord</a>
            </li>
            <li className="breadcrumb-item active">tasks</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        {/* Card 1: Total Paid */}
        <div className="col-xxl-3 col-md-6">
          <div className="card info-card sales-card">
            <div className="card-body">
              <h5 className="card-title">
                Total Task <span>| This Month</span>
              </h5>

              <div className="d-flex align-items-center">
                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-arrow-up-circle"></i>
                </div>
                <div className="ps-3">
                  {/* Display total paid count and percentage change */}
                  {countData ? (
                    <h6>{countData.total_task}</h6>
                  ) : (
                    <p>No case data available.</p>
                  )}
                  {PercentageData && PercentageData.Total !== undefined ? (
                    <span className="text-success small pt-1 fw-bold">
                      {PercentageData.Total}%
                    </span>
                  ) : (
                    <p>No percentage data available.</p>
                  )}

                  {PercentageData && PercentageData.Total > 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-up-right-square"
                        style={{ color: "#269746" }}
                      ></i>
                    </span>
                  ) : PercentageData && PercentageData.Total < 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-down-right-square"
                        style={{ color: "red" }}
                      ></i>
                    </span>
                  ) : (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-dash-square"
                        style={{ color: "gray" }}
                      ></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Pending to pay */}
        <div className="col-xxl-3 col-md-6">
          <div className="card info-card sales-card">
            <div className="card-body">
              <h5 className="card-title">
                Pending <span>| This Month</span>
              </h5>

              <div className="d-flex align-items-center">
                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-arrow-clockwise"></i>
                </div>
                <div className="ps-3">
                  {countData ? (
                    <h6>{countData.total_pending}</h6>
                  ) : (
                    <p>No case data available.</p>
                  )}

                  {PercentageData && PercentageData.Pending !== undefined ? (
                    <span className="text-success small pt-1 fw-bold">
                      {PercentageData.Pending}%
                    </span>
                  ) : (
                    <p>No percentage data available.</p>
                  )}

                  {PercentageData && PercentageData.Pending > 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-up-right-square"
                        style={{ color: "#269746" }}
                      ></i>
                    </span>
                  ) : PercentageData && PercentageData.Pending < 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-down-right-square"
                        style={{ color: "red" }}
                      ></i>
                    </span>
                  ) : (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-dash-square"
                        style={{ color: "gray" }}
                      ></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Employees */}
        <div className="col-xxl-3 col-md-6">
          <div className="card info-card sales-card">
            <div className="card-body">
              <h5 className="card-title">
                Completed <span>| This Month</span>
              </h5>

              <div className="d-flex align-items-center">
                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="ps-3">
                  {countData ? (
                    <h6>{countData.total_complete}</h6>
                  ) : (
                    <p>No case data available.</p>
                  )}

                  {PercentageData && PercentageData.Complete !== undefined ? (
                    <span className="text-success small pt-1 fw-bold">
                      {PercentageData.Total}%
                    </span>
                  ) : (
                    <p>No percentage data available.</p>
                  )}

                  {PercentageData && PercentageData.Complete > 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-up-right-square"
                        style={{ color: "#269746" }}
                      ></i>
                    </span>
                  ) : PercentageData && PercentageData.Complete < 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-down-right-square"
                        style={{ color: "red" }}
                      ></i>
                    </span>
                  ) : (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-dash-square"
                        style={{ color: "gray" }}
                      ></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Benefits */}
        <div className="col-xxl-3 col-md-6">
          <div className="card info-card sales-card">
            <div className="card-body">
              <h5 className="card-title">
                Stuck <span>| This Month</span>
              </h5>

              <div className="d-flex align-items-center">
                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-hourglass"></i>
                </div>
                <div className="ps-3">
                  {countData ? (
                    <h6>{countData.total_stuck}</h6>
                  ) : (
                    <p>No task data available.</p>
                  )}

                  {PercentageData && PercentageData.Stuck !== undefined ? (
                    <span className="text-success small pt-1 fw-bold">
                      {PercentageData.Stuck}%
                    </span>
                  ) : (
                    <p>No percentage data available.</p>
                  )}

                  {PercentageData && PercentageData.Stuck > 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-up-right-square"
                        style={{ color: "#269746" }}
                      ></i>
                    </span>
                  ) : PercentageData && PercentageData.Stuck < 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-down-right-square"
                        style={{ color: "red" }}
                      ></i>
                    </span>
                  ) : (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-dash-square"
                        style={{ color: "gray" }}
                      ></i>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-12">
          <div className="row">
            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="card-body">
                  <h5 className="card-title">Task List</h5>

                  {/* Modal */}
                  <div className="modal fade" id="taskmd" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-md">
                      <div className="modal-content">
                        <div className="modal-header">
                          {selectedTask?(
                        <h5 className="modal-title">Assigned to: {selectedTask.assigned_to}</h5>
                          
                           ) : (
                            <p>No task selected.</p>
                          )}
                          
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          {selectedTask ? (
                            <div>
                              <h6>{selectedTask.task_name}</h6>
                              <p><b>Assigned to:</b> {selectedTask.assigned_to}</p>
                              <p>
                                <b>Due date: {selectedTask.deadline}</b>
                              </p>
                              <p><b>Assigned date:</b> {selectedTask.created_at}</p>
                              <p><b>Last updated:</b> {selectedTask.updated_at}</p>
                              <p><b>Description:</b> {selectedTask.description}</p>
                              <span
                                className={`badge ${
                                  selectedTask.status === "Comlete"
                                    ? "bg-success"
                                    : selectedTask.status === "Pending" ||
                                      selectedTask.status === "Stuck"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {selectedTask.status}
                              </span>
                            </div>
                          ) : (
                            <p>No task selected.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <table className="table table-hover datatable" id="myTable">
                      <thead>
                        <tr>
                          <th>Tittle</th>
                          <th>Assigned_to</th>
                          <th>Due date</th>
                          <th>Assigned_date</th>
                          <th>Last Updated</th>
                          <th>Status</th>
                          <th>
                            <li className="bi bi-list"></li>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {task && task.length > 0 ? (
                          task.map((task) => (
                            <tr key={task.task_name}>
                              <td>{task.task_name}</td>
                              <td>{task.assigned_to}</td>
                              <td>{task.deadline}</td>
                              <td>{task.created_at}</td>
                              <td>{task.updated_at}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    task.status === "Comlete"
                                      ? "bg-success"
                                      : task.status === "Pending" ||
                                        task.status === "Stuck"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  data-bs-toggle="modal"
                                  data-bs-target="#taskmd"
                                  onClick={() => setSelectedTask(task)} // Set selected task here
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              No users found!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
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

export default Tasks;
