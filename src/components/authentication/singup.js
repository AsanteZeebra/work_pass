import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ClipLoader } from "react-spinners";

// Define the validation schema using yup
const schema = yup.object().shape({
  fullname: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  repeatPassword: yup.string().oneOf([yup.ref('password'), null], "Passwords must match").required("Confirm Password is required")
});

const Create_Account = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://main.fremikeconsult.com/wp_api/authentication/create_user.php",
        {
          fullname: data.fullname,
          email: data.email,
          password: data.password
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
          navigate("/login"); // Navigate to login page after 3 seconds
        }, 3000);
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
      <main>
        <div className="container">
          <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                  <div className="d-flex justify-content-center py-4">
                    <Link to="/" className="logo d-flex align-items-center w-auto">
                      <img src="assets/img/logo.png" alt="" />
                      <span className="d-none d-lg-block">WorkPass</span>
                    </Link>
                  </div>

                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="pt-4 pb-2">
                        <h5 className="card-title text-center pb-0 fs-4">Create an Account</h5>
                        <p className="text-center small">Enter your personal details to create account</p>
                      </div>

                      <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
                        <div className="col-12">
                          <label className="form-label">Your Name</label>
                          <input type="text" name="fullname" className="form-control" id="yourName" {...register("fullname")} />
                          <p className="text-danger">{errors.fullname?.message}</p>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Your Email</label>
                          <input type="email" name="email" className="form-control" id="yourEmail" {...register("email")} />
                          <p className="text-danger">{errors.email?.message}</p>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Password</label>
                          <input type="password" name="password" className="form-control" id="yourPassword" {...register("password")} />
                          <p className="text-danger">{errors.password?.message}</p>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Confirm Password</label>
                          <input type="password" name="repeatPassword" className="form-control" id="repeatPassword" {...register("repeatPassword")} />
                          <p className="text-danger">{errors.repeatPassword?.message}</p>
                        </div>

                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                            {loading ? <ClipLoader size={20} color={"#fff"} /> : "Create Account"}
                          </button>
                        </div>
                        <div className="col-12">
                          <p className="small mb-0">Already have an account? <Link to="/login">Log in</Link></p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <ToastContainer />
    </>
  );
};

export default Create_Account;