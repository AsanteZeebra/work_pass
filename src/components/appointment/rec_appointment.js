import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback,useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import $ from "jquery";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import countryList from "country-list";
import { ClipLoader } from "react-spinners";

const Rec_appointment = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const countries = countryList.getNames();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
   const tableRef = useRef(null); // Ref for the table element

  // Define the modal form validation schema using yup
  const schema = yup.object().shape({
    fullname: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    telephone: yup.string().required("Telephone is required"),
    destination: yup.string().required("Destination is required"),
    app_type: yup.string().required("Application type is required"),
    additional: yup
      .string()
      .required("Additional information is required"),
    app_date: yup.string().required("Date is required"),
    app_time: yup.string().required("Time is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
  console.log("Form submitted with data:", data);
  setLoading(true);
  try {
    const response = await axios.post(
      "http://localhost/wp_api/appointment/create_appointment.php",
      {
        fullname: data.fullname,
        email: data.email,
        telephone: data.telephone,
        destination: data.destination,
        app_type: data.app_type,
        additional: data.additional,
        app_date: data.app_date,
        app_time: data.app_time,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Debugging

    if (response.data.status === "success") {
      toast.success(response.data.message, { position: "top-right" });
       //console.log("API response:", response.data.message);
      setLoading(false);
      window.location.reload();
      reset();

      // const modal = window.bootstrap.Modal.getInstance(document.getElementById("adm"));
      // if (modal) modal.hide();
    } else {
      toast.error(response.data.message, { position: "top-right" });
      setLoading(false);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.error("An error occurred!", { position: "top-right" });
    setLoading(false);
  }
};


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
        setAppointments(response.data.appointments);
        setLoading(false);

         // Destroy previous DataTable instance if it exists
         if ($.fn.DataTable.isDataTable(tableRef.current)) {
          $(tableRef.current).DataTable().destroy();
        }

        // Initialize DataTable after data is fetched
        $(tableRef.current).DataTable({
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
    appointment_id,fullname, email, telephone, destination, app_type, app_date, app_time,
   
  ) => {
    localStorage.setItem("app_id", appointment_id);
    localStorage.setItem("app_name", fullname);
    localStorage.setItem("app_email", email);
    localStorage.setItem("app_telephone", telephone);
    localStorage.setItem("app_destination", destination);
    localStorage.setItem("app_type", app_type);
    localStorage.setItem("app_date", app_date);
    localStorage.setItem("app_time", app_time);
 
  };

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
                  <div className="modal fade" id="adm" tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Create Appointment</h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-3">
                              <div className="row">
                                <div className="col-md-12">
                                  <label
                                    htmlFor="fullname"
                                    className="form-label"
                                  >
                                    Full Name
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="fullname"
                                    {...register("fullname")}
                                    placeholder="Enter your full name"
                                  />
                                  {errors.fullname && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.fullname.message}{" "}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="row">
                                <div className="col-md-6">
                                  <label
                                    htmlFor="fullname"
                                    className="form-label"
                                  >
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    {...register("email")}
                                    placeholder="Enter your email"
                                  />
                                  {errors.email && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.email.message}{" "}
                                    </span>
                                  )}
                                </div>
                                <div className="col-md-6">
                                  <label
                                    htmlFor="telephone"
                                    className="form-label"
                                  >
                                    Telephone
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="telephone"
                                    {...register("telephone")}
                                    placeholder="Enter your telephone number"
                                  />
                                  {errors.telephone && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.telephone.message}{" "}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="row">
                                <div className="col-md-6">
                                  <label
                                    htmlFor="fullname"
                                    className="form-label"
                                  >
                                    Destination
                                  </label>
                                  <select
                                    className="form-select"
                                    id="destination"
                                    {...register("destination")}
                                  >
                                    <option value="">
                                      -Select destination-
                                    </option>
                                    {countries.map((country, index) => (
                                      <option key={index} value={country}>
                                        {country}
                                      </option>
                                    ))}
                                  </select>
                                  {errors.destination && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.destination.message}{" "}
                                    </span>
                                  )}
                                </div>
                                <div className="col-md-6">
                                  <label
                                    htmlFor="fullname"
                                    className="form-label"
                                  >
                                    Appointment Type
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="app_type"
                                    {...register("app_type")}
                                    placeholder="Appointment type"
                                  />
                                  {errors.app_type && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.app_type.message}{" "}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="row">
                                <div className="col-md-6">
                                  <label
                                    htmlFor="fullname"
                                    className="form-label"
                                  >
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    id="app_date"
                                    {...register("app_date")}
                                    placeholder="choose a date"
                                  />
                                  {errors.app_date && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.app_date.message}{" "}
                                    </span>
                                  )}
                                </div>
                                <div className="col-md-6">
                                  <label
                                    htmlFor="telephone"
                                    className="form-label"
                                  >
                                    Time
                                  </label>
                                  <input
                                    type="time"
                                    className="form-control"
                                    id="app_time"
                                    {...register("app_time")}
                                    placeholder="choose time"
                                  />
                                  {errors.app_time && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.app_time.message}{" "}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="row">
                                <div className="col-md-12">
                                  <label
                                    htmlFor="fullname"
                                    className="form-label"
                                  >
                                    Additional Information
                                  </label>
                                  <textarea
                                    className="form-control"
                                    id="additional"
                                    {...register("additional")}
                                    placeholder="Enter additional information"
                                  />
                                  {errors.additional && (
                                    <span className="text-danger">
                                      {" "}
                                      {errors.additional.message}{" "}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="btn btn-outline-primary w-100"
                            >
                              {" "}
                              {loading ? (
                                <ClipLoader size={20} color={"#fff"} />
                              ) : (
                                "Submit"
                              )}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    data-bs-toggle="modal"
                    data-bs-target="#adm"
                    className="btn btn-outline-primary btn-sm"
                    style={{ float: "right" }}
                  >
                    <i className="bi bi-plus"></i> Appointment
                  </button>
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <table  className="table table-hover datatable" id="myTable">
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
                              <td>{appointment.app_type}</td>
                              <td>{appointment.app_date}</td>
                              <td>{appointment.app_time}</td>
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
                                      : ""
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
                                      <Link to="/reschedule" className="dropdown-item" onClick={() =>
                                          handledata(
                                            appointment.appointment_id,
                                            appointment.fullname,
                                            appointment.email,
                                            appointment.telephone,
                                            appointment.destination,
                                            appointment.app_type,
                                            appointment.app_date,
                                            appointment.app_time,

                                           
                                          )
                                        }>
                                        Reschedule
                                      </Link>
                                    </li>
                                    <li>
                                      <Link  className="dropdown-item">
                                        Cancel
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

export default Rec_appointment;
