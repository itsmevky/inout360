import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, postData } from "../Helpers/api.js";
import Validator from "../Helpers/validators.js";

const ForgotPassword = () => {
  const [userData, setUserdata] = useState({
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ email: false });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Email is invalid.";
    }
    return null;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });

    if (name === "email") {
      const emailError = validateEmail(userData.email);
      setErrors({ ...errors, email: emailError });
    }
  };
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserdata({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    // Validate form before making the API request
    const validationErrors = {};
    const emailError = validateEmail(userData.email);
    if (emailError) validationErrors.email = emailError;
    setErrors(validationErrors);

    // If there are errors, stop form submission
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      // Log request data before sending the API request
      console.log("Request data:", { email: userData.email });

      // Send request to API
      const result = await postData(API.auth.forgetpassword, {
        email: userData.email,
      });

      // Log the response from the API for debugging
      console.log("API response:", result);

      // Check if the result contains the expected response format
      if (result && result.status === true) {
        setMessage(result.message || "OTP sent successfully.");
        navigate("/getotp"); // Redirect to OTP page
      } else {
        setMessage(result.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error); // Log the actual error for debugging
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="main-inner">
      <div className="sections">
        <div className="left-section"></div>
        <div className="right-section">
          <div className="form-justification">
            <form onSubmit={handleSubmit}>
              <div className="inside-form">
                <h2>Forgot Your Password</h2>
                <div className="email-section">
                  <div className="form-item">
                    <input
                      type="text"
                      name="email"
                      value={userData.email}
                      autoComplete="off"
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName("email")}
                      placeholder=""
                    />
                    <label htmlFor="email">Email</label>
                    {/* <div className="error-section">
                          {errors.email && (
                            <span className="error-message">
                              {errors.email}
                            </span>
                          )}
                        </div> */}
                  </div>
                </div>

                <div className="last-section">
                  <div className="button-section">
                    <button type="submit">Get Otp</button>
                  </div>
                </div>
                {message && <div className="message-section">{message}</div>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
