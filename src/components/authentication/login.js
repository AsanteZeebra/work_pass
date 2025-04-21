import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
    setLoading(true); // Set loading to true when form is submitted
    try {
        const response = await fetch("http://main.fremikeconsult.com/authentication/authenticate.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.token) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("username", result.username); // Store username in local storage
            localStorage.setItem("role", result.role); // Store user ID in local storage
            //console.log("Login successful:", result);
            //toast.success("Login successful!", { position: "top-right" });
            navigate("/dashbaord"); // Navigate to Dashboard after successful login
        } else {
            toast.error(result.message || "Login failed.", { position: "top-right" });
        }
    } catch (error) {
        toast.error("Something went wrong. Please try again.", { position: "top-right" });
        //console.error("Error:", error);
    } finally {
        setLoading(false); // Set loading to false when API call is completed
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
                  <span
                    className="d-none d-lg-block"
                    style={{ color: "#991C26" }}
                  >
                    Work{" "}
                  </span>{" "}
                  <span
                    className="d-none d-lg-block"
                    style={{ color: "#404042" }}
                  >
                    Pass{" "}
                  </span>
                </Link>
              </div>

              <div className="card mb-3">
                <div className="card-body">
                  <div className="pt-4 pb-2">
                    <h5 className="card-title text-center pb-0 fs-4">
                      Login to Your Account
                    </h5>
                    <p className="text-center small">
                      Enter your Email & Password to login
                    </p>
                  </div>

                  <form className="row g-3 " onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-12">
                      <label for="email" className="form-label">
                        Email
                      </label>
                      <div className="input-group ">
                        <input
                          type="email"
                          {...register("email")}
                          className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
                          id="exampleInputEmail1"
                          placeholder="Email"
                        />
                         {errors.email && <div className="invalid-feedback">{errors.email.message} </div>}
                               
                      </div>
                    </div>

                    <div className="col-12">
                      <label for="yourPassword" className="form-label">
                        Password
                      </label>
                      <input
                         type="password"
                         {...register("password")}
                         className={`form-control form-control-lg ${errors.password ? "is-invalid" : ""}`}
                         id="exampleInputPassword1"
                         placeholder="Password"
                      />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                               
                    </div>

                    <div className="col-12">
                    <button type="submit" className="btn  btn-primary w-100" disabled={loading}>
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
