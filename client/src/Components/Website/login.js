import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { encryptData } from "../../Helpers/encryptionHelper";

const domainpath = "http://localhost:5000";

const LoginForm = () => {
  const [userData, setUserdata] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [emailTouched, setEmailTouched] = useState(false);

  const Handlechange = (e) => {
    const { name, value } = e.target;
    setUserdata({ ...userData, [name]: value });
  };

  const HandleEmailBlur = () => {
    setEmailTouched(true);
    const emailError = validateEmail(userData.email);
    setErrors((prevErrors) => ({ ...prevErrors, email: emailError }));
  };

  const Handlesubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateform(userData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await sendData(userData);
      console.log("form submitted successfully", userData);
    } else {
      console.log("form submission failed", errors);
    }
  };

  const validateEmail = (email) => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email is invalid";
    }
    return null;
  };

  const validateform = (userData) => {
    const errors = {};
    const emailError = validateEmail(userData.email);
    if (emailError) errors.email = emailError;

    if (!userData.password) {
      errors.password = "Password is required";
    } else if (userData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    return errors;
  };

  const sendData = async (data) => {
    try {
      // ✅ STATIC ADMIN LOGIN CHECK
      if (data.email === "admin@site.com" && data.password === "admin123") {
        const staticAdmin = {
          name: "Static Admin",
          email: data.email,
          role: "admin",
          accessToken: "static_admin_token_123",
        };

        Cookies.set("accesstoken", staticAdmin.accessToken);
        Cookies.set("userdetail", encryptData(staticAdmin));
        localStorage.setItem("accesstoken", staticAdmin.accessToken);
        localStorage.setItem("userdetail", encryptData(staticAdmin));

        alert("Static Admin Login Successful!");
        navigate("/dashboard");
        return; // ✅ skip API call
      }

      // ✅ BACKEND LOGIN FOR NORMAL USERS
      const response = await fetch(`${domainpath}/api/auth/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 200) {
        console.log("200 OK: Login successful", result);
        Cookies.set("accesstoken", result.accessToken);
        Cookies.set("userdetail", encryptData(result));
        localStorage.setItem("accesstoken", result.accessToken);
        localStorage.setItem("userdetail", encryptData(result));

        navigate("/dashboard");
      } else if (response.status === 400) {
        alert("Login failed: " + result.message);
      } else {
        console.log(`${response.status} Error:`, result);
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error during login. Please check your connection.");
    }
  };

  return (
    <div className="main-inner">
      <div className="sections">
        <div className="left-section"></div>
        <div className="right-section">
          <div className="form-justification">
            <form onSubmit={Handlesubmit}>
              <div className="inside-form">
                <h2>Login Here</h2>

                {/* Email Section */}
                <div className="email-section">
                  <div className="mid-section">
                    <label className="email" htmlFor="email">
                      Email/Phone
                    </label>
                    <br />
                  </div>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    required
                    onChange={Handlechange}
                    onBlur={HandleEmailBlur}
                    value={userData.email}
                    className={`input-field ${
                      emailTouched && errors.email ? "error-border" : ""
                    }`}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>

                {/* Password Section */}
                <div className="email-section">
                  <div className="mid-section">
                    <label className="email" htmlFor="password">
                      Password
                    </label>
                    <br />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    onChange={Handlechange}
                    value={userData.password}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Remember / Forgot Section */}
                <div className="side-section">
                  <div className="remember-me-container">
                    <input type="checkbox" className="checkbox" />
                    <div>Remember Me</div>
                  </div>
                  <div className="forgot-section">
                    <a href="/forgotpassword" className="forgot-password">
                      Forgot Password?
                    </a>
                  </div>
                </div>

                {/* Button Section */}
                <div className="last-section">
                  <div className="button-section">
                    <button type="submit">Login</button>
                  </div>
                </div>

                {/* Divider */}
                <div className="divider">
                  <span className="line"></span>
                  <span className="text">OR</span>
                  <span className="line"></span>
                </div>

                {/* Register Section */}
                <div className="last-section">
                  <div className="last-line">Don't have an account?</div>
                  <div className="alphabet">
                    <a href="/register" className="forgot-password">
                      Register
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
