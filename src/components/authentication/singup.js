import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";

const Create_Account = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register",
        {
          name: data.fullname,
          email: data.email,
          password: data.password,
          password_confirmation: data.repeatPassword,
          role: data.role,
        },
        {
          headers: { "Accept": "application/json" },
        }
      );

      if (response.status === 201) {
        toast.success(response.data.message, { position: "top-right" });
        setLoading(false);
        reset();
        setTimeout(() => {
          navigate("/login");
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
                          <input
                            type="text"
                            name="fullname"
                            className="form-control"
                            id="yourName"
                            {...register("fullname", { required: "Full name is required" })}
                          />
                          <p className="text-danger">{errors.fullname?.message}</p>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Your Email</label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            id="yourEmail"
                            {...register("email", { required: "Email is required" })}
                          />
                          <p className="text-danger">{errors.email?.message}</p>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Role</label>
                          <select className="form-select" name="role" {...register("role", { required: "Role is required" })}>
                            <option value="">-Select Role-</option>
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                            <option value="Manager">Manager</option>
                            <option value="Reception">Reception</option>
                            <option value="Security">Security</option>
                            <option value="HR">HR</option>
                            <option value="Accountant">Accountant</option>
                          </select>
                          <p className="text-danger">{errors.role?.message}</p>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            name="password"
                            className="form-control"
                            id="yourPassword"
                            {...register("password", { required: "Password is required" })}
                          />
                          <p className="text-danger">{errors.password?.message}</p>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            name="repeatPassword"
                            className="form-control"
                            id="repeatPassword"
                            {...register("repeatPassword", { required: "Confirm password is required" })}
                          />
                          <p className="text-danger">{errors.repeatPassword?.message}</p>
                        </div>

                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                            {loading ? <ClipLoader size={20} color={"#fff"} /> : "Create Account"}
                          </button>
                        </div>
                        <div className="col-12">
                          <p className="small mb-0">
                            Already have an account? <Link to="/login">Log in</Link>
                          </p>
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