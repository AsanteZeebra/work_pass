import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/dataTables.buttons";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "jszip";
import "pdfmake";
import "pdfmake/build/vfs_fonts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

const Appointment = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const response = await axios.post(
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
        toast.error("Unauthorized", { position: "top-right" });
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
        console.error("Error decoding token:", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate, handleLogout]);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost/wp_api/appointment/appointment.php")
      .then((response) => {
        setAppointments(response.data.appointments || []);
        setLoading(false);

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
        console.error("Error fetching appointments:", error);
        toast.error("Error fetching appointments");
        setLoading(false);
      });

    return () => {
      if ($.fn.DataTable.isDataTable("#myTable")) {
        $("#myTable").DataTable().destroy();
      }
    };
  }, []);

  return (
    <>
      <div className="pagetitle">
        <h1>Appointments</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Appointments</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="card-body">
                  <h5 className="card-title">Appointments</h5>

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
                          <th>Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments && appointments.length > 0 ? (
                          appointments.map((appointment) => (
                            <tr key={appointment.appointment_id}>
                              <td>{appointment.appointment_id}</td>
                              <td>{appointment.fullname}</td>
                              <td>{appointment.destination}</td>
                              <td>{appointment.appointment_type}</td>
                              <td>{appointment.appointment_date}</td>
                              <td>{appointment.appointment_time}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    appointment.status === "Attended"
                                      ? "bg-success"
                                      : appointment.status === "Closed"
                                      ? "bg-danger"
                                      : appointment.status === "Pending"
                                      ? "bg-warning"
                                      : appointment.status === "Cancelled"
                                      ? "bg-danger"
                                      :""
                                  }`}
                                >
                                  {appointment.status}
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
                                      
                                      >
                                       Reschedule
                                      </Link>
                                    </li>
                                    <li>
                                      <Link
                                        to={`/`}
                                        className="dropdown-item"
                                      
                                      >
                                       Cancel
                                      </Link>
                                    </li>
                                    <li>
                                      <Link
                                        to={`/`}
                                        className="dropdown-item"
                                      
                                      >
                                       View
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
                              No appointments found!
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

export default Appointment;