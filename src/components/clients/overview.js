


import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect,useCallback  } from "react";
import  {jwtDecode} from "jwt-decode";
import axios from 'axios';
import $ from "jquery";
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

const Overview = () => {
  useEffect(() => {
    let table = $("#myTable").DataTable({
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

    return () => {
      table.destroy(); // Cleanup
    };
  }, []);

 const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  // Memoize handleLogout to prevent re-creation
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token'); // Remove token from localStorage
    localStorage.removeItem('username'); // Remove username from localStorage
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

          // ✅ Call verifyToken before returning
          verifyToken(token);

          // ✅ Cleanup the timer when the component unmounts
          return () => clearTimeout(logoutTimer);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout();
      }
    } else {
      navigate('/login');
    }
  }, [token, navigate, handleLogout]); // ✅ Now handleLogout is included
 

  return (
    <>
    <div className="pagetitle">
      <h1>Clients</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="index.html">Dashbaord</a></li>
          <li className="breadcrumb-item active">clients</li>
        </ol>
      </nav>
    </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-xxl-3">
              <div className="card info-card sales-card">
                <div className="filter">
                  <Link className="icon" to="#" data-bs-toggle="dropdown">
                    <i className="bi bi-three-dots"></i>
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                    <li className="dropdown-header text-start">
                      <h6>Filter</h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Today
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Month
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Year
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    Active <span>| All</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-check2-circle"></i>
                    </div>
                    <div className="ps-3">
                      <h6>145</h6>
                      <span className="text-success small pt-1 fw-bold">12%</span>{" "}
                      <span className="text-muted small pt-2 ps-1"><i className="bi bi-arrow-up-right-square" style={{color: "#269746"}}></i></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3">
              <div className="card info-card revenue-card">
                <div className="filter">
                  <Link className="icon" to="#" data-bs-toggle="dropdown">
                    <i className="bi bi-three-dots"></i>
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                    <li className="dropdown-header text-start">
                      <h6>Filter</h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Today
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Month
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Year
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    Pending <span>| All</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div className="ps-3">
                      <h6>264</h6>
                      <span className="text-warning small pt-1 fw-bold">8%</span>{" "}
                      <span className="text-muted small pt-2 ps-1"><i className="bi bi-arrow-down-right-square" style={{color: "red"}}></i></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3">
              <div className="card info-card revenue-card">
                <div className="filter">
                  <Link className="icon" to="#" data-bs-toggle="dropdown">
                    <i className="bi bi-three-dots"></i>
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                    <li className="dropdown-header text-start">
                      <h6>Filter</h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Today
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Month
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Year
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    Completed <span>| This Month</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="ps-3">
                      <h6>3,264</h6>
                      <span className="text-success small pt-1 fw-bold">45%</span>{" "}
                      <span className="text-muted small pt-2 ps-1"><i className="bi bi-arrow-up-right-square" style={{color: "#269746"}}></i></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3">
              <div className="card info-card customers-card">
                <div className="filter">
                  <Link className="icon" to="#" data-bs-toggle="dropdown">
                    <i className="bi bi-three-dots"></i>
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                    <li className="dropdown-header text-start">
                      <h6>Filter</h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Today
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Month
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Year
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    Rejected <span>| This Year</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-x-circle"></i>
                    </div>
                    <div className="ps-3">
                      <h6>15</h6>
                      <span className="text-danger small pt-1 fw-bold">79%</span>{" "}
                      <span className="text-muted small pt-2 ps-1"><i className="bi bi-arrow-up-right-square" style={{color: "red"}}></i></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card">
                <div className="filter">
                  <Link className="icon" to="#" data-bs-toggle="dropdown">
                    <i className="bi bi-three-dots"></i>
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                    <li className="dropdown-header text-start">
                      <h6>Filter</h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Today
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Month
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Year
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    Reports <span>/This Month</span>
                  </h5>
                  <div id="reportsChart"></div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="filter">
                  <Link className="icon" to="#" data-bs-toggle="dropdown">
                    <i className="bi bi-three-dots"></i>
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                    <li className="dropdown-header text-start">
                      <h6>Filter</h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        Today
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Month
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="#">
                        This Year
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    Recent Transactions <span>| This Month</span>
                  </h5>
                  <table className="table table-hover datatable" id="myTable">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Customer</th>
                        <th scope="col">Service</th>
                        <th scope="col">Price</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Link to="#">#2457</Link>
                        </td>
                        <td>Brandon Jacob</td>
                        <td>
                          <Link to="#" className="text-primary-outline">
                            At praesentium minu
                          </Link>
                        </td>
                        <td>$64</td>
                        <td>13th March,2025</td>
                        <td>
                          <span className="badge bg-success">Approved</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;