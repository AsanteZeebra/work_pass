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
import ReactApexChart from "react-apexcharts";

const Passport_overview = () => {
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



  const [error, setError] = useState("");
  const [countData, SetCountData] = useState(null);
  const [PercentageData, SetPercentageData] = useState(null);

  const fetchcount = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/passports/count_passports.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        SetCountData({
          all_passports: response.data.all_passports,
          active_passports: response.data.active_passports,
          collected_passports: response.data.collected_passports,
          expired_passports: response.data.expired_passports,
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
        "http://localhost/wp_api/passports/passports_percentage.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        SetPercentageData({
          active: response.data.Active?.percentage_change || 0,
          collected: response.data.Collected?.percentage_change || 0,
          expired: response.data.Expired?.percentage_change || 0,
        
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching percentage data:", error);
      setError("Error fetching percentage data. Please try again.");
    }
  };


    const chartOptions = {
    chart: {
      id: 'basic-line',
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      },
    },
    markers: {
      size: 4
    },
    colors: ['#4154f1', '#2eca6a', '#ff771d'],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.4,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995]
    }
  };

  const chartSeries = [
    {
      name: 'series-1',
      data: [30, 9, 45, 5, 49]
    }
  ];

  return (
    <>
      <div className="pagetitle">
        <h1>Passports</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">passport</a>
            </li>
            <li className="breadcrumb-item active">passport_overview</li>
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
                    Active <span>| passports</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-check2-circle"></i>
                    </div>
                  
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3">
              <div className="card info-card sales-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Active <span>| Passports</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-arrow-clockwise"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.active_passports}</h6>
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
              <div className="card info-card sales-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Expired <span>| Passports</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-exclamation-triangle"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.expired_passports}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}


                        {PercentageData &&
                        PercentageData.expired !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.expired}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.expired > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.expired < 0 ? (
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
              <div className="card info-card sales-card">
                <div className="card-body">
                  <h5 className="card-title">
                    Collected <span>| Passports</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-box-arrow-in-up"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.collected_passports}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}

                      <div className="ps-3">
                        {PercentageData &&
                        PercentageData.collected !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.collected}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.collected > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.collected < 0 ? (
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
                  <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={350} />
                 
                                
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

export default Passport_overview;
