import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Statement = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employee_Id, setemployeeId] = useState("");
  const [statement, setStatement] = useState([]);

  // Memoize handleLogout to prevent re-creation
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  // Set employee_Id from localStorage
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("emp_id");
    if (storedEmployeeId) {
      setemployeeId(storedEmployeeId);
    } else {
      toast.error("Employee ID not found");
    }
  }, []);

  // Fetch salary statement
  useEffect(() => {
    if (employee_Id) {
      setLoading(true);
      axios
        .get(`http://main.fremikeconsult.com/wp_api/payroll/fetch_statement.php?employee_Id=${employee_Id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("API Response:", response.data); // Debugging
          if (response.data && response.data.statements) {
            setStatement(response.data.statements);
          } else {
            setStatement([]);
            toast.error("No data found");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching statement:", error);
          toast.error("Error fetching statement");
          setLoading(false);
        });
    }
  }, [employee_Id]);

  // Initialize DataTable
  useEffect(() => {
    if (statement.length > 0) {
      if ($.fn.DataTable.isDataTable("#myTable")) {
        $("#myTable").DataTable().destroy();
      }

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
          },
        ],
      });
    }
  }, [statement]);

  return (
    <>
      <div className="pagetitle">
        <h1>Payroll</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Salary_statement</a>
            </li>
            <li className="breadcrumb-item active">Statement</li>
          </ol>
        </nav>
      </div>
      <div className="row align-items-center justify-content-center">
        <div className="col-lg-12">
          <div className="row align-items-center justify-content-center">
            <div className="col-12">
              <br />
              <br />
              <div className="card recent-sales overflow-auto justify-content-center">
                <div className="card-body justify-content-center">
                  <h5 className="card-title">Salary Statement</h5>

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
                        </tr>
                      </thead>
                      <tbody>
                        {statement && statement.length > 0 ? (
                          statement.map((payment) => (
                            <tr key={payment.employee_id}>
                              <td>{payment.employee_id}</td>
                              <td>{payment.fullname}</td>
                              <td>{payment.email}</td>
                              <td>{payment.department}</td>
                              <td>{payment.position}</td>
                              <td>{payment.month_year}</td>
                              <td>{payment.salary}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    payment.status === "Paid"
                                      ? "bg-success"
                                      : payment.status === "Unpaid" ||
                                        payment.status === "Hold"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              No records found!
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

export default Statement;