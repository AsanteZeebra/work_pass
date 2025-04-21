import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { ClipLoader } from "react-spinners";

// Define the validation schema using yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  passport_no: yup.string().required("Passport number is required"),
  name: yup.string().required("Full name is required"),
  request_type: yup.string().required("Please select a request type"),
  comment: yup.string().optional(),
});

const Request = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const savedValue = localStorage.getItem("fullname");
    const passValue = localStorage.getItem("passport_no");
    const emailValue = localStorage.getItem("email");

    console.log("Saved Values:", { savedValue, passValue, emailValue }); // Debugging

    if (savedValue && passValue && emailValue) {
      setValue("name", savedValue);
      setValue("passport_no", passValue);
      setValue("email", emailValue);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost/wp_api/passports/passport_request.php",
        {
          passport_no: data.passport_no,
          email: data.email,
          fullname: data.name,
          status: data.request_type,
          message: data.comment,
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
          window.location.href = "/passports_info"; // Redirect to the passport page    
}, 2000); // Redirect after 2 seconds
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
      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-6 d-flex flex-column align-items-center justify-content-center">
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title text-center pb-0 fs-4">
                    Request Passport
                  </h5>

                  <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-12">
                      <label htmlFor="yourname" className="form-label">
                        Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        readOnly
                        {...register("name")}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name.message}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="yourUsername" className="form-label">
                        Passport_no
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.passport_no ? "is-invalid" : ""
                        }`}
                        readOnly
                        {...register("passport_no")}
                      />
                      {errors.passport_no && (
                        <div className="invalid-feedback">
                          {errors.passport_no.message}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="yourEmail" className="form-label">
                        Your Email
                      </label>
                      <input
                        type="email"
                        className={`form-control ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        readOnly
                        {...register("email")}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email.message}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="requestType" className="form-label">
                        Request Type
                      </label>
                      <select
                        className={`form-select ${
                          errors.request_type ? "is-invalid" : ""
                        }`}
                        {...register("request_type")}
                      >
                        <option value="">-Select Request Type-</option>
                        <option value="Collected">Passport Collection</option>
                        <option value="Active">Return Passport</option>
                      </select>
                      {errors.request_type && (
                        <div className="invalid-feedback">
                          {errors.request_type.message}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="comment" className="form-label">
                        Reason for Request
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.comment ? "is-invalid" : ""
                        }`}
                        rows="3"
                        {...register("comment")}
                      ></textarea>
                      {errors.comment && (
                        <div className="invalid-feedback">
                          {errors.comment.message}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <ClipLoader
                              size={20}
                              color={"#fff"}
                              loading={true}
                            />
                            &nbsp;Processing...
                          </>
                        ) : (
                          "Request Passport"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer />
    </>
  );
};

export default Request;
