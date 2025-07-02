import React, { useState, useEffect,useRef, useCallback } from "react";
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
  email1: yup
    .string()
    .email("Invalid email format")
    .required("Email  address is required"),

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
        const newState = {
          activate: false,
          deactivate: false,
          suspend: false,
          [name]: checked, // Only the selected checkbox is updated
        };

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
  const validate = async () => {
    if (!token) return;
    try {
      await axios.get("http://localhost:8000/api/user", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // Token is valid
      //console.log("Token is valid.");
    } catch (error) {
      toast.error("Unauthorized Access.");
      //console.error("Token validation failed:", error);
       handleLogout(); // Optionally handle logout
    }
  };

  validate();
}, [token, handleLogout]);
  const timer = useRef(null);
  const timeoutDuration = 30 * 60 * 1000; // 30 minutes

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!token) return;

    timer.current = setTimeout(() => {
      //console.log("Logged out due to inactivity");
      handleLogout();
    }, timeoutDuration);
  };

  useEffect(() => {
    if (!token) return;

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer initially

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [token]);


  useEffect(() => {
    const userId = localStorage.getItem("uid"); // Retrieve user_id from localStorage

    if (!userId) {
      toast.error("User ID not found in local storage");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/fetch-user-by-id", // API endpoint
          {
            params: { uid: userId }, // Pass uid as query param
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include token in headers
            },
          }
        );

        //console.log("API Response:", response.data); // Debugging log
        //console.log("User ID:", userId); // Debugging log
        if (response.data.status === "success" && response.data.user) {
          setUser(response.data.user);
          setPreview(response.data.user.profile_photo || null);
        } else {
          toast.error(response.data.message || "User data not found");
        }
      } catch (err) {
        console.error("Error fetching user data:", err.response?.data || err.message);
        toast.error(err.response?.data?.message || "An error occurred while fetching user data");
      }
    };

    fetchUserProfile(); // Call the function inside the useEffect
  }, [token]); // Empty dependency array to run only once

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
  
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload a JPEG, PNG, or GIF image.");
      return;
    }
  
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error("File size exceeds the 5MB limit. Please upload a smaller file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("profile_photo", selectedFile);
  
    setUploading(true);
    axios
      .post("http://localhost/wp_api/authentication/upload_profile.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Upload response:", response.data);
        if (response.data.status === "success") {
          toast.success(response.data.message);
          setUser((prevUser) => ({
            ...prevUser,
            profile_photo: response.data.photo_url,
          }));
          setPreview(response.data.photo_url);
        } else {
          console.error("API returned an error:", response.data);
          toast.error(response.data.error || "An error occurred while uploading the photo");
        }
      })
      .catch((err) => {
        console.error("Error in catch block:", err);
        toast.error(err.response?.data?.message || "An error occurred while uploading the photo");
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
        "http://localhost:8000/api/send-reset-link", // Update to your API endpoint
        { email: data.email1 },
         {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        }
      );
      console.log("API response:", response.data); // Debugging log
      if (response.data.status) {
        console.log("Success message:", response.data.status); // Debugging log
        toast.success(response.data.status);
        reset(); // Reset the form after successful request
      } else if (response.data.error) {
        console.log("Error message:", response.data.error); // Debugging log
        toast.error(response.data.error);
      }
    } catch (error) {
      console.error("API error:", error.response?.data || error.message); // Debugging log
      toast.error(error.response?.data?.error || "An error occurred");
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
                onClick={() => setPreview(null)} // Reset preview on close
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
                              onChange={(e) => setUser({ ...user, fullname: e.target.value })}
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

                  

                  <div className="modal fade" id="vt" tabindex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Make this changes?</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                     Are you sure you want to suspend this account? This action cannot be undone.
                    </div>
                    <div>
                      <button type="button" className="btn btn-primary">Take Action</button>
                    </div>
                  </div>
                </div>
              </div>



                  <div
                    className="tab-pane fade pt-3"
                    id="profile-change-password"
                  >
                    <div className="col-lg-6 mx-auto">
                      <form
                        className="pt-3"
                        onSubmit={handleSubmit(handleRequestReset)}
                        noValidate
                      >
                        <div className="form-group">
                          <input
                            type="email"
                            name="email1"
                            {...register("email1")}
                            className={`form-control form-control ${
                              errors.email1 ? "is-invalid" : ""
                            }`}
                            id="exampleInputEmail1"
                            placeholder="Email"
                          />
                          {errors.email1 && (
                            <div className="invalid-feedback">
                              {errors.email1.message}
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
