import React, { useState } from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";

// Define the validation schema using yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Reset_Password = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

 

  const [loading, setLoading] = useState(false); // State variable for loading
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token'); // Get token from URL query parameters

  const handleRequestReset = async (data) => {
    setLoading(true); // Set loading to true when form is submitted
    try {
      const response = await axios.post(
        "http://main.fremikeconsult.com/wp_api/authentication/reset_Password.php",
        { token, email: data.email, password: data.password }
      );
      console.log("API response:", response.data); // Debugging log
      if (response.data.message) {
        console.log("Success message:", response.data.message); // Debugging log
        toast.success(response.data.message);
        reset(); // Reset the form after successful request
        setTimeout(() => {
          navigate("/login"); // Navigate to login page after successful reset
        }, 2000); // Delay navigation to allow toast to display
      } else if (response.data.error) {
        console.log("Error message:", response.data.error); // Debugging log
        toast.error(response.data.error);
      }
    } catch (error) {
      console.error("API error:", error.response?.data || error.message); // Debugging log
      toast.error(error.response?.data.error || "An error occurred");
    } finally {
      setLoading(false); // Set loading to false when API call is completed
    }
  };

  return (
    <div className="content-wrapper d-flex align-items-center auth px-0">
      <div className="row w-100 mx-0">
        <div className="col-lg-4 mx-auto">
          <div className="auth-form-light text-left py-5 px-4 px-sm-5">
            <div className="brand-logo">
              <img src="../../assets/img/wp1.png" alt="logo" style={{width:"200px"}} />
            </div>
            <h4>Reset your Password</h4>
            <h6 className="font-weight-light">Enter Your Email and New Password</h6>
            <form className="pt-3" onSubmit={handleSubmit(handleRequestReset)}>
              <div className="form-group mb-3">
                <input
                  type="email"
                  {...register("email")}
                  className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
                  id="exampleInputEmail1"
                  placeholder="Email"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>
              <div className="form-group mb-3">
                <input
                  type="password"
                  {...register("password")}
                  className={`form-control form-control-lg ${errors.password ? "is-invalid" : ""}`}
                  id="exampleInputPassword1"
                  placeholder="New Password"
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password.message}</div>
                )}
              </div>
              <div className="form-group mb-3">
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={`form-control form-control-lg ${errors.confirmPassword ? "is-invalid" : ""}`}
                  id="exampleInputConfirmPassword1"
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                )}
              </div>
              <div className="mt-3 d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reset_Password;