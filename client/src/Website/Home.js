import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="AJ-home-main-section">
      <div className="flex flex-col justify-center bg-gradient-to-br from-blue-50 to-white text-gray-800">
        {/* Navigation Bar */}
        <nav
          className="w-full p-5 flex justify-between items-center shadow bg-white"
          style={{ padding: "10px" }}
        >
          <h1 className="text-2xl font-bold text-blue-700">Inout360</h1>
          <div className="flex space-x-4 gap-5">

          <button
          onClick={() => {
            localStorage.removeItem("accesstoken");
            localStorage.removeItem("refreshtoken");
            Cookies.remove("accesstoken");
            Cookies.remove("refreshtoken");
            navigate("/login");
          }}
          className="bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          style={{ padding: "6px" }}
        >
          Login
        </button>

            {/* <button
              onClick={() => navigate("/register")}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition"
              style={{ padding: "6px" }}
            >
              Register
            </button> */}
          </div>
        </nav>

        {/* Hero Section */}
        <main
          className="h-screen flex container m-auto flex-col md:flex-row items-center  px-8 md:px-20 py-20"
          style={{ margin: "auto" }}
        >
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
            Contractor Workforce Entry Management Process.</h2>
            <p className="text-lg text-gray-700 mb-6">
             To streamline and monitor the attendance, movement, and deployment of contractor
              students, teachers, parents, finances, and more—all from a single
              platform.
            </p>
            <div className="Designation-section flex gap-10">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                style={{ padding: "6px" }}
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-100 transition"
                style={{ padding: "6px" }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Illustration or Image */}
          <div className="mt-10 md:mt-0 md:w-1/2">
            <img
              src="https://img.freepik.com/free-vector/education-concept-illustration_114360-6310.jpg"
              alt="School Management Illustration"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-500 py-6 border-t mt-auto">
          © {new Date().getFullYear()} SchoolCRM. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Home;
