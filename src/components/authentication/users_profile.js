import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import {jwtDecode} from "jwt-decode";


const UsersProfile = () => {
  

  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  

   const handleLogout = useCallback(() => {
      localStorage.removeItem('token'); // Remove token from localStorage
      localStorage.removeItem('username'); // Remove username from localStorage
      localStorage.removeItem('uid'); // Remove user_id from localStorage
      setToken(null); // Set token state to null
      navigate('/login'); // Redirect to login page
    }, [navigate]); // Dependency ensures it doesn't change on every render
  
    
  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const response = await axios.post(
          'http://localhost/wp_api/authentication/verify_token.php',
          {}, // Empty body since it's a POST request
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        console.log('Token is valid:', response.data);
        
      } catch (error) {
        console.error('Token validation error:', error);
        toast.error('Token validation error');
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
        console.error('Error decoding token:', error);
        toast.error('Error decoding token');
        handleLogout();
      }
    } else {
      navigate('/login');
    }
  }, [token, navigate, handleLogout]); //  handleLogout is included


    const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
    const [user_id, setUserId] = useState(localStorage.getItem("uid") || "");
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem("uid"); // Retrieve user_id from localStorage

        if (!userId) {
            toast.error("User ID not found in local storage");
            return;
        }

        const fetchUserProfile = async () => {
          try {
            const response = await axios.get(`http://localhost/wp_api/authentication/user_profile.php?user_id=${userId}`);
            if (response.data.status === "success") {
                setUser(response.data.user);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error("Failed to fetch user data");
        }
        };

        fetchUserProfile();
    }, []);

    return (
        <>
            <ToastContainer />
            <div className="pagetitle">
                <h1>Profile</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="index.html">Home</Link></li>
                        <li className="breadcrumb-item">Users</li>
                        <li className="breadcrumb-item active">Profile</li>
                    </ol>
                </nav>
            </div>

            <section className="section profile">
                <div className="row">
                    <div className="col-xl-4">
                        <div className="card">
                            <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">
                                <img src="assets/img/profile-img.jpg" alt="Profile" className="rounded-circle" />
                                <h2>{username}</h2>
                                <h3>{user_id}</h3>
                                <div className="social-links mt-2">
                                    <Link to="#" className="twitter"><i className="bi bi-twitter"></i></Link>
                                    <Link to="#" className="facebook"><i className="bi bi-facebook"></i></Link>
                                    <Link to="#" className="instagram"><i className="bi bi-instagram"></i></Link>
                                    <Link to="#" className="linkedin"><i className="bi bi-linkedin"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-8">
                        <div className="card">
                            <div className="card-body pt-3">
                                <ul className="nav nav-tabs nav-tabs-bordered">
                                    <li className="nav-item">
                                        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-overview">Overview</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit">Edit Profile</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-change-password">Change Password</button>
                                    </li>
                                </ul>
                                <div className="tab-content pt-2">
                                    <div className="tab-pane fade show active profile-overview" id="profile-overview">
                                        <h5 className="card-title">About</h5>
                                        <p className="small fst-italic">
                                           <b> {user.fullname}</b> is a staff of WorkPass International with Staff ID <b>{user.uid}</b> who was registered on <b>{user.created_at}</b> and <b>{user.status}</b> in his position as a <b>{user.job_tittle}</b></p>

                                        <h5 className="card-title">Profile Details</h5>
                                        {user && (
                                            <>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Full Name</div>
                                                    <div className="col-lg-9 col-md-8">{user.fullname}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Company</div>
                                                    <div className="col-lg-9 col-md-8">{user.company}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Job</div>
                                                    <div className="col-lg-9 col-md-8">{user.job_tittle}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Country</div>
                                                    <div className="col-lg-9 col-md-8">{user.country}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Address</div>
                                                    <div className="col-lg-9 col-md-8">{user.house_address}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Phone</div>
                                                    <div className="col-lg-9 col-md-8">{user.telephone}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Email</div>
                                                    <div className="col-lg-9 col-md-8">{user.email}</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                  
                                    <div className="tab-pane fade profile-edit pt-3" id="profile-edit">
                                        <form>
                                            <div className="row mb-3">
                                                <label htmlFor="profileImage" className="col-md-4 col-lg-3 col-form-label">Profile Image</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <img src="assets/img/profile-img.jpg" alt="Profile" />
                                                    <div className="pt-2">
                                                        <Link to="#" className="btn btn-primary btn-sm" title="Upload new profile image" data-bs-toggle="modal" data-bs-target="#mdvt"><i className="bi bi-upload"></i></Link>
                                                        <Link to="#" className="btn btn-danger btn-sm" title="Remove my profile image"><i className="bi bi-trash"></i></Link>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label className="col-md-4 col-lg-3 col-form-label">Full Name</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="fullName" type="text" className="form-control" id="fullName" value={user.fullname} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label  className="col-md-4 col-lg-3 col-form-label">Company</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="company" type="text" className="form-control" value={user.company}/>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label htmlFor="Job" className="col-md-4 col-lg-3 col-form-label">Job</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="job" type="text" className="form-control" id="Job" value={user.job_tittle} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label htmlFor="Country" className="col-md-4 col-lg-3 col-form-label">Country</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="country" type="text" className="form-control" id="Country" value={user.country} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label htmlFor="Address" className="col-md-4 col-lg-3 col-form-label">Address</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="address" type="text" className="form-control" id="Address" value={user.house_address} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label htmlFor="Phone" className="col-md-4 col-lg-3 col-form-label">Phone</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="phone" type="text" className="form-control" id="Phone" value={user.telephone} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label htmlFor="Email" className="col-md-4 col-lg-3 col-form-label">Email</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="email" type="email" className="form-control" id="Email" value={user.email} />
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="tab-pane fade pt-3" id="profile-change-password">
                                        <form>
                                            <div className="row mb-3">
                                                <label htmlFor="currentPassword" className="col-md-4 col-lg-3 col-form-label">Current Password</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="password" type="password" className="form-control" id="currentPassword" />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label htmlFor="newPassword" className="col-md-4 col-lg-3 col-form-label">New Password</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="newpassword" type="password" className="form-control" id="newPassword" />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label htmlFor="renewPassword" className="col-md-4 col-lg-3 col-form-label">Re-enter New Password</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="renewpassword" type="password" className="form-control" id="renewPassword" />
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <button type="submit" className="btn btn-primary">Change Password</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default UsersProfile;