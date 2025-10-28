import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { API } from "../Helpers/api.js";
import Validator from "../Helpers/validators.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import securelogin from "../Images/pidilite-logo-12.png";
import { useUser } from "../Helpers/Context/UserContext.js";

const LoginComponent = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [userData, setUserdata] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  console.log(userData, "userDatauserDatauserDatauserDatauserData");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const validateform = async (formData) => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length > 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserdata({
      ...userData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const getFieldClassName = (fieldName) =>
    errors[fieldName] ? "field-error" : "field";

  const encodeData = (data) => btoa(JSON.stringify(data));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hasErrors = await validateform(userData);
      if (hasErrors) {
        setLoading(false);
        return;
      }
      await sendData(userData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const sendData = async (formData) => {
    try {
      const result = await API.login(formData); // expects { data: {...userData} }
      console.log(result, "resultresultresultresultresult");
      const user = result?.data;

      if (user?.accessToken && user?.refreshToken) {
        const { accessToken, refreshToken, ...userInfo } = user;

        // 🔐 Store tokens
        localStorage.setItem("accesstoken", accessToken);
        localStorage.setItem("refreshtoken", refreshToken);
        Cookies.set("accesstoken", accessToken);
        Cookies.set("refreshtoken", refreshToken);

        // 🧍 Combine first + last name
        const fullName = `${userInfo.firstName || ""} ${
          userInfo.lastName || ""
        }`.trim();
        if (fullName) {
          localStorage.setItem("user_fullname", fullName);
          userInfo.fullname = fullName;
        }

        // ✅ Store encoded user details
        const encodedUserDetails = encodeData(userInfo);
        Cookies.set("userdetail", encodedUserDetails);

        // 💾 Remember Me (save only email)
        if (formData.rememberMe) {
          localStorage.setItem("email", formData.email);
        } else {
          localStorage.removeItem("email");
        }

        // toast.success("Login successful!");
        setUser(userInfo);

        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        toast.error("Login failed: Invalid credentials or tokens missing.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setUserdata((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }

    const accessToken =
      localStorage.getItem("accesstoken") || Cookies.get("accesstoken");
    if (accessToken) navigate("/dashboard");
  }, [navigate]);

  return (
    <>
      <div className="main-inner login-page">
        <div className="sections">
          <div className="left-section">
            <div className="left-section-inner">
              <img width="100%" src={securelogin} alt="Secure login" />
            </div>
          </div>

          <div className="right-section">
            <div className="form-justification AJ-section">
              <form onSubmit={handleSubmit}>
                <div className="inside-form">
                  <h2>Login Here</h2>

                  <div className="login-section AJ-login-Form-block">
                    <div className="form">
                      {/* Email */}
                      <div className="AJ-floating-label-wrapper">
                        <input
                          type="text"
                          name="email"
                          value={userData.email}
                          autoComplete="off"
                          onChange={handleInputChange}
                          className={`${getFieldClassName(
                            "email"
                          )} AJ-floating-input`}
                        />
                        <label className="AJ-floating-label">Email</label>
                        {errors.email && (
                          <span className="error-text">{errors.email}</span>
                        )}
                      </div>

                      {/* Password with Show/Hide */}
                      <div className="AJ-floating-label-wrapper password-field">
                        <div className="password-input-container">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={userData.password}
                            autoComplete="off"
                            onChange={handleInputChange}
                            className={`${getFieldClassName(
                              "password"
                            )} AJ-floating-input`}
                          />
                          <button
                            type="button"
                            className="show-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                        <label className="AJ-floating-label">Password</label>
                        {errors.password && (
                          <span className="error-text">{errors.password}</span>
                        )}
                      </div>

                      {/* Remember & Forgot */}
                      <div className="side-section">
                        <div className="remember-me-container">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            checked={userData.rememberMe}
                            onChange={handleInputChange}
                          />
                          <div>Remember Me</div>
                        </div>

                        <div className="forgot-section">
                          <a href="/forgotpassword" className="forgot-password">
                            Forgot Password?
                          </a>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="last-section">
                        <button className="button-section" type="submit">
                          {loading ? "Logging in..." : "Login"}
                        </button>
                      </div>

                      <div className="divider">
                        <span className="line"></span>
                        <span className="text">OR</span>
                        <span className="line"></span>
                      </div>

                      {/* Register link */}
                      <div className="last-section">
                        <div className="last-line">
                          Don’t have an account? &nbsp;
                        </div>
                        <div className="alphabet">
                          <a href="register" className="forgot-password">
                            Register
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
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
