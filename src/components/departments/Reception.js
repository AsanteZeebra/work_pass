import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect,useRef, useCallback, lazy, Suspense } from "react";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import ReactApexChart from "react-apexcharts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LazyReactApexChart = lazy(() => import("react-apexcharts"));

const Reception = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  // Memoize handleLogout to prevent re-creation
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token'); // Remove token from localStorage
    localStorage.removeItem('username'); // Remove username from localStorage
    localStorage.removeItem('uid'); // Remove user_id from localStorage
    setToken(null); // Set token state to null
    navigate('/login'); // Redirect to login page
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
      console.log("Token is valid.");
    } catch (error) {
      toast.error("Unauthorized Token.");
      console.error("Token validation failed:", error);
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
      console.log("Logged out due to inactivity");
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

  





  const chartOptions = {
    chart: {
      id: 'basic-line',
      height: 350,
      type: 'area',
      toolbar: {
        show: false
      },
    },
    markers: {
      size: 4
    },
    colors: ['#4154f1', '#2eca6a', '#ff771d'],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.4,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995]
    }
  };

  const chartSeries = [
    {
      name: 'series-1',
      data: [30, 40, 45, 50, 49]
    },
    {
      name: 'series-2',
      data: [50, 60, 75, 80, 90]
    }
  ];

  const chartOptionsarea = {
    chart: {
      id: 'basic-radar',
      toolbar: {
        show: false
      },
    },
    markers: {
      size: 4
    },
    colors: ['#4154f1', '#2eca6a', '#ff771d'],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.4,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: ['January', 'February', 'March', 'April', 'May']
    }
  };

  const chartSeriesarea = [
    {
      name: 'series-1',
      data: [30, 40, 45, 50, 49]
    },
    {
      name: 'series-1',
      data: [10, 30, 20, 70, 66]
    }
  ];

  const [chartOptionspolar, setChartOptions] = useState({
    chart: {
      id: 'static-polar-area',
      type: 'polarArea'
    },
    markers: {
      size: 4
    },
    colors: ['#4154f1', '#2eca6a', '#ff771d'],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.4,
        stops: [0, 90, 100]
      }
    },
    labels: ['1991', '1992', '1993', '1994', '1995'] // Static labels
  });

  const [chartSeriespolar, setChartSeries] = useState([30, 40, 45, 50, 49]); // Static series

  const [error, setError] = useState("");
  const [countData, SetCountData] = useState(null);
  const [payCount, SetPayCount] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [PercentageData, SetPercentageData] = useState(null);

  const fetchcount = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/clients/count_clients.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        SetCountData({
          all_clients: response.data.all_clients,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case data. Please try again.");
    }
  };

  const Pay_count = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/payment/count_payment.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        SetPayCount({
          total_pay: response.data.total,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case data. Please try again.");
    }
  };

  const case_count = async () => {
    try {
      const response = await axios.get(
        "http://localhost/wp_api/cases/count_cases.php",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Set countData with all counts
        setCaseData({
          total_case: response.data.all_cases,
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error fetching case data. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!countData) await fetchcount();
      if (!payCount) await Pay_count();
      if (!caseData) await case_count();
    };

    fetchData();
  }, [countData, payCount, caseData]);

  return (
    <>
      <div className="pagetitle">
        <h1>Dashbaord</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="index.html">Dashbaord</a></li>
            <li className="breadcrumb-item active">home</li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-xxl-4 col-md-6">
              <div className="card info-card sales-card">
                <div className="card-body">
                  <h5 className="card-title">Customers <span>| Total</span></h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-cart"></i>
                    </div>
                    <div className="ps-3">
                      {countData ? (
                        <h6>{countData.all_clients}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}
                      <span className="text-success small pt-1 fw-bold">12%</span> <span className="text-muted small pt-2 ps-1">increase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-4 col-md-6">
              <div className="card info-card revenue-card">
                <div className="card-body">
                  <h5 className="card-title">Revenue <span>| Total</span></h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-currency-dollar"></i>
                    </div>
                    <div className="ps-3">
                      {payCount ? (
                        <h6>{payCount.total_pay}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}
                      <span className="text-success small pt-1 fw-bold">8%</span> <span className="text-muted small pt-2 ps-1">increase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-4 col-xl-12">
              <div className="card info-card customers-card">
                <div className="card-body">
                  <h5 className="card-title">Cases <span>| Total</span></h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="ps-3">
                      {caseData ? (
                        <h6>{caseData.total_case}</h6>
                      ) : (
                        <p>No case data available.</p>
                      )}
                      <span className="text-danger small pt-1 fw-bold">12%</span> <span className="text-muted small pt-2 ps-1">decrease</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Reports <span>/Today</span></h5>
                  <Suspense fallback={<div>Loading...</div>}>
                    <LazyReactApexChart options={chartOptions} series={chartSeries} type="area" height={350} />
                  </Suspense>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card recent-sales overflow-auto">
                <div className="card-body">
                  <h5 className="card-title">Recent Sales <span>| Today</span></h5>
                  <table className="table table-borderless datatable">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Customer</th>
                        <th scope="col">Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row"><Link to="#">#2457</Link></th>
                        <td>Brandon Jacob</td>
                        <td><Link to="#" className="text-primary">At praesentium minu</Link></td>
                        <td>$64</td>
                        <td><span className="badge bg-success">Approved</span></td>
                      </tr>
                      <tr>
                        <th scope="row"><Link to="#">#2147</Link></th>
                        <td>Bridie Kessler</td>
                        <td><Link to="#" className="text-primary">Blanditiis dolor omnis similique</Link></td>
                        <td>$47</td>
                        <td><span className="badge bg-warning">Pending</span></td>
                      </tr>
                      <tr>
                        <th scope="row"><Link to="#">#2049</Link></th>
                        <td>Ashleigh Langosh</td>
                        <td><Link to="#" className="text-primary">At recusandae consectetur</Link></td>
                        <td>$147</td>
                        <td><span className="badge bg-success">Approved</span></td>
                      </tr>
                      <tr>
                        <th scope="row"><Link to="#">#2644</Link></th>
                        <td>Angus Grady</td>
                        <td><Link to="#" className="text-primar">Ut voluptatem id earum et</Link></td>
                        <td>$67</td>
                        <td><span className="badge bg-danger">Rejected</span></td>
                      </tr>
                      <tr>
                        <th scope="row"><Link to="#">#2644</Link></th>
                        <td>Raheem Lehner</td>
                        <td><Link to="#" className="text-primary">Sunt similique distinctio</Link></td>
                        <td>$165</td>
                        <td><span className="badge bg-success">Approved</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

           
          </div>
        </div>

       
      </div>
    </>
  );
}

export default Reception;