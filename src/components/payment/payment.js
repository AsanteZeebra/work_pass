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

const Payment = () => {
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


  
  const [loading, setLoading] = useState(false);
 



  const [error, setError] = useState("");
  const [countData, SetCountData] = useState(null);
  const [PercentageData, SetPercentageData] = useState(null);

  const fetch_calculates = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/payment/count_payment.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        SetCountData({
          total_amount: response.data.total,
          invoices: response.data.total_invoices,
          refunds: response.data.total_refund,
          hold: response.data.total_hold,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case data. Please try again.");
    }
  };

  useEffect(() => {
    fetch_calculates();
    fecthPercentage();
  }, []);

  const fecthPercentage = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/payment/payment_percentage.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        SetPercentageData({
          paid: response.data.Paid?.percentage_change || 0,
          invoice: response.data.Invoice?.percentage_change || 0,
          refund: response.data.Refunded?.percentage_change || 0,
          hold: response.data.Hold?.percentage_change || 0,
        
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
        <h1>Payment</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">payments</a>
            </li>
            <li className="breadcrumb-item active">payment_overview</li>
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
                    Payments <span>| Today</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-check2-circle"></i>
                    </div>
                    <div className="ps-3">
                     {countData ? (
                        <h6>{countData.total_amount}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}
                     
                       {PercentageData &&
                        PercentageData.paid !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.paid}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.paid > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.paid < 0 ? (
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
                    Invoices <span>| Today</span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-arrow-clockwise"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.invoices}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}


                        {PercentageData &&
                        PercentageData.invoice !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.invoice}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.invoice > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.invoice < 0 ? (
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
                    Refunds <span>| Today </span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-exclamation-triangle"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.refunds}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}


                        {PercentageData &&
                        PercentageData.refund !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.refund}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.refund > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.refund < 0 ? (
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
                    On Hold <span>|Today </span>
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-box-arrow-in-up"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.hold}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}

                      <div className="ps-3">
                        {PercentageData &&
                        PercentageData.hold !== undefined ? (
                          <span className="text-success small pt-1 fw-bold">
                            {PercentageData.hold}%
                          </span>
                        ) : (
                          <p>No percentage data available.</p>
                        )}

                        {PercentageData && PercentageData.hold > 0 ? (
                          <span className="text-muted small pt-2 ps-1">
                            <i
                              className="bi bi-arrow-up-right-square"
                              style={{ color: "#269746" }}
                            ></i>
                          </span>
                        ) : PercentageData && PercentageData.hold < 0 ? (
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
                    Reports <span>/This year </span>
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

export default Payment;
