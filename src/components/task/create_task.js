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

const Create_task = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [staffData, setStaffData] = useState(null);

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
    task_name: yup.string().required("Task name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    deadline: yup.string().required("Deadline is required"),
    description: yup.string().required("Description is required"),
    urgent: yup.string().required("Urgency is required"),

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
        "http://localhost/wp_api/tasks/create_task.php",
        {
            email: data.email,
            task_name: data.task_name,
            deadline: data.deadline,
            description: data.description,
            urgent: data.urgent,
         
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
          navigate("/tasks"); // Redirect to the employees page after 2 seconds
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

    useEffect(() => { 
    fetchStaffInfo();
  }, []); // Fetch staff info on component mount
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
            <div className="col-9 mx-auto">
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
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label>
                              <b>Task Name</b>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="Task Tittle"
                              name="task_name"
                              {...register("task_name")}
                            />
                            <p className="text-danger">
                              {errors.task_name?.message}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="row" style={{ marginTop: "20px" }}>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Assign To:</b>
                            </label>
                            <select
                              className="form-select"
                              style={{ marginTop: "10px" }}
                              aria-label="Default select example"
                              name="email"
                              {...register("email")}
                            >
                              <option value={""}>--select staff--</option>
                               {staffData && staffData.length > 0 ? (
                                      staffData.map((staff, index) => (
                                        <option
                                          key={index}
                                          value={staff.email}
                                        >
                                         {staff.fullname}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="" disabled>
                                        No Staff data available
                                      </option>
                                    )}
                            </select>
                            <p className="text-danger">
                              {errors.email?.message}
                            </p>
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>
                              <b>Deadline:</b>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              style={{ marginTop: "10px" }}
                              placeholder="deadline"
                              name="deadline"
                              {...register("deadline")}
                            />
                            <p className="text-danger">
                              {errors.deadline?.message}
                            </p>
                          </div>
                        </div>
                      </div>

                     

                     

                      <div className="row" style={{ marginTop: "20px" }}>
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label>
                              <b>Description:</b>
                            </label>
                           <textarea className="form-control"
                            style={{ marginTop: "10px" }}
                              placeholder="Task Description"
                              name="description"
                            {...register("description")}
                             
                            >

                           </textarea>
                            <p className="text-danger">
                              {errors.description?.message}
                            </p>
                          </div>
                        </div>

                      
                      </div>

                       <div className="row" style={{ marginTop: "20px" }}>
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label>
                              <b>Urgent:</b>
                            </label>
                          <select className="form-select"
                            style={{ marginTop: "10px" }}
                              aria-label="Default select example"
                              name="urgent"
                              {...register("urgent")}
                            >
                              <option value="">--select urgent--</option>
                              <option value="Very Urgent">Yes</option>
                              <option value="Not Urgent">No</option>
                            </select>
                            <p className="text-danger">
                              {errors.urgent?.message}
                            </p>
                           
                          </div>
                        </div>

                      
                      </div>

                      <div className="row " style={{ marginTop: "40px" }}>
                        <button
                          type="submit"
                          className="btn btn-outline-primary"
                          style={{ width: "60%", marginLeft: "20%" }}
                        >
                          {" "}
                          {loading ? (
                            <ClipLoader size={20} color={"#fff"} />
                          ) : (
                            "Create Task"
                          )}
                        </button>
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

export default Create_task;
