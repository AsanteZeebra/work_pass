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
import "select2/dist/css/select2.min.css";
import "select2/dist/js/select2.min.js";


const Assign_case = ({ onChange }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [cases, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const countries = countryList.getNames();
  const [caseData, SetCaseData] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState("");
  const [selectedClient, setSelectedClient] = useState(""); // Track selected client
  const [selectedCaseId, setSelectedCaseId] = useState(""); // Track selected case_id

  const handleClientChange = (e) => {
    const clientName = e.target.value;
    setSelectedClient(clientName);

    // Find the corresponding case_id for the selected client
    const client = caseData.find((c) => c.customer_name === clientName);
    if (client) {
      setSelectedCaseId(client.case_id); // Update the case_id
    } else {
      setSelectedCaseId(""); // Reset case_id if no match is found
    }
  };

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

  // Define the modal form validation schema using yup
  const schema = yup.object().shape({
    fullname: yup.string().required("Name is required"),
    case_id: yup.string().required("Please choose a case ID"),
    assigned_to: yup.string().required("Please assign to someone"),
    deadline: yup.string().required("Please choose a deadline"),
    additional: yup.string().required("Additional instructions are required"),
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
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/wp_api/Clients/create_case.php",
        {
          fullname: data.fullname,
          case_id: data.case_id,
          assigned_to: data.assigned_to,
          deadline: data.deadline,
          additional: data.additional,
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
      .get("http://localhost/wp_api/cases/fetch_all_cases.php")
      .then((response) => {
        setUsers(response.data.cases);

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

  const handleViewProfile = (uid) => {
    localStorage.setItem("passport_no", uid);
  };

  useEffect(() => {
    fetchCaseInfo();
    fetchStaffInfo();
  }, []);

  const fetchCaseInfo = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/cases/fetch_all_cases.php",

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        SetCaseData(response.data.cases);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case details. Please try again.");
    }
  };

  const fetchStaffInfo = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/employees/fetch_employees.php",

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setStaffData(response.data.employees);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching emploeyee details. Please try again.");
    }
  };



  return (
    <>
      <div className="pagetitle">
        <h1>Cases</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Cases</a>
            </li>
            <li className="breadcrumb-item active">case_list</li>
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
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Assign Case </h5>
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
                              <div className="col-md-12">
                                <div className="form-group">
                                  <label htmlFor="fullname" style={{marginTop: "10px", marginBottom: "10px"}}><b>Client</b></label>
                                  <span className="text-danger">*</span>
                                  
                                  <select
                                    className="form-select"
                                    id="fullname"
                                    name="fullname"
                                    {...register("fullname")}
                                    value={selectedClient} // Bind to selectedClient state
                                    onChange={handleClientChange} // Handle client selection
                                  >
                                    <option value="">
                                      -- Select client --
                                    </option>
                                    {caseData && caseData.length > 0 ? (
                                      caseData.map((client, index) => (
                                        <option
                                          key={index}
                                          value={client.customer_name}
                                        >
                                          {client.customer_name}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="" disabled>
                                        No client data available
                                      </option>
                                    )}
                                  </select>
                                  <p className="text-danger">
                                    {errors.fullname?.message}
                                  </p>
                                </div>
                              </div>

                              <div className="col-md-6" >
                                <div className="form-group">
                                  <label htmlFor="case_id" style={{marginTop: "10px", marginBottom: "10px"}}><b>Case ID</b></label>
                                  <span className="text-danger">*</span>
                                  <select
                                    className="form-select"
                                    id="case_id"
                                    name="case_id"
                                  
                                    value={selectedCaseId} // Bind to selectedCaseId state
                                    onChange={(e) => setSelectedCaseId(e.target.value)} // Allow manual selection if needed
                                    {...register("case_id")}
                                 >
                                    <option value="">
                                      -- Select case_id --
                                    </option>
                                    {caseData && caseData.length > 0 ? (
                                      caseData.map((client, index) => (
                                        <option
                                          key={index}
                                          value={client.case_id}
                                        >
                                          {client.case_id} -{" "}
                                          {client.customer_name}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="" disabled>
                                        No client data available
                                      </option>
                                    )}
                                  </select>
                                  <p className="text-danger">
                                    {errors.case_id?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-12">
                                <div className="form-group">
                                  <label
                                    htmlFor="deadline"
                                    style={{ marginTop: "10px", marginBottom: "10px" }}
                                  >
                                    <b>Deadline</b>
                                  </label>
                                  <span className="text-danger">*</span>
                                  <input
                                    type="date"
                                    className="form-control"
                                    id="deadline"
                                    name="deadline"
                                    placeholder="Deadline"
                                    title="Choose a deadline"
                                    {...register("deadline")} // Register the input
                                  />
                                  <p className="text-danger">{errors.deadline?.message}</p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-12">
                                <div className="form-group">
                                  <label htmlFor="assigned_to" style={{marginTop: "10px", marginBottom: "10px"}}>
                                  <b> Assigned_to</b>
                                  <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-select"
                                    id="assigned_to"
                                    name="assigned_to"
                                    {...register("assigned_to")}
                                  >
                                    <option value="">-- Assigned_to --</option>
                                    {staffData && staffData.length > 0 ? (
                                      staffData.map((staff, index) => (
                                        <option
                                          key={index}
                                          value={staff.fullname}
                                        >
                                         
                                          {staff.fullname}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="" disabled>
                                        No employee data available
                                      </option>
                                    )}
                                  </select>
                                  <p className="text-danger">
                                    {errors.assigned_to?.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-12">
                                <div className="form-group">
                                  <label
                                    htmlFor="additional"
                                    style={{ marginTop: "10px", marginBottom: "10px" }}
                                  >
                                    <b>Additional Instructions</b>
                                  </label>
                                  <textarea
                                    className="form-control"
                                    id="additional"
                                    name="additional"
                                    placeholder="Additional instruction"
                                    rows="5"
                                    {...register("additional")} // Register the textarea
                                  ></textarea>
                                  <p className="text-danger">{errors.additional?.message}</p>
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

                  <h5 className="card-title">Cases List</h5>
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
                          <th>Client</th>
                          <th>Assigned_to</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases && cases.length > 0 ? (
                          cases.map((casses) => (
                            <tr key={casses.case_id}>
                              <td>{casses.case_id}</td>
                              <td>{casses.customer_name}</td>
                              <td>{casses.assigned_to}</td>
                              <td>{casses.date_created}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    casses.status === "Complete"
                                      ? "bg-success"
                                      : casses.status === "Pending"
                                      ? "bg-warning"
                                      : casses.status === "Suspended" ||
                                        casses.status === "Cancelled" ||
                                        casses.status === "Rejected"
                                      ? "bg-danger"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {casses.status}
                                </span>
                              </td>
                              <td>
                                <div className="dropdown">
                                  <i
                                    className="bi bi-three-dots-vertical"
                                    id={`dropdownMenuButton${casses.case_id}`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ cursor: "pointer" }}
                                  ></i>
                                  <ul
                                    className="dropdown-menu"
                                    aria-labelledby={`dropdownMenuButton${casses.case_id}`}
                                  >
                                    <li>
                                      <Link
                                        to={`/customer_info`}
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleViewProfile(casses.case_id)
                                        }
                                      >
                                        Track
                                      </Link>
                                    </li>
                                    <li>
                                      <Link
                                        to={`#`}
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleViewProfile(casses.case_id)
                                        }
                                      >
                                        Assign Case
                                      </Link>
                                    </li>
                                    <li>
                                      <Link
                                        to={`#`}
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleViewProfile(casses.case_id)
                                        }
                                      >
                                        Remove Case
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

export default Assign_case;
