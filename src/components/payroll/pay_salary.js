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

const Pay_salary = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Retrieve employee_name and emp_salary from localStorage
  const [employeeName, setEmployeeName] = useState(
    localStorage.getItem("emp_name") || ""
  );
  const [Salary, setEmpSalary] = useState(
    localStorage.getItem("emp_salary") || "",
   
  );
  
  const [Department, setDeaprtment] = useState(
    localStorage.getItem("emp_department") || ""
  );
  const [Position, setPosition] = useState(
    localStorage.getItem("emp_position") || ""
  );

  const [Currency, setCurrency] = useState(
    localStorage.getItem("currency") || ""
  );

  const [Month_year, setMonth_year] = useState(
    localStorage.getItem("emp_month_year") || ""
  );

  const [employeeID, setEployeeID] = useState(
    localStorage.getItem("emp_id") || ""
    );
    const [Email, setEmail] = useState(
        localStorage.getItem("emp_email") || ""
        );

  const schema = yup.object().shape({
    fullname: yup.string().required("Name is required"),
    department: yup.string().required("Department is required"),
    position: yup.string().required("Position is required"),
    method: yup.string().required("Payment method is required"),
    currency: yup.string().required("Currency is required"),
    motnh_year: yup.string().required("Month and Year is required"),
    salary: yup.number().required("Salary amount is required"),
    employee_id: yup.string().required("Employee ID is required"),
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/wp_api/employees/pay_salary.php",
        {
          month_year: data.motnh_year,
         employee_id: data.employee_id,
         method: data.method,
            salary: data.salary,
            currency: data.currency,
            fullname: data.fullname,
            department: data.department,
            position: data.position,
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
          navigate("/payroll"); // Navigate to payroll page after 3 seconds
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
        <h1>Payroll</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="index.html">Pay_salary</a>
            </li>
            <li className="breadcrumb-item active">record_salary</li>
          </ol>
        </nav>
      </div>
      <div className="row align-items-center justify-content-center">
        <div className="col-lg-12">
          <div className="row align-items-center justify-content-center">
            <div className="col-9">
              <br />
              <br />
              <div className="card recent-sales overflow-auto justify-content-center">
                <div className="card-body justify-content-center">
                  <h5 className="card-title">Record Salary</h5>

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
                            Employee Name
                          </label>
                          <div className="">
                            <input
                              type="text"
                              className="form-control"
                              id="employeeName"
                              placeholder="Employee Name"
                              value={employeeName} // Set value from localStorage
                              onChange={(e) => setEmployeeName(e.target.value)} // Update state on change
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
                        <div className="col-6">
                          <div className="form-group">
                            <label
                              htmlFor="empSalary"
                              className="col-form-label"
                            >
                              Department
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="department"
                                placeholder="Department"
                                value={Department} // Set value from localStorage
                                onChange={(e) => setDeaprtment(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("department")}
                              />
                              <p className="text-danger">
                                {errors.department?.message}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="form-group">
                            <label
                              htmlFor="empSalary"
                              className="col-form-label"
                            >
                              Position
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="position"
                                placeholder="Position"
                                value={Position} // Set value from localStorage
                                onChange={(e) => setPosition(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("position")}
                              />
                              <p className="text-danger">
                                {errors.position?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-6">
                          <div className="form-group">
                            <label
                              htmlFor="empSalary"
                              className="col-form-label"
                            >
                              Salary Amount
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="salary"
                                placeholder="Salary Amount"
                                value={Salary} // Set value from localStorage
                                onChange={(e) => setEmpSalary(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("salary")}
                              />
                              <p className="text-danger">
                                {errors.salary?.message}
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
                              Payment Method
                            </label>
                            <div className="">
                              <select
                                className="form-select"
                                id="paymentMethod"
                                aria-label="Default select example"
                                {...register("method")}
                              >
                                <option value="" selected>
                                  --Select Payment Method--
                                </option>
                                <option value="Bank Transfer">
                                  Bank Transfer
                                </option>
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Mobile Money">
                                  Mobile Money
                                </option>
                              </select>
                              <p className="text-danger">
                                {errors.method?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-6">
                          <div className="form-group">
                            <label
                              htmlFor="paymentMethod"
                              className="col-form-label"
                            >
                              Currency
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="currency"
                                placeholder="Currency"
                                value={Currency} // Set value from localStorage
                                onChange={(e) => setCurrency(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("currency")}
                              />
                              <p className="text-danger">
                                {errors.currency?.message}
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
                              Month_Year
                            </label>
                            <div className="">
                              <input
                                type="text"
                                className="form-control"
                                id="month_year"
                                placeholder="month_year"
                                value={Month_year} // Set value from localStorage
                                onChange={(e) => setMonth_year(e.target.value)} // Update state on change
                                required
                                disabled
                                {...register("motnh_year")}
                              />
                              <p className="text-danger">
                                {errors.motnh_year?.message}
                              </p>
                            </div>
                          </div>

                          <input
                                type="text"
                                className="form-control"
                                id="employee_id"
                                placeholder="employee_id"
                                value={employeeID} // Set value from localStorage
                                onChange={(e) => setEployeeID(e.target.value)} // Update state on change
                                required hidden
                                disabled
                                {...register("employee_id")}
                              />
                              <input
                                type="text"
                                className="form-control"
                                id="email"
                                placeholder="email"
                                value={Email} // Set value from localStorage
                                onChange={(e) => setEmail(e.target.value)} // Update state on change
                                required hidden
                                disabled
                                {...register("email")}
                              />
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

export default Pay_salary;
