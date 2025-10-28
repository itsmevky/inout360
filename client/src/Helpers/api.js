// import { toast } from "react-toastify";

// //================================================= Api Endpoints Starts ============================================================//

// const getSubdomain = () => {
//   const host = window.location.hostname;
//   const parts = host.split(".");

//   if (host.includes("localhost") && parts.length === 2) {
//     return parts[0];
//   }

//   if (parts.length > 2) {
//     return parts[0];
//   }

//   return null;
// };

// const subdomain = getSubdomain();

// const domainpath = subdomain
//   ? `http://${subdomain}.localhost:5000/api`
//   : `http://localhost:5000/api`;

// const handleTokenExpiry = () => {
//   localStorage.removeItem("accesstoken");
//   localStorage.removeItem("refreshtoken");

//   document.cookie = "accesstoken=; Max-Age=0; path=/;";
//   document.cookie = "refreshtoken=; Max-Age=0; path=/;";

//   toast.error("Session expired. Please login again.");

//   setTimeout(() => {
//     window.location.href = "/login";
//   }, 2500);
// };

// const API = {
//   getUser: async (page, limit) => {
//     return getData(`/user?page=${page}&limit=${limit}`);
//   },
//   getGroups: async (page, limit) => {
//     return getData(`/groups?page=${page}&limit=${limit}`);
//   },
//   getGroupsss: async (page, limit) => {
//     return getData(`/groups/student/education?page=${page}&limit=${limit}`);
//   },
//   deleteGroups: async (groupsId) => {
//     return deleteData(`/groups/delete`, { groupsId });
//   },
//   deleteGlobalfields: async (_id) => {
//     return deleteData(`/global-fields`, { _id });
//   },
//   getModuleList: async (page, limit) => {
//     return getData(`/modules`);
//   },
//   getRole: async (page, limit) => {
//     return getData(`/role?page=${page}&limit=${limit}`);
//   },
//   createRole: async (data) => {
//     return postData(`/role`, data);
//   },
//   createGroups: async (data) => {
//     return postData(`/groups`, data);
//   },

//   updateStatus: async (data) => {
//     return putData(`/user/status`, data);
//   },
//   createuser: async (data) => {
//     return postData(`/user`, data);
//   },
//   createPermission: async (data) => {
//     return postData(`/permissions`, data);
//   },
//   singleuserUpdate: async (id, data) => {
//     return putData(`/user/${id}`, data);
//   },

//   singleuserDelete: async (id) => {
//     return deleteData(`/user/delete/${id}`);
//   },
//   multipleUserDelete: async (ids) => {
//     return postData("/user/delete", { ids });
//   },

//   GetStudents: async (page, limit) => {
//     return getData(`/student/?page=${page}&limit=${limit}`);
//   },
//   GetTrips: async (page, limit) => {
//     return getData(`/trips/?page=${page}&limit=${limit}`);
//   },
//   GetParents: async (search, page, limit) => {
//     return getData(`/parents/?page=${page}&limit=${limit}`);
//   },
//   GetTeachers: async (page, limit) => {
//     return getData(`/teachers/?page=${page}&limit=${limit}`);
//   },
//   createteacher: async (data) => {
//     return postData(`/teacher`, data);
//   },
//   createstudent: async (data) => {
//     return postData(`/students`, data);
//   },
//   getUserById: async (userId) => {
//     return getData(`/user/${userId}`);
//   },
//   updatePermission: async (roleId, data) => {
//     return putData(`/role/${roleId}`, data);
//   },

//   Getclass: async (page, limit) => {
//     return getData(`/class?page=${page}&limit=${limit}`);
//   },

//   createsubject: async (data) => {
//     return postData(`/subjects`, data);
//   },

