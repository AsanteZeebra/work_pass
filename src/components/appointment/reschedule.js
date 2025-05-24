import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; // Fixed import
import axios from "axios";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { set, useForm } from "react-hook-form";

const Reschedule_appointment = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Retrieve employee_name and emp_salary from localStorage
  const [appointment_id, setAppointmentID] = useState(
    localStorage.getItem("app_id") || ""
  );
  const [Fullname, setFullname] = useState(
    localStorage.getItem("app_name") || "",
   
  );
  
  const [Destination, setDestination] = useState(
    localStorage.getItem("app_destination") || ""
  );
  const [type, setType] = useState(
    localStorage.getItem("app_type") || ""
  );

  const [email, setEmail] = useState(
    localStorage.getItem("app_email") || ""
  );
  const [telephone, setTelephone] = useState(
    localStorage.getItem("app_telephone") || ""
  );
  const [date, setDate] = useState(
    localStorage.getItem("app_date") || ""
  );
    const [time, setTime] = useState(
    localStorage.getItem("app_time") || ""
  );

 

  const schema = yup.object().shape({
    fullname: yup.string().required("Name is required"),
    destination: yup.string().required("destination not found"),
    telephone: yup.string().required("telephone number is required"),
    appointment_id: yup.string().required("Appointment ID is required"),
    app_type: yup.string().required("Appointment Type is required"),
    app_date: yup.string().required("Appointment Date is required"),
    app_time: yup.string().required("Appointment Time is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
 
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/wp_api/appointment/reschedule.php",
        {
        appointment_id: data.appointment_id,
        app_date: data.app_date,
        app_time: data.app_time,
        fullname: data.fullname,
        email: data.email,
          
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
          navigate("/rec_appointment"); // Navigate to payroll page after 3 seconds
        }, 5000);
        
      } else {
        toast.error(response.data.message, { position: "top-right" });
        setLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred!", { position: "top-right" });
      setLoading(false);
    }
  };
  return (
    <>
      <div className="pagetitle">
        <h1>Appointment</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">reschedule_appointment</a>
            </li>
            <li className="breadcrumb-item active">reschedule</li>
          </ol>
        </nav>
      </div>
      <div className="row align-items-center justify-content-center">
        <div className="col-lg-12">
          <div className="row align-items-center justify-content-center">
            <div className="col-6">
              <br />
              <br />
              <div className="card recent-sales overflow-auto justify-content-center">
                <div className="card-body justify-content-center">
                  <h5 className="card-title">Reschedule Appointment {date}  {time}</h5>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="row mb-3">
                        <div className="form-group">
                          <label
                            htmlFor="employeeName"
                            className="col-sm-2 col-form-label"
                          >
                           Fullname
                          </label>
                          <div className="">
                            <input
                              type="text"
                              className="form-control"
                              id="employeeName"
                              placeholder="Employee Name"
                              value={Fullname} // Set value from localStorage
                              onChange={(e) => setFullname(e.target.value)} // Update state on change
                              required
                              disabled
                              {...register("fullname")}
                            />
                            <p className="text-danger">
                              {errors.fullname?.message}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6" hidden>
                          <div className="form-group">
                            <label
                              htmlFor="empSalary"
                              className="col-form-label"
                            >
                              Destination
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="destination"
                                placeholder="destination"
                                value={Destination} // Set value from localStorage
                                onChange={(e) => setDestination(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("destination")}
                              />
                              <p className="text-danger">
                                {errors.destination?.message}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="col-6" hidden>
                          <div className="form-group">
                            <label
                              htmlFor="empSalary"
                              className="col-form-label"
                            >
                              Appointment Type
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="appointmentType"
                                placeholder="Appointment Type"
                               
                                value={type} // Set value from localStorage
                                onChange={(e) => setType(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("app_type")}
                              />
                              <p className="text-danger">
                                {errors.app_type?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-6" hidden>
                          <div className="form-group">
                            <label
                              htmlFor="empSalary"
                              className="col-form-label"
                            >
                              Telephone
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="telephone"
                                placeholder="Telephone"
                               
                                value={telephone} // Set value from localStorage
                                onChange={(e) => setTelephone(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("telephone")}
                              />
                              <p className="text-danger">
                                {errors.telephone?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="form-group">
                            <label
                              htmlFor="paymentMethod"
                              className="col-form-label"
                            >
                            New Date
                            </label>
                            <div className="">
                              <input
                                type="date"
                                className="form-control"
                                id="AppointmentDate"
                                placeholder="Appointment Date"
                               
                                onChange={(e) => setDate
                                    
                                (e.target.value)} // Update state on change
                                required
                                
                                {...register("app_date")}
                              />
                              <p className="text-danger">
                                {errors.app_date?.message}
                              </p>
                            </div>
                          </div>
                        </div>

                         <div className="col-6">
                          <div className="form-group">
                            <label
                              htmlFor="paymentMethod"
                              className="col-form-label"
                            >
                            New Time
                            </label>
                            <div className="">
                              <input
                                type="time"
                                className="form-control"
                                id="AppointmentTime"
                                placeholder="Appointment Time"
                               
                                onChange={(e) => setTime
                                
                                (e.target.value)} // Update state on change
                                required
                                
                                {...register("app_time")}
                              />
                              <p className="text-danger">
                                {errors.app_time?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                          
                           <div className="col-6" hidden>
                          <div className="form-group">
                            <label
                              htmlFor="paymentMethod"
                              className="col-form-label"
                            >
                            Appointment ID
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="AppointmentID"
                                placeholder="Appointment ID"
                                value={appointment_id} // Set value from localStorage
                                onChange={(e) => setDate
                                    
                                (e.target.value)} // Update state on change
                                required
                                disabled
                                
                                {...register("appointment_id")}
                              />
                              <p className="text-danger">
                                {errors.appointment_id?.message}
                              </p>
                            </div>
                          </div>
                        </div>


                         <div className="col-6" hidden>
                          <div className="form-group">
                            <label
                              htmlFor="paymentMethod"
                              className="col-form-label"
                            >
                            Email
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="email"
                                placeholder="Email"
                                value={email} // Set value from localStorage
                                onChange={(e) => setEmail
                                    
                                (e.target.value)} // Update state on change
                                required
                                disabled
                                
                                {...register("email")}
                              />
                              <p className="text-danger">
                                {errors.email?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                   

                      <br />
                      <br />

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "50%", marginLeft: "30%" }}
                        disabled={loading}
                      >
                        {loading ? (
                          <ClipLoader size={20} color={"#fff"} />
                        ) : (
                          "Submit"
                        )}
                      </button>
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

export default Reschedule_appointment;
