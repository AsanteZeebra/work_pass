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
import "pdfmake/build/vfs_fonts"; // PDF fonts+
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";
// CSS Imports
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

const Overview = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  // Memoize handleLogout to prevent re-creation
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.removeItem("username"); // Remove username from localStorage
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
        console.error("Token validation error:", error);
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
        console.error("Error decoding token:", error);
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate, handleLogout]); // ✅ Now handleLogout is included

  // Define the modal form validation schema using yup
  const schema = yup.object().shape({
    fullname: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    gender: yup.string().required("Please choose gender"),
    dob: yup.string().required("please choose date of birth"),
    telephone: yup.string().required("Please eneter telephone  number"),
    passport: yup.string().required("PLease enter passport number"),
    issue_date: yup.string().required("pleas choose issue_date"),
    expiry_date: yup.string().required("Choose epiry date"),
    nationality: yup.string().required("choose a nationality"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/wp_api/clients/add_client.php",
        {
          fullname: data.fullname,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          telephone: data.telephone,
          passport: data.passport,
          issue_date: data.issue_date,
          expiry_date: data.expiry_date,
          nationality: data.nationality,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.status === "success") {
        toast.success(response.data.message, { position: "top-right" });
        setLoading(false);
        reset(); // Reset the form after successful submission
        // ✅ Manually close modal without Bootstrap JS
        window.location.reload();
      } else {
        toast.error(response.data.message, { position: "top-right" });
        setLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred!", { position: "top-right" });
      setLoading(false);
    }
  };

  useEffect(() => {
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
          destroy: true,
          paging: true,
          dom: "Bfrtip",
          data: response.data.users, // Populate table with data
          columns: [
            { data: "client_id", title: "ID" },
            { data: "fullname", title: "Fullname" },
            { data: "email", title: "Email" },
            { data: "nationality", title: "Nationality" },
            { data: "expiry_date", title: "Passport Expiry" },
            { data: "telephone", title: "Telephone" },
            {
              data: "status",
              title: "Status",
              render: function (data) {
                let badgeClass =
                  data === "Active"
                    ? "bg-success"
                    : data === "Pending"
                    ? "bg-warning"
                    : data === "Suspended" || data === "Blocked"
                    ? "bg-danger"
                    : "bg-secondary";
                return `<span class="badge ${badgeClass}">${data}</span>`;
              },
            },
           
          ],
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
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });

    return () => {
      if ($.fn.DataTable.isDataTable("#myTable")) {
        $("#myTable").DataTable().destroy();
      }
    };
  }, []);

  const [error, setError] = useState("");
  const [countData, SetCountData] = useState(null);
  const [PercentageData, SetPercentageData] = useState(null);

  const fetchcount = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/Clients/count_cases.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        SetCountData({
          all_cases: response.data.all_cases,
          active_cases: response.data.active_cases,
          pending_cases: response.data.pending_cases,
          complete_cases: response.data.complete_cases,
          rejected_cases: response.data.rejected_cases,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case data. Please try again.");
    }
  };

  useEffect(() => {
    fetchcount();
    fecthPercentage();
  }, []);

  const fecthPercentage = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/Clients/calculate_cases_percentages.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        SetPercentageData({
          active: response.data.active?.percentage_change || 0,
          pending: response.data.pending?.percentage_change || 0,
          complete: response.data.complete?.percentage_change || 0,
          rejected: response.data.rejected?.percentage_change || 0,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching percentage data:", error);
      setError("Error fetching percentage data. Please try again.");
    }
  };

  return (
    <>
      <div className="pagetitle">
        <h1>Clients</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Dashbaord</a>
            </li>
            <li className="breadcrumb-item active">overview</li>
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
                    Active <span>| Cases</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-check2-circle"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.all_cases}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}


                        {PercentageData &&
                        PercentageData.active !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.active}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.active > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.active < 0 ? (
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
            <div className="col-xxl-3">
              <div className="card info-card revenue-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Pending <span>| Cases</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.pending_cases}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}


                        {PercentageData &&
                        PercentageData.pending !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.pending}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.pending > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.pending < 0 ? (
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
            <div className="col-xxl-3">
              <div className="card info-card revenue-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Completed <span>| Cases</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.complete_cases}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}


                        {PercentageData &&
                        PercentageData.complete !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.complete}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.complete > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.complete < 0 ? (
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
            <div className="col-xxl-3">
              <div className="card info-card customers-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Rejected <span>| Cases</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-x-circle"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.rejected_cases}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}

                      <div className="ps-3">
                        {PercentageData &&
                        PercentageData.rejected !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.rejected}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.rejected > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.rejected < 0 ? (
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
            </div>
            <div className="col-12">
              <div className="card">
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
                {/*Table card */}
                <div className="card-body">
                  <div className="modal fade" id="adm" tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5  className="modal-title">Add New</h5>
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
                              {/* Fullname */}
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

                              {/* Date of Birth */}
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
                              {/* Gender Selection */}
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

                              {/* Telephone Number */}
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
                              {/* Passport Number */}
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
                              {/* Issue Date */}
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

                              {/* Expiry Date */}
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
                              {/* Email */}
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

                              {/* Nationality */}
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
                                  >
                                    <option value="">
                                      -- Select Nationality --
                                    </option>
                                    <option value="Ghanaian">Ghanaian</option>
                                    <option value="Nigerian">Nigerian</option>
                                    <option value="Kenyan">Kenyan</option>
                                    <option value="Other">Other</option>
                                  </select>
                                  <p className="text-danger">
                                    {errors.nationality?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Submit Button */}
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

                  <h5 className="card-title">
                    Customers <span>| List</span>
                  </h5>
                  <button hidden
                    data-bs-toggle="modal"
                    data-bs-target="#adm"
                    className="btn btn-outline-primary btn-sm"
                    style={{ float: "right" }}
                  >
                    <i className="bi bi-perso0
                    3n-plus"></i> Add New
                  </button>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <table
                      className="table table-hover datatable"
                      id="myTable"
                    ></table>
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

export default Overview;
