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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";
// CSS Imports
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";
import countryList from "country-list";

const Customers = ({ onChange }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const countries = countryList.getNames();

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

  // Define the modal form validation schema using yup
  const schema = yup.object().shape({
    fullname: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    gender: yup.string().required("Please choose gender"),
    dob: yup.string().required("please choose date of birth"),
    telephone: yup.string().required("Please enter telephone number"),
    passport: yup.string().required("Please enter passport number"),
    issue_date: yup.string().required("Please choose issue date"),
    expiry_date: yup.string().required("Choose expiry date"),
    nationality: yup.string().required("Choose a nationality"),
    app_type:yup.string().required("Enter Application Type"),
    destination:yup.string().required("Choose destination country"),
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
    console.log("Form submitted with data:", data); // Debugging
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/wp_api/Clients/add_client.php",
        {
          fullname: data.fullname,
          email: data.email,
          telephone: data.telephone,
          passport_no: data.passport,  
          issue_date: data.issue_date,
          expiry_date: data.expiry_date,
          nationality: data.nationality,
          application_type: data.app_type, 
          country_of_interest: data.destination, 
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.status === "success") {
        toast.success(response.data.message, { position: "top-right" });
        console.log(response.data.message);
        setLoading(false);
        reset(); // Reset the form after successful submission
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

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost/wp_api/clients/fetch_customers.php")
      .then((response) => {
        setUsers(response.data.users);
        setLoading(false);

      

        // Destroy previous DataTable instance if it exists
        if ($.fn.DataTable.isDataTable("#myTable")) {
          $("#myTable").DataTable().destroy();
        }
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

  const handleViewProfile = (uid, ) => {
    localStorage.setItem("passport_no", uid);
  };

  return (
    <>
      <div className="pagetitle">
        <h1>Clients</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Dashboard</a>
            </li>
            <li className="breadcrumb-item active">manage_clients</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="card-body">
                  <div className="modal fade" id="adm" tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" >
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Add New</h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="fullname">Full Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="fullname"
                                    name="fullname"
                                    placeholder="Enter your full name"
                                    title="First name & Last name"
                                    {...register("fullname")}
                                  />
                                  <p className="text-danger">
                                    {errors.fullname?.message}
                                  </p>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="dob">Date of Birth</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    id="dob"
                                    name="dob"
                                    {...register("dob")}
                                  />
                                  <p className="text-danger">
                                    {errors.dob?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="gender">Gender</label>
                                  <select
                                    className="form-select"
                                    id="gender"
                                    name="gender"
                                    {...register("gender")}
                                  >
                                    <option value="">
                                      -- Select gender --
                                    </option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                  </select>
                                  <p className="text-danger">
                                    {errors.gender?.message}
                                  </p>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="telephone">Telephone</label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    id="telephone"
                                    name="telephone"
                                    placeholder="Enter your phone number"
                                    pattern="^\+?[0-9\s\-]{7,15}$"
                                    title="Enter a valid phone number"
                                    {...register("telephone")}
                                  />
                                  <p className="text-danger">
                                    {errors.telephone?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-12">
                                <div className="form-group">
                                  <label htmlFor="passport">
                                    Passport Number
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="passport"
                                    name="passport"
                                    placeholder="Enter Passport Number"
                                    pattern="^[A-Z0-9]+$"
                                    title="Enter a valid passport number"
                                    {...register("passport")}
                                  />
                                  <p className="text-danger">
                                    {errors.passport?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="issue_date">Issue Date</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    id="issue_date"
                                    name="issue_date"
                                    {...register("issue_date")}
                                  />
                                  <p className="text-danger">
                                    {errors.issue_date?.message}
                                  </p>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="expiry_date">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    id="expiry_date"
                                    name="expiry_date"
                                    {...register("expiry_date")}
                                  />
                                  <p className="text-danger">
                                    {errors.expiry_date?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="email">Email</label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    {...register("email")}
                                  />
                                  <p className="text-danger">
                                    {errors.email?.message}
                                  </p>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="nationality">
                                    Nationality
                                  </label>
                                  <select
                                    className="form-select"
                                    id="nationality"
                                    name="nationality"
                                    {...register("nationality")}
                                    onChange={onChange}
                                  >
                                    <option value="">Select a country</option>
                                    {countries.map((country, index) => (
                                    <option key={index} value={country}>
                                    {country}
                                    </option>
                                    ))}
                                  </select>
                                  <p className="text-danger">
                                    {errors.nationality?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="app_type">Application_type</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="app_type"
                                    name="app_type"
                                    placeholder="Enter application type"
                                    {...register("app_type")}
                                  />
                                  <p className="text-danger">
                                    {errors.app_type?.message}
                                  </p>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <div className="form-group">
                                  <label htmlFor="destination">
                                    Destination Country
                                  </label>
                                  <select
                                    className="form-select"
                                    id="destination"
                                    name="destination"
                                    {...register("destination")}
                                    onChange={onChange}
                                  >
                                    <option value="">Select a country</option>
                                    {countries.map((country, index) => (
                                      <option key={index} value={country}>
                                        {country}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="text-danger">
                                    {errors.destination?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-center">
                              <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: "50%" }}
                              >
                                {loading ? (
                                  <ClipLoader size={20} color={"#fff"} />
                                ) : (
                                  "Submit"
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h5 className="card-title">Customers List</h5>
                  <button
                    data-bs-toggle="modal"
                    data-bs-target="#adm"
                    className="btn btn-outline-primary btn-sm"
                    style={{ float: "right" }}
                  >
                    <i className="bi bi-person-plus"></i> Add New
                  </button>

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
                          <th>Nationality</th>
                          <th>Passport Expiry</th>
                          <th>Telephone</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users && users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user.client_id}>
                              <td>{user.client_id}</td>
                              <td>{user.fullname}</td>
                              <td>{user.email}</td>
                              <td>{user.nationality}</td>
                              <td>{user.expiry_date}</td>
                              <td>{user.telephone}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    user.status === "Active"
                                      ? "bg-success"
                                      : user.status === "Pending"
                                      ? "bg-warning"
                                      : user.status === "Suspended" ||
                                        user.status === "Blocked"
                                      ? "bg-danger"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {user.status}
                                </span>
                              </td>
                              <td>
                                <div className="dropdown">
                                  <i
                                    className="bi bi-three-dots-vertical"
                                    id={`dropdownMenuButton${user.client_id}`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ cursor: "pointer" }}
                                  ></i>
                                  <ul
                                    className="dropdown-menu"
                                    aria-labelledby={`dropdownMenuButton${user.client_id}`}
                                  >
                                    <li>
                                      <Link
                                        to={`/customer_info`}
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleViewProfile(user.Passport_no)
                                        }
                                      >
                                        <i className="bi bi-eye"></i> View
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

export default Customers;
