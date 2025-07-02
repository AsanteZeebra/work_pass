import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";

// Define the validation schema using yup
const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
});

const navigate = useNavigate();
const [loading, setLoading] = useState(false); // State variable for loading

const onSubmit = async (data) => {
    setLoading(true);
    try {
        const response = await axios.post(
            "http://localhost:8000/api/login", // Laravel API endpoint
            {email: data.email,
            password: data.password,},

            {
                headers: { "Accept": "application/json" },
                
            }
        );

        const result = response.data;

        if (result.token) {
            // Store token and user details in localStorage
            localStorage.setItem("token", result.token);
            localStorage.setItem("username", result.user.name); // Adjust as per your user object
            localStorage.setItem("role", result.user.role);     // Adjust as per your user object

            // Navigate based on user role
            if (result.user.role === "Admin") {
                navigate("/dashbaord");
            } else if (result.user.role === "Reception") {
                navigate("/Reception");
            } else {
                navigate("/user-dashboard");
            }
        } else {
            toast.error(result.message || "Login failed.", { position: "top-right" });
        }
    } catch (error) {
        toast.error(
            error.response?.data?.message || "Something went wrong. Please try again.",
            { position: "top-right" }
        );
        console.error("Error:", error);
    } finally {
        setLoading(false);
    }
};
  return (
    <>
      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
              <div className="d-flex justify-content-center py-4">
                <Link
                  to="/login"
                  className="logo d-flex align-items-center w-auto"
                >
                <img src="assets/img/wp1.png" alt="" className="img-fluid" style={{ maxWidth: "250px" }} />
                </Link>
              </div>

              <div className="card mb-3">
                <div className="card-body">
                  <div className="pt-4 pb-2">
                    <h5 className="card-title text-center pb-0 fs-4">
                      SIGN IN
                    </h5>
                   
                  </div>

                  <form className="row g-3 " onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-12">
                     <b> <label htmlFor="email" className="form-label">
                        Email
                      </label></b>
                      <div className="input-group ">
                        <input
                          type="email"
                          {...register("email")}
                          className={`form-control form-control ${errors.email ? "is-invalid" : ""}`}
                          id="exampleInputEmail1"
                          placeholder="Email"
                        />
                         {errors.email && <div className="invalid-feedback">{errors.email.message} </div>}
                               
                      </div>
                    </div>

                    <div className="col-12">
                     <b> <label htmlFor="yourPassword" className="form-label">
                        Password
                      </label></b>
                      <input
                         type="password"
                         {...register("password")}
                         className={`form-control form-control ${errors.password ? "is-invalid" : ""}`}
                         id="exampleInputPassword1"
                         placeholder="Password"
                      />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                               
                    </div>

                    <div className="col-12">
                    <button type="submit" className="btn  btn-outline-primary w-100 " disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            "SIGN IN"
                                        )}
                                    </button>
                    </div>
                    <div className="col-12">
                      <p className="small mb-0">
                        Don't have account?{" "}
                        <Link to={"/singup"}>
                          Create an account
                        </Link>
                      </p>
                    </div>
                  </form>
                  <ToastContainer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
