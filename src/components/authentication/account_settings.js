import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import {jwtDecode} from "jwt-decode";
import axios from 'axios';
import $ from "jquery";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    navigate('/login'); // Redirect to login page
  }, [navigate]); // Dependency ensures it doesn't change on every render

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const response = await axios.post(
          'http://localhost/wp_api/authentication/verify_token.php',
          {}, // Empty body since it's a POST request
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        console.log('Token is valid:', response.data);
        
      } catch (error) {
        console.error('Token validation error:', error);
        toast.error('Token validation error');
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
        console.error('Error decoding token:', error);
        toast.error('Error decoding token');
        handleLogout();
      }
    } else {
      navigate('/login');
    }
  }, [token, navigate, handleLogout]); // Now handleLogout is included

  useEffect(() => {
    axios.get('http://localhost/wp_api/authentication/fetch_users.php')
      .then(response => {
        setUsers(response.data.users);
        setLoading(false);
        // Initialize DataTable after data is fetched
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
      .catch(error => {
        console.error("Error fetching users:", error);
        toast.error('Error fetching users');
        setLoading(false);
      });

    // Cleanup DataTable on component unmount
    return () => {
      if ($.fn.DataTable.isDataTable("#myTable")) {
        $("#myTable").DataTable().destroy();
      }
    };
  }, []);

  const handleViewProfile = (uid,email) => {
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
            <li className="breadcrumb-item"><a href="index.html">Account</a></li>
            <li className="breadcrumb-item active">Settings</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-xxl-3">
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
            <div className="col-xxl-3">
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
            <div className="col-xxl-3">
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
            <div className="col-xxl-3">
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
                          <th><i className="bi bi-menu"></i></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map(user => (
                            <tr key={user.uid}>
                              <td>{user.uid}</td>
                              <td>{user.fullname}</td>
                              <td>{user.email}</td>
                              <td>{user.role}</td>
                              <td>
                                <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                  {user.status}
                                </span>
                              </td>
                              <td>
                                <div className="dropdown">
                                  <i className="bi bi-three-dots-vertical" id={`dropdownMenuButton${user.uid}`} data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer' }}></i>
                                  <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${user.uid}`}>
                                    <li>
                                      <Link to={`/components/authentication/users_profile`} className="dropdown-item" onClick={() => handleViewProfile(user.uid,user.email)}>
                                        <i className="bi bi-eye"></i> View
                                      </Link>
                                    </li>
                                    <li>
                                      <Link to={`/users-edit/${user.uid}`} className="dropdown-item">
                                        <i className="bi bi-gear"></i> Settings
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Account_Settings;