//   getsubject: async (page, limit) => {
//     return getData(`/subjects?page=${page}&limit=${limit}`);
//   },
//   Updatesubject: async (id, data) => {
//     return putData(`/subjects/${id}`, data);
//   },
//   UpdateBusinessType: async (id, data) => {
//     return putData(`/business_types/${id}`, data);
//   },
//   CreatebusinessType: async (data) => {
//     return postData(`/business_types`, data);
//   },
//   DeletebusinessType: async (id) => {
//     return deleteData(`/business_types/delete/${id}`);
//   },
//   Deletesubject: async (id) => {
//     return deleteData(`/subjects/delete/${id}`);
//   },

//   Createclass: async (data) => {
//     return postData(`/class`, data);
//   },

//   getRooms: async (page, limit) => {
//     return getData(`/rooms?page=${page}&limit=${limit}`);
//   },
//   Createroom: async (data) => {
//     return postData(`/rooms`, data);
//   },
//   Createbusiness: async (data) => {
//     return postData(`/businesses`, data);
//   },
//   getBusiness: async (page, limit) => {
//     return getData(`/businesses?page=${page}&limit=${limit}`);
//   },
//   createDepartment: async (data) => {
//     return postData(`/departments`, data);
//   },

//   singlebusinessDelete: async (id) => {
//     return deleteData(`/businesses/${id}`);
//   },

//   getDepartments: async (page, limit) => {
//     return getData(`/departments?page=${page}&limit=${limit}`);
//   },
//   getGlobalfields: async (module, business_type, page, limit) => {
//     return getData(
//       `/modules/fields/${module}/${business_type}?page=${page}&limit=${limit}`
//     );
//   },
//   getGlobalfieldsgroups: async (module, business_type, page, limit) => {
//     return getData(
//       `/groups/${module}/${business_type}?page=${page}&limit=${limit}`
//     );
//   },
//   getGroupsByModuleAndBusinessType: async (module, business_type) => {
//     return getData(`/groups/${module}/${business_type}`);
//   },
//   getBusinessTypes: async (id, page, limit) => {
//     const query = await buildQuery({ page, limit });
//     const url = id
//       ? `/business_types/${id}${query}`
//       : `/business_types${query}`;
//     return getData(url);
//   },
//   createFields: async (data) => {
//     return postData(`/global-fields`, data);
//   },
//   createvendorsFields: async (data) => {
//     return postData(`/vendor-fields`, data);
//   },
//   createForm: async (data) => {
//     return postData(`/forms/`, data);
//   },

//   getForms: async (module, business_type, page, limit) => {
//     return getData(
//       `/forms/get-by-type-module?module=${module}&business_type=${business_type}&page=${page}&limit=${limit}`
//     );
//   },
//   getforms: async (page, limit) => {
//     return getData(`/forms?page=${page}&limit=${limit}`);
//   },
//   Updateform: async (id, data) => {
//     return putData(`/forms/${id}`, data);
//   },

//   Deleteforms: async (id) => {
//     return deleteData(`/forms/${id}`);
//   },

//   getGlobalfields: async (module, business_type, page, limit) => {
//     return getData(
//       `/modules/fields/${module}/${business_type}?page=${page}&limit=${limit}`
//     );
//   },
//   Getattendance: async (page, limit) => {
//     return getData(`/attendence?page=${page}&limit=${limit}`);
//   },

//   getcustomfields: async (page, limit) => {
//     return getData(`/vendor-fields/?page=${page}&limit=${limit}`);
//   },
//   Getteacher: async (page, limit) => {
//     return getData(`/teachers?page=${page}&limit=${limit}`);
//   },
//   createAdmission: async (data) => {
//     return postData(`/admission`, data);
//   },
//   getAdmission: async (page, limit) => {
//     return getData(`/admission?page=${page}&limit=${limit}`);
//   },
//   getClassRoutine: async (page, limit) => {
//     return getData(`/routine?page=${page}&limit=${limit}`);
//   },
//   getExamination: async (page, limit) => {
//     return getData(`/exams?page=${page}&limit=${limit}`);
//   },
//   GetSyllabus: async (page, limit) => {
//     return getData(`/syllabus?page=${page}&limit=${limit}`);
//   },
//   getGrades: async (page, limit) => {
//     return getData(`/grades?page=${page}&limit=${limit}`);
//   },
//   Getstudentfeereport: async (page, limit) => {
//     return getData(`/fees?page=${page}&limit=${limit}`);
//   },
//   GetBooklistmanager: async (page, limit) => {
//     return getData(`/library?page=${page}&limit=${limit}`);
//   },
//   GetAssignment: async (page, limit) => {
//     return getData(`/assignment?page=${page}&limit=${limit}`);
//   },

