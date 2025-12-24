import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, postData } from "../Helpers/api.js";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail") || "";

  useEffect(() => {
    if (!email && !resetComplete) {
      navigate("/forgotpassword");
    }
  }, [email, navigate, resetComplete]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    } else if (formData.confirmPassword !== formData.newPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const result = await postData(API.auth.resetPassword, {
        email,
        newPassword: formData.newPassword,
      });

      if (result && result.status === true) {
        const successMessage =
          result.message || "Password reset successful. Please login.";
        setMessage(successMessage);
        toast.success(successMessage);
        setResetComplete(true);
        sessionStorage.removeItem("resetEmail");
        navigate("/login", { replace: true });
        setTimeout(() => {
          if (window.location.pathname !== "/login") {
            window.location.assign("/login");
          }
        }, 0);
      } else {
        setMessage(result.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
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
                <h2>Reset Your Password Here</h2>

                <div className="email-section">
                  <div className="mid-section">
                    <label className="email" htmlFor="newPassword">
                      New Password
                    </label>
                    <br />
                  </div>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    required
                    onChange={handleChange}
                    value={formData.newPassword}
                    className={`input-field ${
                      errors.newPassword ? "error-border" : ""
                    }`}
                  />
                  <div>
                    {errors.newPassword && (
                      <span className="error-message">
                        {errors.newPassword}
                      </span>
                    )}
                  </div>
                </div>

                <div className="email-section">
                  <div className="mid-section">
                    <label className="email" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <br />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    onChange={handleChange}
                    value={formData.confirmPassword}
                    className={`input-field ${
                      errors.confirmPassword ? "error-border" : ""
                    }`}
                  />
                  <div>
                    {errors.confirmPassword && (
                      <span className="error-message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                <div className="last-section">
                  <div className="button-section">
                    <button type="submit">Reset Password</button>
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

export default ResetPassword;
