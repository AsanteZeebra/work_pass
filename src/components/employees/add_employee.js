import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";

const Add_employee = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
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
          "http://main.fremikeconsult.com/wp_api/authentication/verify_token.php",
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

  const handleViewProfile = (uid) => {
    localStorage.setItem("passport_no", uid);
  };


  // Define the modal form validation schema using yup
  const schema = yup.object().shape({
    fullname: yup.string().required("Name is required"),
    dob: yup.string().required("Date of birth is required"),
    gender: yup.string().required("Please choose gender"),
    telephone: yup.string().required("Telephone is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    department: yup.string().required("Department is required"),
    position: yup.string().required("Position is required"),
    address: yup.string().required("Address is required"),
    currency: yup.string().required("currency is required"),
    salary: yup.string().required("salary is required"),

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
        "http://main.fremikeconsult.com/wp_api/employees/add_employee.php",
        {
          fullname: data.fullname,
          dob: data.dob,
          gender: data.gender,
          address: data.address,
          telephone: data.telephone,
          email: data.email,
          department: data.department,
          position: data.position,
          salary: data.salary,
          currency: data.currency,

        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.status === "success") {
        toast.success(response.data.message, { position: "top-right" });
       
        setLoading(false);
        reset(); // Reset the form after successful submission
        setTimeout(() => {
          navigate("/employee_list"); // Redirect to the employees page after 2 seconds
        }, 2000);
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


  return (
    <>
      <div className="pagetitle">
        <h1>Employees</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Employee_list</a>
            </li>
            <li className="breadcrumb-item active">add_employee</li>
          </ol>
        </nav>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="card-body">
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row" style={{ marginTop: "20px" }}>
                      

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Employee Name:</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="Enter fullname" name="fullname"
                              {...register("fullname")}
                            />
                             <p className="text-danger">
                                    {errors.fullname?.message}
                                  </p>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Date of brth:</b>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="dob" name="dob"
                              {...register("dob")}
                              
                            />
                             <p className="text-danger">
                                    {errors.dob?.message}
                                  </p>
                          </div>
                        </div>

                      </div>

                      <div className="row" style={{ marginTop: "20px" }}>
                      
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Gender:</b>
                            </label>
                            <select
                              className="form-select"
                              style={{ marginTop: "10px" }}
                              aria-label="Default select example" name="gender"
                              {...register("gender")}
                            >
                            
                              <option value={""}>--select gender--</option>
                              <option value={"Male"}>Male</option>
                              <option value={"Female"}>Female</option>
                            </select>
                            <p className="text-danger">
                                    {errors.gender?.message}
                                  </p>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Telephone:</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="telephone" name="telephone"
                              {...register("telephone")}
                            />
                             <p className="text-danger">
                                    {errors.telephone?.message}
                                  </p>
                          </div>
                        </div>

                      </div>

                      <div className="row" style={{ marginTop: "20px" }}>
                       

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Email:</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="Email" name="email"
                              {...register("email")}
                            />
                             <p className="text-danger">
                                    {errors.email?.message}
                                  </p>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Department:</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="department" name="department"
                              {...register("department")}
                            />
                             <p className="text-danger">
                                    {errors.department?.message}
                                  </p>
                          </div>
                        </div>
                      </div>

                      <div className="row" style={{ marginTop: "20px" }}>
                     
                      <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Position:</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="Position" name="position"
                              {...register("position")}
                            />
                             <p className="text-danger">
                                    {errors.position?.message}
                                  </p>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Address:</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="Address" name="address"
                              {...register("address")}
                            />
                             <p className="text-danger">
                                    {errors.address?.message}
                                  </p>
                          </div>
                        </div>

                        
                      </div>

                      
                      <div className="row" style={{ marginTop: "20px" }}>
                     
                      <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Salary:</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="salary" name="salary"
                              {...register("salary")}
                            />
                             <p className="text-danger">
                                    {errors.salary?.message}
                                  </p>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>currency:</b>
                            </label>
                           <select className="form-select"     placeholder="currency" name="currency"
                              {...register("currency")} style={{ marginTop: "10px" }}>
                              <option value={""}>--select currency--</option>
                              <option value={"GHS"}>GHS</option>
                              <option value={"USD"}>USD</option>
                              <option value={"EUR"}>EUR</option>
                            </select>
                           
                           
                             <p className="text-danger">
                                    {errors.currency?.message}
                                  </p>
                          </div>
                        </div>

                        
                      </div>

<div className="row " style={{ marginTop: "40px" }}>
<button type="submit" className="btn btn-outline-primary" style={{width: "30%",marginLeft:"30%"}}>  {loading ? (
                                  <ClipLoader size={20} color={"#fff"} />
                                ) : (
                                  "Submit"
                                )}</button>
    </div>
                    </form>
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

export default Add_employee;