//   auth: {
//     login: "/user/login",
//     signUp: "/",
//     forgetpassword: "/users/forgetpassword",
//   },
//   student: {
//     all: "/student/all",
//     create: "/",
//     update: "/student/update",
//   },
//   user: {
//     // all: "/user/",
//     // create: "/",
//     update: "/user/update",
//     single: "/user/:id",
//     delete: "/user/:id",
//     updateStatus: "/user/update-status",
//   },
//   rooms: {
//     // all: "/user/",
//     // create: "/rooms/",
//     update: "/rooms/:id",
//     single: "/rooms/:id",
//     delete: "/rooms/:id",
//     search: "/rooms/search",
//     updateStatus: "/rooms/update-status",
//   },
//   uploads: {
//     // all: "/user/",
//     teacher: "/upload/teacher",
//     student: "/upload/student",
//     admission: "/upload/admission",
//   },
//   class: {
//     create: "/class/",
//     update: "/class/:id",
//     delete: "/class/delete/:id",
//     search: "/class/search",
//   },
//   subjects: {
//     create: "/subjects/",
//     update: "/subjects/:id",
//     delete: "/subjects/delete/:id",
//     search: "/subjects/search",
//   },
//   departments: {
//     create: "/departments/",
//     update: "/departments/:id",
//     delete: "/departments/delete/:id",
//     search: "/departments/search",
//   },
//   teachers: {
//     create: "/teachers/",
//     update: "/teachers/:id",
//     delete: "/teachers/delete/:id",
//     search: "/teachers/search",
//   },
//   routine: {
//     create: "/routine/",
//     update: "/routine/:id",
//     delete: "/routine/delete/:id",
//     search: "/routine/search",
//   },
//   exams: {
//     create: "/exams/",
//     update: "/exams/:id",
//     delete: "/exams/delete/:id",
//     search: "/exams/search",
//   },
//   grades: {
//     create: "/grades/",
//     update: "/grades/:id",
//     delete: "/grades/delete/:id",
//     search: "/grades/search",
//   },
//   fees: {
//     create: "/fees/",
//     update: "/fees/:id",
//     delete: "/fees/delete/:id",
//     search: "/fees/search",
//   },
//   library: {
//     create: "/library/",
//     update: "/library/:id",
//     delete: "/library/delete/:id",
//     search: "/library/search",
//   },
//   assignment: {
//     create: "/assignment/",
//     update: "/assignment/:id",
//     delete: "/assignment/delete/:id",
//     search: "/assignment/search",
//   },
//   trips: {
//     create: "/trips/",
//     update: "/trips/:id",
//     delete: "/trips/delete/:id",
//     search: "/trips/search",
//   },
// };
// //================================================= Api Endpoints Ends Here ============================================================//

// //================================================= Api Request Method Starts ============================================================//

// export const apiRequest = async (method, url, data = null) => {
//   const accessToken = localStorage.getItem("accesstoken");

//   const headers = {
//     "Content-Type": "application/json",
//   };

//   if (accessToken) {
//     headers["Authorization"] = `${accessToken}`;
//   }

//   const options = {
//     method,
//     headers,
//   };

//   if (data) {
//     options.body = JSON.stringify(data);
//   }

//   try {
//     const response = await fetch(domainpath + url, options);
//     console.log(response, "response");

