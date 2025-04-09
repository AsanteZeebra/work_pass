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

const Payroll = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [employees, SetEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

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
          "http://localhost/wp_api/authentication/verify_token.php",
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

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost/wp_api/employees/fetch_salaries.php")
      .then((response) => {
        SetEmployees(response.data.employees);
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

  const handledata = (
    employee_id,
    email,
    salary,
    fullname,
    currency,
    department,
    position,
    month_year
  ) => {
    localStorage.setItem("emp_id", employee_id);
    localStorage.setItem("emp_email", email);
    localStorage.setItem("emp_salary", salary);
    localStorage.setItem("emp_name", fullname);
    localStorage.setItem("currency", currency);
    localStorage.setItem("emp_department", department);
    localStorage.setItem("emp_position", position);
    localStorage.setItem("emp_month_year", month_year); // Set current month and year
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
        "http://localhost/wp_api/employees/percentage_indicator.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    

      if (response.data.status === "success") {
        SetPercentageData({
          Paid: response.data.percentage_changes?.paid_employees || 0,
          Unpaid: response.data.percentage_changes?.unpaid_employees || 0,
          employee: response.data.percentage_changes?.total_employees || 0,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching percentage data:", error);
      setError("Error fetching percentage data. Please try again.");
    }
  };

  const fetchcount = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/employees/count_employees.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        SetCountData({
          total_all: response.data.all_employees,
          total_paid: response.data.Paid_employees,
          total_unpaid: response.data.Unpaid_employees,
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
        <h1>Payroll</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Employees</a>
            </li>
            <li className="breadcrumb-item active">payroll</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        {/* Card 1: Total Paid */}
        <div className="col-xxl-3 col-md-6">
          <div className="card info-card sales-card">
            <div className="card-body">
              <h5 className="card-title">
                Total Paid <span>| This Month</span>
              </h5>

              <div className="d-flex align-items-center">
                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-arrow-up-circle"></i>
                </div>
                <div className="ps-3">
                  {/* Display total paid count and percentage change */}
                  {countData ? (
                    <h6>{countData.total_paid}</h6>
                  ) : (
                    <p>No case data available.</p>
                  )}
                  {PercentageData && PercentageData.Paid !== undefined ? (
                    <span className="text-success small pt-1 fw-bold">
                      {PercentageData.Paid}%
                    </span>
                  ) : (
                    <p>No percentage data available.</p>
                  )}

                  {PercentageData && PercentageData.Paid > 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-up-right-square"
                        style={{ color: "#269746" }}
                      ></i>
                    </span>
                  ) : PercentageData && PercentageData.Paid < 0 ? (
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
                    <h6>{countData.total_unpaid}</h6>
                  ) : (
                    <p>No case data available.</p>
                  )}

                  {PercentageData && PercentageData.Unpaid !== undefined ? (
                    <span className="text-success small pt-1 fw-bold">
                      {PercentageData.Unpaid}%
                    </span>
                  ) : (
                    <p>No percentage data available.</p>
                  )}

                  {PercentageData && PercentageData.Unpaid > 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-up-right-square"
                        style={{ color: "#269746" }}
                      ></i>
                    </span>
                  ) : PercentageData && PercentageData.Unpaid < 0 ? (
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
                Employees <span>| This Month</span>
              </h5>

              <div className="d-flex align-items-center">
                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-people"></i>
                </div>
                <div className="ps-3">
                  {countData ? (
                    <h6>{countData.total_all}</h6>
                  ) : (
                    <p>No case data available.</p>
                  )}

                  {PercentageData && PercentageData.employee !== undefined ? (
                    <span className="text-success small pt-1 fw-bold">
                      {PercentageData.employee}%
                    </span>
                  ) : (
                    <p>No percentage data available.</p>
                  )}

                  {PercentageData && PercentageData.employee > 0 ? (
                    <span className="text-muted small pt-2 ps-1">
                      <i
                        className="bi bi-arrow-up-right-square"
                        style={{ color: "#269746" }}
                      ></i>
                    </span>
                  ) : PercentageData && PercentageData.employee < 0 ? (
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
                Benefits <span>| This Month</span>
              </h5>

              <div className="d-flex align-items-center">
                <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <i className="bi bi-piggy-bank"></i>
                </div>
                <div className="ps-3">
                  <h6>145</h6>
                  <span className="text-success small pt-1 fw-bold">
                    12%
                  </span>{" "}
                  <span className="text-muted small pt-2 ps-1">increase</span>
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
                  <h5 className="card-title">Employee List</h5>

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
                          <th>Department</th>
                          <th>Position</th>
                          <th>Month_Year</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees && employees.length > 0 ? (
                          employees.map((employee) => (
                            <tr key={employee.employee_id}>
                              <td>{employee.employee_id}</td>
                              <td>{employee.fullname}</td>
                              <td>{employee.email}</td>
                              <td>{employee.department}</td>
                              <td>{employee.position}</td>
                              <td>{employee.month_year}</td>
                              <td>{employee.salary}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    employee.status === "Paid"
                                      ? "bg-success"
                                      : employee.status === "Unpaid" ||
                                        employee.status === "Hold"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                >
                                  {employee.status}
                                </span>
                              </td>
                              <td>
                                <div className="dropdown">
                                  <i
                                    className="bi bi-three-dots-vertical"
                                    id={`dropdownMenuButton`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ cursor: "pointer" }}
                                  ></i>
                                  <ul
                                    className="dropdown-menu"
                                    aria-labelledby={`dropdownMenuButton`}
                                  >
                                    <li>
                                      <Link
                                        to="/pay_salary"
                                        className="dropdown-item"
                                        onClick={() =>
                                          handledata(
                                            employee.employee_id,
                                            employee.email,
                                            employee.salary,
                                            employee.fullname,
                                            employee.currency,
                                            employee.department,
                                            employee.position,
                                            employee.month_year
                                          )
                                        }
                                      >
                                        <i className="bi bi-arrow-right-square"></i>{" "}
                                        Pay
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
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

export default Payroll;
