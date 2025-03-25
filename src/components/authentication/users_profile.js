import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";


// Define the validation schema using yup
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
    role: yup
    .string()
    .required("Role is required"),
});




 
const UsersProfile = () => {

 
    const [status, setStatus] = useState({
      activate: false,
      deactivate: false,
      suspend: false,
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
      const { name, checked } = e.target;
      setStatus((prev) => {
        const newState = { ...prev, [name]: checked };
  
        // Prevent conflicting selections
        if (newState.activate && (newState.deactivate || newState.suspend)) {
          setError("You cannot activate and deactivate/suspend at the same time.");
          return prev; // Keep the previous state
        } else if (newState.deactivate && (newState.activate || newState.suspend)) {
          setError("You cannot deactivate and activate/suspend at the same time.");
          return prev;
        } else if (newState.suspend && (newState.activate || newState.deactivate)) {
          setError("You cannot suspend and activate/deactivate at the same time.");
          return prev;
        } else {
          setError(""); // Clear error if valid
          return newState;
        }
      });
    };
  

  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token"); // Remove token from localStorage
    localStorage.removeItem("username"); // Remove username from localStorage
    localStorage.removeItem("uid"); // Remove user_id from localStorage
   localStorage.clear(); // Clear all items from localStorage
    setToken(null); // Set token state to null
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
        console.error("Token validation error:", error);
        toast.error("Token validation error");
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
        toast.error("Error decoding token");
        handleLogout();
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate, handleLogout]); //  handleLogout is included

  useEffect(() => {
    const userId = localStorage.getItem("uid"); // Retrieve user_id from localStorage

    if (!userId) {
      toast.error("User ID not found in local storage");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost/wp_api/authentication/user_profile.php?user_id=${userId}`
        );
        if (response.data.status === "success") {
          setUser(response.data.user);
          setPreview(response.data.user.profile_photo); // Set the preview to the user's profile photo
        } else {
          toast.error(response.data.message);
        }
      } catch (err) {
        toast.error("Failed to fetch user data");
      }
    };

    fetchUserProfile();
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file)); // Show preview before upload
  }, []);

  const handleUpload = () => {
    const userId = localStorage.getItem("uid");
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    if (!selectedFile) {
      toast.error("No file selected. Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("profile_photo", selectedFile);

    setUploading(true);
    axios
      .post(
        `http://localhost/wp_api/authentication/upload_profile.php?user_id=${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then((response) => {
        toast.success(response.data.message);
        console.log(response.data);
        setUser((prevUser) => ({
          ...prevUser,
          profile_photo: response.data.profile_photo,
        }));
        setPreview(response.data.profile_photo); // Update the preview with the uploaded photo URL
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxFiles: 1,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Add reset function
  } = useForm({
    resolver: yupResolver(schema),
  });

  
  const [loading, setLoading] = useState(false); // State variable for loading

  const handleRequestReset = async (data) => {
    setLoading(true); // Set loading to true when form is submitted
    try {
      const response = await axios.post(
        "http://localhost/wp_api/authentication/request_reset.php",
        { email: data.email }
      );
      console.log("API response:", response.data); // Debugging log
      if (response.data.message) {
        console.log("Success message:", response.data.message); // Debugging log
        toast.success(response.data.message);
        reset(); // Reset the form after successful request
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

  const handleRoleChange = async (data) => {
    setLoading(true); // Set loading to true when form is submitted
    try {
    
      const response = await axios.post(
        "http://localhost/wp_api/authentication/change_role.php",
        { email: data.email }
      );
      console.log("API response:", response.data); // Debugging log
      if (response.data.message) {
        toast.success(response.data.message);
        console.log("Success message:", response.data.message); // Debugging log
      
        reset(); // Reset the form after successful request
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
    <>
      <ToastContainer />
      <div className="pagetitle">
        <h1>Profile</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/dashbaord">Home</Link>
            </li>
            <li className="breadcrumb-item">Users</li>
            <li className="breadcrumb-item active">Profile</li>
          </ol>
        </nav>
      </div>

      <div
        className="modal fade"
        id="mdv"
        tabIndex="-1"
        aria-labelledby="profileUploadModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg rounded-3">
            <div className="modal-header  text-white">
              <h5 className="modal-title" id="profileUploadModal">
                Change Profile Photo
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-center">
              <div
                {...getRootProps({
                  className:
                    "dropzone border rounded p-4 mb-3 d-flex flex-column align-items-center bg-light",
                })}
                style={{ cursor: "pointer" }}
              >
                <input {...getInputProps()} />
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                ) : (
                  <p className="text-muted">
                    Drag & drop an image here, or click to select
                  </p>
                )}
              </div>
              {selectedFile && (
                <p className="text-success">
                  <strong>Selected file:</strong> {selectedFile.name}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="section profile">
        <div className="row">
          <div className="col-xl-4">
            <div className="card">
              <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                {user && user.photo && (
                  <img
                    src={`http://localhost/wp_api/uploads/${user.photo}`}
                    alt="profile"
                  />
                )}
                <h2>{user ? user.fullname : "Guest"}</h2>
                <h3>{user ? user.uid : ""}</h3>
                <div className="social-links mt-2">{user && user.email}</div>
              </div>
            </div>
          </div>

          <div className="col-xl-8">
            <div className="card">
              <div className="card-body pt-3">
                <ul className="nav nav-tabs nav-tabs-bordered">
                  <li className="nav-item">
                    <button
                      className="nav-link active"
                      data-bs-toggle="tab"
                      data-bs-target="#profile-overview"
                    >
                      Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link"
                      data-bs-toggle="tab"
                      data-bs-target="#profile-edit"
                    >
                      Edit Profile
                    </button>
                  </li>
                  <li className="nav-item">
                  <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-settings">Settings</button>
                </li>
                  <li className="nav-item">
                    <button
                      className="nav-link"
                      data-bs-toggle="tab"
                      data-bs-target="#profile-change-password"
                    >
                      Change Password
                    </button>
                  </li>
                </ul>
                <div className="tab-content pt-2">
                  <div
                    className="tab-pane fade show active profile-overview"
                    id="profile-overview"
                  >
                    <h5 className="card-title">About</h5>
                    {user && (
                      <p className="small fst-italic">
                        <b>{user.fullname}</b> is a staff of WorkPass
                        International with Staff ID <b>{user.uid}</b> who was
                        registered on <b>{user.created_at}</b> and{" "}
                        <b>{user.status}</b> in his position as a{" "}
                        <b>{user.job_tittle}</b>
                      </p>
                    )}

                    <h5 className="card-title">Profile Details</h5>
                    {user && (
                      <>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 label">
                            Full Name
                          </div>
                          <div className="col-lg-9 col-md-8">
                            {user.fullname}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 label">Company</div>
                          <div className="col-lg-9 col-md-8">
                            {user.company}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 label">Job</div>
                          <div className="col-lg-9 col-md-8">
                            {user.job_tittle}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 label">Country</div>
                          <div className="col-lg-9 col-md-8">
                            {user.country}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 label">Address</div>
                          <div className="col-lg-9 col-md-8">
                            {user.house_address}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 label">Phone</div>
                          <div className="col-lg-9 col-md-8">
                            {user.telephone}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 label">Email</div>
                          <div className="col-lg-9 col-md-8">{user.email}</div>
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    className="tab-pane fade profile-edit pt-3"
                    id="profile-edit"
                  >
                    {user && (
                      <form>
                        <div className="row mb-3">
                          <label
                            htmlFor="profileImage"
                            className="col-md-4 col-lg-3 col-form-label"
                          >
                            Profile Image
                          </label>
                          <div className="col-md-8 col-lg-9">
                            {user && user.photo && (
                              <img
                                src={`http://localhost/wp_api/uploads/${user.photo}`}
                                alt="profile"
                              />
                            )}
                            <div className="pt-2">
                              <Link
                                to="#"
                                className="btn btn-primary btn-sm"
                                title="Upload new profile image"
                                data-bs-toggle="modal"
                                data-bs-target="#mdv"
                              >
                                <i className="bi bi-upload"></i>
                              </Link>
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <label className="col-md-4 col-lg-3 col-form-label">
                            Full Name
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="fullName"
                              type="text"
                              className="form-control"
                              id="fullName"
                              value={user.fullname}
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <label className="col-md-4 col-lg-3 col-form-label">
                            Company
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="company"
                              type="text"
                              className="form-control"
                              value={user.company}
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <label
                            htmlFor="Job"
                            className="col-md-4 col-lg-3 col-form-label"
                          >
                            Job
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="job"
                              type="text"
                              className="form-control"
                              id="Job"
                              value={user.job_tittle}
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <label
                            htmlFor="Country"
                            className="col-md-4 col-lg-3 col-form-label"
                          >
                            Country
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="country"
                              type="text"
                              className="form-control"
                              id="Country"
                              value={user.country}
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <label
                            htmlFor="Address"
                            className="col-md-4 col-lg-3 col-form-label"
                          >
                            Address
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="address"
                              type="text"
                              className="form-control"
                              id="Address"
                              value={user.house_address}
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <label
                            htmlFor="Phone"
                            className="col-md-4 col-lg-3 col-form-label"
                          >
                            Phone
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="phone"
                              type="text"
                              className="form-control"
                              id="Phone"
                              value={user.telephone}
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <label
                            htmlFor="Email"
                            className="col-md-4 col-lg-3 col-form-label"
                          >
                            Email
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="email"
                              type="email"
                              className="form-control"
                              id="Email"
                              value={user.email}
                            />
                          </div>
                        </div>

                        <div className="text-center">
                          <button type="submit" className="btn btn-primary">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="tab-pane fade pt-3" id="profile-settings">
                    <form >
                      <div className="row mb-4">
                        <label
                          for="fullName"
                          className="col-md-4 col-lg-3 col-form-label"
                        >
                          Change Role:
                        </label>
                        <div className="col-md-6 col-lg-7">
                     
                          <select   {...register("role")} className={`form-control form-select ${errors.role ? "is-invalid" : ""}`}    {...register("role")} aria-label="Default select example">
                           <option selected value=""> -select-</option>
                            <option value="Admin">Admin</option>
                            <option value="Account">Account</option>
                            <option value="Reception">Reception</option>
                            <option value="staff">Staff</option>
                            <option value="Agent">Agent</option>
                           


                          </select>
                      </div>
                      </div>

                      <div className="row mb-4">
                        <label
                          for="fullName"
                          className="col-md-4 col-lg-3 col-form-label"
                        >
                          Account Status:
                        </label>
                        <div className="col-md-6 col-lg-7">

                      
                          <label style={{marginRight: "10px"}}>
                          Activate 
                          <input type="checkbox"  checked={status.activate}
          onChange={handleChange} style={{marginLeft:"5px"}} name="activate" className={"form-check-input"} value="Activate" {...register("status")} />
                          </label>
                         
                        

                          <label style={{marginRight:"10px"}}>
                          Deactivate
                          <input type="checkbox"  checked={status.deactivate}
          onChange={handleChange} style={{marginLeft:"5px"}} name="deactivate" className={"form-check-input"}  /> 
                          
                         
                          </label>
                      

                     
                          <label style={{marginRight:"10px"}}>
                          Suspend 
                         <input type="checkbox"  checked={status.suspend}
          onChange={handleChange} style={{marginLeft:"5px"}} name="suspend" className={"form-check-input"}  />
                         
                          </label>
                        
                          {error && <p style={{ color: "red" }}>{error}</p>}
                      </div>
                      </div>

                      <div className="text-center">
                        <hr />
                        <button type="submit" className="btn btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>

                  <div
                    className="tab-pane fade pt-3"
                    id="profile-change-password"
                  >
                    <div className="col-lg-6 mx-auto">
                      <form
                        className="pt-3"
                        onSubmit={handleSubmit(handleRequestReset)}
                      >
                        <div className="form-group">
                          <input
                            type="email"
                            {...register("email")}
                            className={`form-control form-control ${
                              errors.email ? "is-invalid" : ""
                            }`}
                            id="exampleInputEmail1"
                            placeholder="Email"
                          />
                          {errors.email && (
                            <div className="invalid-feedback">
                              {errors.email.message}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 d-grid gap-2">
                          <button
                            type="submit"
                            className="btn btn-block btn-primary  font-weight-medium auth-form-btn"
                            disabled={loading}
                          >
                            {loading ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                            ) : (
                              "Request Reset"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UsersProfile;