//     if (response.status === 401 || response.status === 403) {
//       handleTokenExpiry();
//       return;
//     }
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error("API Request Error:", error);
//     toast.error("Something went wrong. Please try again.");
//     throw error;
//   }
// };

// const getData = async (url) => {
//   return apiRequest("GET", url);
// };

// const postData = async (url, data) => {
//   return apiRequest("POST", url, data);
// };

// const putData = async (url, data) => {
//   return apiRequest("PUT", url, data);
// };

// const deleteData = async (url, payload) => {
//   return apiRequest("DELETE", url, payload);
// };

// const buildQuery = async (params = {}) => {
//   const queryParams = new URLSearchParams();

//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       queryParams.append(key, value);
//     }
//   });

//   return queryParams.toString() ? `?${queryParams.toString()}` : "";
// };

// const extractFieldsFromResponse = (response, options = {}) => {
//   if (!response?.data) return [];

//   const { onlyActive = false } = options;

//   const groupFields =
//     response.data.groups?.flatMap((group) => {
//       const groupName = group.name || "";
//       return (group.fields || []).map((field) => ({
//         ...field,
//         groupName,
//       }));
//     }) || [];

//   const metaFields = response.data.metaFields || [];

//   let allFields = [...groupFields, ...metaFields];

//   if (onlyActive) {
//     allFields = allFields.filter((field) => field.status === "active");
//   }

//   return allFields;
// };

// export {
//   API,
//   domainpath,
//   getData,
//   postData,
//   putData,
//   deleteData,
//   extractFieldsFromResponse,
// };
// //================================================= Api Request Method Ends ====================================
// *****************************************************new dynamic api starts here****************************************//

import axios from "axios";
import { toast } from "react-toastify";

// ---------------- Get Subdomain ---------------- //
const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split(".");
  if (host.includes("localhost") && parts.length === 2) return parts[0];
  if (parts.length > 2) return parts[0];
  return null;
};

const subdomain = getSubdomain();

const domainpath = subdomain
  ? `http://${subdomain}.localhost:5001/api`
  : `http://localhost:5001/api`;

// ---------------- Token Expiry Handler ---------------- //
const handleTokenExpiry = () => {
  localStorage.removeItem("accesstoken");
  localStorage.removeItem("refreshtoken");

  document.cookie = "accesstoken=; Max-Age=0; path=/;";
  document.cookie = "refreshtoken=; Max-Age=0; path=/;";

  toast.error("Session expired. Please login again.");
  setTimeout(() => (window.location.href = "/login"), 2500);
};

