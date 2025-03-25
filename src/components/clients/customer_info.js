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
            <div className="card-body">
              <div style={{ margin: "30px" }}>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td>
                        <h4 style={{ fontWeight: "bold" }}>Customer ID: 2565989841D</h4>
                      </td>
                      <td>
                        <span className="badge bg-warning">Payment Pending</span>
                      </td>
                      <td>
                        <span className="badge bg-success">Active</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <span>Created at: 23rd March, 2025 2:15:02pm</span>
                <hr />
              </div>

              <div className="accordion accordion-flush" id="accordionFlushExample">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingOne">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                   <b> Processing</b> <span></span>
                    </button>
                  </h2>
                  <div id="flush-collapseOne" className="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                    <div className="accordion-body">
                        <p >Passport, polic clearance and passport together with the order form has been submitted successflly for further processing</p>
                         </div>
                 
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="flush-headingTwo">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                   <b> Documens verification</b>
                    </button>
                  </h2>
                  <div id="flush-collapseTwo" className="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                    <div className="accordion-body">
                        <p>Documens has been forward to additioal verifacation and arrangemnt and </p>
                    </div>
                  </div>
                </div>
           <div className="col-sm-12">
           <button className="btn btn-outline-primary" style={{width: "100%"}}>Add update</button>
           </div>
               
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card overflow-auto">
            <div className="card-body">
              <div className="mb-3">
                <b>Notes</b>
                <p>Sent for validation</p>
              </div>
              <hr />
              <div className="mb-3">
                <b>Customer</b>
                <p>Asante Michael</p>
                <p>G23654789</p>
                <p>2 cases in progress</p>
              </div>
              <hr />
              <div className="mb-3">
                <b>Contact Info</b>
                <p>nanakweku608@gmail.com</p>
                <p>+233531641798</p>
              </div>
              <hr />
              <div className="mb-3">
                <b>Address</b>
                <p>GZ-162-2444 Naomi Street</p>
                <p>Kumasi Tanoso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default CustomerInfo;