import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import $, { data } from "jquery";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5"; // DataTables Buttons with Bootstrap styling
import "datatables.net-buttons/js/dataTables.buttons"; // Core buttons feature
import "datatables.net-buttons/js/buttons.html5"; // Export buttons (CSV, Excel, PDF)
import "datatables.net-buttons/js/buttons.print"; // Print button
import "jszip"; // Required for Excel export
import "pdfmake"; // Required for PDF export
import "pdfmake/build/vfs_fonts"; // PDF fonts

// CSS Imports
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

const Account_Settings = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    setToken(null); // Set token state to null
    localStorage.clear(); // Clear all items from localStorage
    navigate("/login"); // Redirect to login page
  }, [navigate]); // Dependency ensures it doesn't change on every render

  useEffect(() => {
    const validate = async () => {
      if (!token) return;
      try {
        await axios.get("http://localhost:8000/api/user", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // Token is valid
        console.log("Token is valid.");
      } catch (error) {
        toast.error("Unauthorized Token.");
        console.error("Token validation failed:", error);
        handleLogout(); // Optionally handle logout
      }
    };

    validate();
  }, [token, handleLogout]);
  const timer = useRef(null);
  const timeoutDuration = 30 * 60 * 1000; // 30 minutes

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!token) return;

    timer.current = setTimeout(() => {
      //console.log("Logged out due to inactivity");
      handleLogout();
    }, timeoutDuration);
  };

  useEffect(() => {
    if (!token) return;

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer initially

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:8000/api/fetch-users", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data.users);
        setLoading(false);
        // Initialize DataTable after data is fetched
        if ($.fn.DataTable.isDataTable("#myTable")) {
          $("#myTable").DataTable().destroy();
        }
        $("#myTable").DataTable({
          responsive: true,
          lengthMenu: [5, 10, 25, 50],
          pageLength: 10,
          paging: true,
          dom: "Bfrtip", // Enables Buttons
          buttons: [
            {
              extend: "csv",
              text: '<i class="bi bi-file-earmark-spreadsheet"></i> CSV',
              className: "btn btn-light",
            },
            {
              extend: "excel",
              text: '<i class="bi bi-file-earmark-excel"></i> Excel',
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
  }, [token]);

  

  const handleViewProfile = (uid, email) => {
    localStorage.setItem("uid", uid);
    localStorage.setItem("email", email);
  };

  return (
    <>
      <ToastContainer />
      <div className="pagetitle">
        <h1>Account</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Account</a>
            </li>
            <li className="breadcrumb-item active">Settings</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-xxl-3" hidden>
              <div className="card info-card sales-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Users <span>| All</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-check2-circle"></i>
                    </div>
                    <div className="ps-3">
                      <h6>145</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3" hidden>
              <div className="card info-card revenue-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Online <span>| All</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div className="ps-3">
                      <h6>264</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3" hidden>
              <div className="card info-card suspect-card .card-icon ">
                <div className="card-body">
                  <h5 className="card-title">
                    Suspended <span>| This Month</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-pause-circle"></i>
                    </div>
                    <div className="ps-3">
                      <h6>3,264</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3" hidden>
              <div className="card info-card banned-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Banned <span>| This Year</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-x-circle"></i>
                    </div>
                    <div className="ps-3">
                      <h6>15</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="card-body">
                  <h5 className="card-title">
                    User & Roles <span>| list</span>
                  </h5>
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
                          <th>ID</th>
                          <th>Fullname</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>
                            <i className="bi bi-menu"></i>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user.uid}>
                              <td>{user.uid}</td>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.role}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    user.status === "Active"
                                      ? "bg-success"
                                      : "bg-danger"
                                  }`}
                                >
                                  {user.status}
                                </span>
                              </td>
                              <td>
                                <div className="dropdown">
                                  <i
                                    className="bi bi-three-dots-vertical"
                                    id={`dropdownMenuButton${user.uid}`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ cursor: "pointer" }}
                                  ></i>
                                  <ul
                                    className="dropdown-menu"
                                    aria-labelledby={`dropdownMenuButton${user.uid}`}
                                  >
                                    <li>
                                      <Link
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleViewProfile(
                                            user.uid,
                                            user.email
                                          )
                                        }
                                        data-bs-toggle="modal"
                                        data-bs-target="#vvt"
                                      >
                                        Settings
                                      </Link>
                                    </li>

                                    <li>
                                      <Link
                                        to={`/users_profile`}
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleViewProfile(
                                            user.uid,
                                            user.email
                                          )
                                        }
                                      >
                                        View profile
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center">
                              No users found!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  <div className="modal fade" id="vvt" tabindex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Change Role</h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          <form>
                            <div className="row mb-3">
                              <div className="col-12">
                                <div className="form-group">
                                  <b>
                                    <label> Role</label>
                                  </b>
                                  <select className="form-select">
                                    <option>-Select-</option>
                                    <option value={"Admin"}>Admin</option>
                                    <option value={"Account"}>Account</option>
                                    <option value={"Reception"}>Reception</option>
                                    <option value={"Manager"}>Manager</option>
                                  </select>
                                </div>
                              </div>

                              <div className="col-12" style={{ marginTop: "20px" }}>
                                <div className="form-group">
                                  <b>
                                    <label> Status</label>
                                  </b>
                                  <select className="form-select">
                                    <option>-Select-</option>
                                    <option value={"Active"}>Activate</option>
                                    <option value={"Suspended"}>Suspend</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                          >
                            Close
                          </button>
                          <button type="button" className="btn btn-primary">
                            Save changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account_Settings;