// ---------------- Axios Request Wrapper ---------------- //
const makeRequest = async (
  method,
  url,
  data = {},
  params = {},
  customHeaders = {}
) => {
  const token = localStorage.getItem("accesstoken");

  try {
    const response = await axios({
      method,
      url: `${domainpath}${url}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...customHeaders,
      },
      data,
      params,
    });

    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      handleTokenExpiry();
    }

    const msg =
      error?.response?.data?.message || "Something went wrong. Try again!";
    toast.error(msg);

    console.error(
      `[API ${method.toUpperCase()}] ${url}:`,
      error.response || error
    );
    throw error;
  }
};

// ---------------- Query Builder ---------------- //
const buildQuery = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });
  return queryParams.toString() ? `?${queryParams.toString()}` : "";
};

// ---------------- Helper: Schema Field Extractor ---------------- //
const extractGlobalFieldsFromResponse = (response, options = {}) => {
  const { onlyActive = false } = options;

  if (!Array.isArray(response?.data)) return [];

  const allFields = response.data.flatMap((schema) => {
    return schema.fields.map((field) => ({
      ...field,
      groupId: field.group,
      business_type: schema.business_type,
      module: schema.module,
      tenant_id: schema.tenant_id,
    }));
  });

  return onlyActive
    ? allFields.filter((field) => field.status === "active")
    : allFields;
};

// ---------------- Core Methods ---------------- //
const getData = (url, params = {}, headers = {}) =>
  makeRequest("get", url, {}, params, headers);

const postData = (url, data = {}, headers = {}) =>
  makeRequest("post", url, data, {}, headers);

const putData = (url, data = {}, headers = {}) =>
  makeRequest("put", url, data, {}, headers);

const deleteData = (url, data = {}, headers = {}) =>
  makeRequest("delete", url, data, {}, headers);

// ---------------- Dynamic CRUD API ---------------- //
const API = {
  auth: {
    login: "/auth/login",
  },

  shift: {
    getAll: (params = {}) => getData("/shift", params),
    getById: (id) => getData(`/shift/${id}`),
    add: (data) => postData("/shift", data),
    update: (id, data) => putData(`/shift/${id}`, data),
    remove: (id) => deleteData(`/shift/${id}`),
    bulkRemove: (data) => postData("/shift/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/shift/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  // Generic CRUD methods
  // getAll: (params) => getData("/sections/all", params),
  getById: (module, id) => getData(`/${module}/${id}`),
  add: (module, data) => postData(`/${module}`, data),
  update: (module, id, data) => putData(`/${module}/${id}`, data),
  search: (module, searchTerm, page = 0, limit = 10, filters = {}) =>
    getData(`/${module}/search`, {
      search: searchTerm,
      page,
      limit,
      ...filters,
    }),
  remove: (module, id) => deleteData(`/${module}/${id}`),
  bulkRemove: (module, data) => postData(`/${module}/delete`, data),

  // Specific endpoints
  getSingleForm: (params) => getData("/form/single", params),

  getEmployees: (search = "", page = 0, limit = 10, filters = {}) =>
    getData("/employees/all", {
      search,
      page,
      limit,
      ...filters,
    }),

  updateStatus: (data) => putData("/employees/status", data),

  // ✅ Fixed Login API (NO double /api)
  login: (data) => postData("/auth/login", data),

  // ✅ Section-specific helpers

  section: {
    getAll: (params) => getData("/sections/all", params),
    getAll: (params = {}) => getData("/sections", params),
    getById: (id) => getData(`/sections/${id}`),
    add: (data) => postData("/sections", data),
    update: (id, data) => putData(`/sections/${id}`, data),
    remove: (id) => deleteData(`/sections/${id}`),
    bulkRemove: (data) => postData("/sections/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/sections/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  rfid: {
    getAll: (params) => getData("/rfid", params),
    getById: (id) => getData(`{{url}}/api/rfid/${id}`),
    add: (data) => postData("{{url}}/api/rfid", data),
    update: (id, data) => putData(`{{url}}/api/rfid/${id}`, data),
    remove: (id) => deleteData(`{{url}}/api/rfid/${id}`),
    bulkRemove: (data) => postData("{{url}}/api/rfid/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("{{url}}/api/rfid/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  // ✅ Attendance-specific helpers
  attendance: {
    getAll: (params) => getData("/attendance/all", params),
    getById: (id) => getData(`/attendance/${id}`),
    add: (data) => postData("/attendance", data),
    update: (id, data) => putData(`/attendance/${id}`, data),
    remove: (id) => deleteData(`/attendance/${id}`),
    bulkRemove: (data) => postData("/attendance/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/attendance/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },

  contractor: {
    getAll: (params = {}) => getData("/contractors/", params),
    getById: (id) => getData(`/contractors/${id}`),
    add: (data) => postData("/contractors", data),
    update: (id, data) => putData(`/contractors/${id}`, data),
    remove: (id) => deleteData(`/contractors/${id}`),
    bulkRemove: (data) => postData("/contractors/delete", data),
    search: (searchTerm = "", page = 0, limit = 10, filters = {}) =>
      getData("/contractors/search", {
        search: searchTerm,
        page,
        limit,
        ...filters,
      }),
  },
};

export {
  API,
  domainpath,
  getData,
  postData,
  putData,
  deleteData,
  extractGlobalFieldsFromResponse,
};

// *****************************************************new dynamic api ends here****************************************//
