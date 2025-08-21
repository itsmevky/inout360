import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { API } from "../Helpers/api.js";
import Validator from "../Helpers/validators.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import securelogin from "../Images/secure-login.png";
import { useUser } from "../Helpers/Context/UserContext.js";

const LoginComponent = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [userData, setUserdata] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

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

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
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
    return btoa(JSON.stringify(data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔄 handleSubmit called");

    setLoading(true);
    console.log("⏳ setLoading(true)");

    try {
      console.log("📋 Validating form...");
      const validationErrors = await validateform(userData);
      console.log("✅ Validation complete:", validationErrors);

      if (validationErrors) {
        console.log("❌ Validation errors found, exiting submission.");
        setLoading(false);
        return;
      }

      console.log("🚀 Sending data...");
      await sendData(userData);
    } catch (error) {
      console.error("❗ Form submission error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
      console.log("✅ setLoading(false)");
    }
  };

  const sendData = async (data) => {
    console.log("📤 Sending login data:", data);

    try {
      const result = await API.login(data); // full Axios response
      console.log("✅ Raw API result:", result);

      const status = result?.status ?? result?.data?.status;
      const data = result?.data?.data ?? result?.data;

      // Check the actual backend status inside result.data
      if (result.data?.status === true) {
        const { accessToken, refreshToken, ...userInfo } = result.data.data;

        if (!accessToken || !refreshToken) {
          throw new Error("❌ Tokens are missing from the response");
        }

        console.log("🔐 Storing tokens...");
        localStorage.setItem("accesstoken", accessToken);
        localStorage.setItem("refreshtoken", refreshToken);
        Cookies.set("accesstoken", accessToken);
        Cookies.set("refreshtoken", refreshToken);

        console.log("👤 Storing user info...");
        if (userInfo?.fullname) {
          localStorage.setItem("user_fullname", userInfo.fullname);
        }

        const encodedUserDetails = encodeData(userInfo);
        Cookies.set("userdetail", encodedUserDetails);

        if (data.rememberMe) {
          console.log("💾 Remembering credentials...");
          localStorage.setItem("email", data.email);
          localStorage.setItem("password", data.password);
        } else {
          console.log("🧹 Clearing remembered credentials...");
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }

        console.log("🎉 Login successful");
        toast.success("Login successful!");
        setUser(userInfo);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Backend returned status false
        const message =
          result.data?.message ||
          "Login error. Please try again latersssssssss.";
        console.warn("⚠️ Login failed:", message);

        if (result.data?.errors) {
          Object.keys(result.data.errors).forEach((field) => {
            const errorMessage = result.data.errors[field].join(", ");
            toast.error(
              `${
                field.charAt(0).toUpperCase() + field.slice(1)
              }: ${errorMessage}`
            );
          });
        } else {
          toast.error(message);
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    sendData();
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail && savedPassword) {
      setUserdata((prevState) => ({
        ...prevState,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true,
      }));
    }

    const accessToken =
      localStorage.getItem("accesstoken") || Cookies.get("accesstoken");

    if (accessToken) {
      navigate("/dashboard");
    }
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
                      <div className="AJ-floating-label-wrapper">
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

                      <div className="AJ-floating-label-wrapper">
                        <input
                          type="password"
                          name="password"
                          value={userData.password}
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

                      <div className="last-section">
                        <button className="button-section" type="submit">
                          Login
                        </button>
                      </div>

                      <div className="divider">
                        <span className="line"></span>
                        <span className="text">OR</span>
                        <span className="line"></span>
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
