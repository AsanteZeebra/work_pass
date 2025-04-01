import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css";

const CustomerInfo = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
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

        console.log("Token is valid:", response.data);
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


  

  const [passportNo, setPassportNo] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [customerData,setCustomerData]=useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get passport number from localStorage
    const storedPassportNo = localStorage.getItem("passport_no");
    if (storedPassportNo) {
      setPassportNo(storedPassportNo);
      fetchCaseDetails(storedPassportNo);
      fetchcustomerDetails(storedPassportNo);
    } else {
      setError("Passport number not found in localStorage.");
    }
  }, []);

  const fetchCaseDetails = async (passportNo) => {
    try {
      const response = await axios.post(
        "http://localhost/wp_api/Clients/fetch_cases.php",
        { passport_no: passportNo }, // Send as POST body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.status === "success") {
        setCaseData(response.data.case);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case details. Please try again.");
    }
  };

  const fetchcustomerDetails = async (passportNo) => {
    try {
      const response = await axios.post("http://localhost/wp_api/Clients/fetch_customer_info.php",
        { passport_no: passportNo }, // Send as POST body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.status === "success") {
        setCustomerData(response.data.case);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case details. Please try again.");
    }
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
            <li className="breadcrumb-item active">Customer Info</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <div className="card overflow-auto">
          {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
            <div className="card-body">
              {caseData ?(


           
              <div style={{ margin: "30px" }}>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td>
                        <h4 style={{ fontWeight: "bold",fontSize:"20px" }}>Case ID: {caseData.case_id}</h4>
                      </td>
                      <td>
                        <span className="badge bg-warning">{caseData.case_attendant}</span>
                      </td>
                      <td>
                        <span className="badge bg-success">{caseData.status}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <span style={{fontSize: "13px"}}>Created at: 23rd March, 2025 2:15:02pm</span>
                <hr />
              </div>
   ): (
    <p> No case data available.</p>
  )}
              <div className="accordion accordion-flush" id="accordionFlushExample">
              {caseData ? (
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingOne">
                  <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                 <p> <b> {caseData.tittle}</b>  <small style={{fontSize: "10px"}}>{caseData.date_updated}</small></p>
                  </button>
                  </h2>
                  <div id="flush-collapseOne" className="accordion-collapse " aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                  <div className="accordion-body">
                        <p >{caseData.message}</p>
                    </div>
                  </div>
                </div>
                 ) : (
                  <p>No case data available.</p>
                )}
               

               <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingTwo">
                    <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseOne">
                   <strong>  Transactions</strong>
                    </button>
                  </h2>
                  <div id="flush-collapseTwo" className="accordion-collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                   <table className="table ">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Date</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Description</th>
                        <th scope="col">Status</th>
                      </tr>
                   </thead>
                   <tbody>
                    <tr>
                      <td>PM1255D698</td>
                      <td>23rd March, 2025</td>
                      <td>$200</td>
                      <td>Application Fee</td>
                      <td><span className="badge bg-success">Paid</span></td>
                    </tr>
                    <tr>
                      <td>PM1255D698</td>
                      <td>23rd March, 2025</td>
                      <td>$200</td>
                      <td>Application Fee</td>
                      <td><span className="badge bg-warning">Pending</span></td>
                    </tr>
                    <tr>
                      <td>PM1255D698</td>
                      <td>23rd March, 2025</td>
                      <td>$200</td>
                      <td>Application Fee</td>
                      <td><span className="badge bg-danger">Deined</span></td>
                    </tr>
                    <tr>
                      <td>PM1255D698</td>
                      <td>23rd March, 2025</td>
                      <td>$200</td>
                      <td>Application Fee</td>
                      <td><span className="badge bg-success">Paid</span></td>
                    </tr>               
                    </tbody>
                   </table>
                 
                  </div>
                </div>
              </div>

             
            </div>
              )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card overflow-auto">
          {customerData ?(
            <div className="card-body">
              <div className="mb-3">
                <b><i className="bi bi-globe"></i> Destination</b>
                <p>{customerData.country_of_interest}</p>
              </div>
              <hr />
              <div className="mb-3">
                <b><i className="bi bi-person-bounding-box"></i> Customer</b>
               <strong> <h3>{customerData.fullname} </h3></strong>
                <p>{customerData.Passport_no}</p>
                
              </div>
              <hr />
              <div className="mb-3">
                <b><i className="bi bi-person-rolodex"></i> Contact Info</b>
                <p>{customerData.email}</p>
                <p>{customerData.telephone}</p>
              </div>
              <hr />
              <div className="mb-3">
                <b><i className="bi bi-file-earmark-medical"></i> Application Type</b>
                <p>{customerData.application_type}</p>
               
              </div>

              <hr/>
           <div> 
           <button className="btn btn-outline-primary" title="Edit client infomation" style={{marginRight: "10px"}}><i className="bi bi-pen"></i> Edit</button>
            
            <button className="btn btn-outline-warning" title="Suspend Case till further Notice"><i className="bi bi-pause-circle"></i> Suspend</button>
            
            <button className="btn btn-outline-danger" title="Delete Case" style={{marginLeft:"10px"}}><i className="bi bi-trash3"></i> Delete</button>
          
          
           </div>
            </div>
             ) : (
              <p>No client data available.</p>
            )}
          
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default CustomerInfo;