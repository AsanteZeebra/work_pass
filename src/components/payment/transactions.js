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


const Transactions = () => {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [transactions, SetTransactions] = useState([]);
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
        toast.success("Unauthorized",error)
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
      .get("http://localhost/wp_api/payment/fetch_transactions.php")
      .then((response) => {
        SetTransactions(response.data.transactions);
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
    passport_no,
    fullname,
    email,
   
  ) => {
    localStorage.setItem("passport_no", passport_no);
    localStorage.setItem("fullname", fullname);
    localStorage.setItem("email", email);
 
  };

  return (
    <>
      <div className="pagetitle">
        <h1>Payment</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/dashboard">payment</Link>
            </li>
            <li className="breadcrumb-item active">transactions</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="card-body">
                
                  <h5 className="card-title">Transactions</h5>
                  

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
                          <th>Destination</th>
                          <th>Type</th>                         
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions && transactions.length > 0 ? (
                          transactions.map((transaction) => (
                            <tr key={transaction.transaction_id}>
                                 <td>{transaction.transaction_id}</td>
                              <td>{transaction.fullname}</td>
                              <td>{transaction.destination}</td>
                              <td>{transaction.type}</td>
                              <td>{transaction.created_at}</td>
                              <td>{transaction.amount}</td>
                            
                              <td>
                                <span
                                  className={`badge ${
                                    transaction.status === "Paid"
                                      ? "bg-success"
                                      : transaction.status === "Pending"
                                      ? "bg-warning"
                                     
                                      : transaction.status === "Refunded" ||
                                      transaction.status === "Hold"
                                      ? "bg-danger"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {transaction.status}
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
                                        to={`/`}
                                        className="dropdown-item"
                                        onClick={() =>
                                          handledata(
                                            transaction.transaction_id,
                                            transaction.fullname,
                                            transaction.email,
                                           
                                          )
                                        }
                                      >
                                        Print
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

export default Transactions;
