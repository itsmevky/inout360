import React, { useState, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import logo from "../Images/pidilite-logo-13.png"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import Cookies from "js-cookie";

const domainpath = process.env.REACT_APP_API_DOMAIN_ENDPOINT;


export default AdminDashboardSidebar;
