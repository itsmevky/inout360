import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { encryptData } from "../../Helpers/encryptionHelper";
import { API, postData } from "../../Helpers/api";
import Validator from "../../Helpers/validators.js";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import securelogin from "../../Images/secure-login.png";
import { useUser } from "../../Helpers/Context/UserContext.js";

const LoginComponent = () => {
  const { setUser } = useUser();

  const [userData, setUserdata] = useState({
    email: "",
    password: "",
    rememberMe: false, // Add rememberMe field
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const rules = {
    email: {
      required: true,
      type: "string",
      errorMessage: "Email is required.",
    },
    password: {
      required: true,
      type: "string",
      errorMessage: "Password is required.",
    },
  };
  const validator = new Validator(rules);
  const validateFormField = async (name, value) => {
    const fieldRule = { [name]: rules[name] };
    const fieldData = { [name]: value };

    const validationErrors = await validator.validate(fieldData, fieldRule);
    return validationErrors;
  };
  const validateform = async (formData) => {
    const validationErrors = await validator.validate(formData, rules);
    if (Object.keys(validationErrors).length > 0) {
      console.log(validationErrors);
      setErrors(validationErrors);

      return true;
    }
    setErrors(validationErrors);
    return;
  };

  const [touched, setTouched] = useState({ email: false, password: false });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserdata({
      ...userData,
      [name]: type === "checkbox" ? checked : value, // Handle checkbox for rememberMe
    });
  };
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validateFormField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };
  const encodeData = (data) => {
    return btoa(JSON.stringify(data)); // Convert data to Base64 after JSON.stringify
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validationErrors = await validateform(userData);
      if (validationErrors) {
        setLoading(false);
        return;
      }
      const response = await sendData(userData);
      setLoading(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message);
      setLoading(false);
    }
  };
  const sendData = async (userData) => {
    try {
      const response = await postData(API.auth.login, userData);
      console.log("response", response);

      // Case: response itself is the user data (not wrapped in .data or has .status)
      if (response?.accessToken) {
        const accessToken = response.accessToken;

        // Save tokens and user data
        localStorage.setItem("accesstoken", accessToken);
        Cookies.set("accesstoken", accessToken);

        const encodedUserDetails = encodeData(response);
        Cookies.set("userdetail", encodedUserDetails);

        // Handle "Remember Me"
        if (userData.rememberMe) {
          localStorage.setItem("email", userData.email);
          localStorage.setItem("password", userData.password); // ⚠️ Avoid in production
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        toast.success("Login successful!");

        setUser(response);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // If it's not a success
        toast.error(response.message || "Login error. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  // On Component load, check if credentials are saved in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail && savedPassword) {
      setUserdata((prevState) => ({
        ...prevState,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true, // Set the checkbox as checked if data is found
      }));
    }
    const accessToken =
      localStorage.getItem("accesstoken") || Cookies.get("accesstoken");

    if (accessToken) {
      // If user is already logged in, redirect to dashboard
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <>
      <div className="main-inner login-page">
        <div className="sections">
          <div className="left-section">
            <div className="left-section-inner">
              <img width="100%" src={securelogin} alt="" />
            </div>
          </div>
          <div className="right-section ">
            <div className="form-justification AJ-section ">
              <form onSubmit={handleSubmit}>
                <div className="inside-form">
                  <h2>Login Here</h2>
                  <div className="login-section AJ-login-Form-block">
                    <div className="form">
                      <div className="AJ-floating-label-wrapper ">
                        <input
                          type="text"
                          name="email"
                          value={userData.email}
                          autoComplete="off"
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`${getFieldClassName(
                            "email"
                          )} AJ-floating-input`}
                        />

                        <label className="AJ-floating-label">Email</label>
                      </div>

                      <div className="AJ-floating-label-wrapper ">
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={userData.password}
                          placeholder=""
                          autoComplete="off"
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`${getFieldClassName(
                            "password"
                          )} AJ-floating-input`}
                        />

                        <label className="AJ-floating-label">Password</label>
                      </div>

                      <div className="side-section">
                        <div className="remember-me-container">
                          <div>
                            <input
                              type="checkbox"
                              name="rememberMe"
                              checked={userData.rememberMe}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>Remember Me</div>
                        </div>

                        <div className="forgot-section">
                          <a href="/forgotpassword" className="forgot-password">
                            Forgot Password?
                          </a>
                        </div>
                      </div>

                      <div className="last-section ">
                        <button className="button-section" type="submit">
                          Login
                        </button>
                      </div>
                      {/* <div className="divider">
                        <span className="line"></span>
                        <span className="text">OR</span>
                        <span className="line"></span>
                      </div> */}
                      {/* <div className="last-section">
                        <div className="last-line">
                          Don't have an account? &nbsp;
                        </div>
                        <div className="alphabet">
                          <a href="register" className="forgot-password">
                            Register
                          </a>
                        </div>
                      </div> */}
                    </div>

                    <div></div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div>
          {/* Add the ToastContainer to render the toast messages */}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </>
  );
};

export default LoginComponent;
