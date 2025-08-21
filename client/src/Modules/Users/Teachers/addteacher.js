import React, { useState, useEffect } from "react";
import { API, domainpath } from "../../../Helpers/api.js";
import Validator from "../../../Helpers/validators.js";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Rules from "./rules.js";

const updateRulesWithDynamicFields = (dynamicData) => {
  const allFields = [
    ...(dynamicData.groups?.flatMap((group) => group.fields) || []),
    ...(dynamicData.metaFields || []),
  ];

  allFields.forEach((field) => {
    const {
      key,
      label,
      required,
      type,
      options,
      allowed_file_types,
      max_file_size,
    } = field;

    const rule = {
      required: !!required,
      type: "string",
      errorMessage: `${label} is required.`,
    };

    switch (type) {
      case "text":
      case "textarea":
        rule.type = "string";
        break;
      case "number":
        rule.type = "number";
        break;
      case "dropdown":

      case "radio":
        rule.type = "string";
        if (options?.length) rule.allowedValues = options;
        break;
      case "checkbox":
        rule.type = "boolean";
        break;
      case "email":
        rule.type = "string";
        rule.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        rule.errorMessage = `A valid ${label} is required.`;
        break;
      case "phone":
        rule.type = "string";
        rule.pattern = /^[0-9]{10}$/;
        rule.errorMessage = `A valid 10-digit ${label} is required.`;
        break;
      case "attachment":
        rule.type = "file";
        if (allowed_file_types?.length)
          rule.allowedFileTypes = allowed_file_types;
        if (max_file_size) rule.maxFileSize = max_file_size;
        break;
      case "date":
        rule.type = "string";
        break;
      default:
        rule.type = "string";
    }

    Rules[key] = rule;
  });
};

const TeacherForm = () => {
  const [verification, setVerification] = useState({
    aadhaar: "",
    pan: "",
    voter_or_dl: "",
    photo: "",
    documents: "",
  });
  const [selectedFiles, setSelectedFiles] = useState({
    aadhaar: null,
    pan: null,
    voter_or_dl: null,
    photo: null,
    documents: null,
  });
  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "Active", label: "Active" },
    { value: "Disabled", label: "Disabled" },
    { value: "Left", label: "Left" },
    { value: "OnLeave", label: "On Leave" },
  ];
  const genderOptions = [
    { value: "", label: "Select gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  const [personalInfo, setPersonalInfo] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    blood_group: "",
    address: "",
    aadhaar: "",
    pan: "",
    voter_or_dl: "",
    photo: "",
    status: "",
    // documents: "",
  });
  const [formData, setFormData] = useState(personalInfo);

  const [errors, setErrors] = useState({});
  const [formConfig, setformConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    first_name: false,
    middle_name: false,
    last_name: false,
    email: false,
    phone: false,
    dob: false,
    gender: false,
    blood_group: false,
    address: false,
  });
  let validator;
  validator = new Validator(Rules);
  // Validate the entire form
  const validateForm = async (formData) => {
    const validationErrors = await validator.validate(formData, Rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  const navigate = useNavigate();
  // Validate input field on blur
  let handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: Rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(setPersonalInfo, "setPersonalInfo");
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const fieldName = event.target.name;

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(domainpath + API.uploads.teacher, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // Update file URL
        setVerification((prev) => ({
          ...prev,
          [fieldName]: data?.filePath || "", // adjust according to your backend response
        }));

        // Save selected file name
        setSelectedFiles((prev) => ({
          ...prev,
          [fieldName]: file,
        }));
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  // Submit form
  const handleSubmit = async (e) => {
    // console.log(verification, "verification");
    e.preventDefault();
    const completeFormData = {
      ...personalInfo,
      professional_info,
      qualifications,
      other_expertise,
      bank_details,
      verification,
    };

    console.log("Complete Structured Data:", completeFormData);
    setLoading(true);
    const isValid = await validateForm(completeFormData);
    console.log(isValid, "isValid");

    // if (!isValid) {
    //   setLoading(false);
    //   return;
    // }
    try {
      console.log("Submitting data:", completeFormData);
      const result = await API.createteacher(completeFormData);
      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("Teacher created successfully!");
        setFormData(completeFormData);
      } else {
        toast.error(result.message || "Failed to create Teacher.");
      }
    } catch (error) {
      console.error("Error creating Teacher:", error);
      // toast.error(
      //   "An error occurred while creating the Teacher. Please try again."
      // );
    } finally {
      setLoading(false);
    }
  };

  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const [other_expertise, setother_expertise] = useState([
    { name: "", title: "", year: "", upload: null },
  ]);
  const addother_expertise = () => {
    setother_expertise([
      ...other_expertise,
      { name: "", title: "", year: "", upload: null },
    ]);
  };
  const removeother_expertise = (indexToRemove) => {
    setother_expertise(
      other_expertise.filter((_, index) => index !== indexToRemove)
    );
  };
  const handleExpertiseChange = (index, field, value) => {
    const updated = [...other_expertise];
    updated[index][field] = value;
    setother_expertise(updated);
  };

  const [qualifications, setQualifications] = useState([
    { qualification: "", university: "", year: "", file: null },
  ]);
  // qualification section
  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { qualification: "", university: "", year: "", file: null },
    ]);
  };
  const removeQualification = (indexToRemove) => {
    setQualifications(
      qualifications.filter((_, index) => index !== indexToRemove)
    );
  };
  const [userData, setUserData] = useState({
    joining_date: "",
    leaving_date: "",
    experience: "",
  });
  const [bank_details, setBank_details] = useState([
    {
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      branch: "",
      file: null,
    },
  ]);
  const addBankDetail = () => {
    setBank_details([
      ...bank_details,
      {
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        branch: "",
        file: null,
      },
    ]);
  };
  const fetchFields = async () => {
    setLoading(true);
    try {
      var module = "teacher";
      var business_Type = "education";
      const res = await API.getGlobalfields(module, business_Type, 1, 50);
      const globalFields = res?.data || [];
      setformConfig(globalFields);
      console.log(globalFields, "globalFields");
      updateRulesWithDynamicFields(globalFields);

      console.log(Rules, "finalRules");
      // Wait 100ms (or more) before initializing validator
      setTimeout(() => {
        validator = new Validator(Rules);

        // Example: run validation or proceed with logic after validator is ready
        const result = validator.validate(formData);
        console.log(result);
      }, 100); // 100ms delay

      setLoading(false);
      // globalFields.forEach((field) => {
      //   initial[field.field_key] = field.type === "attachment" ? null : "";
      // });

      // setFields(globalFields);
      // setFormData(initial);
    } catch (err) {
      console.error("Error fetching global fields:", err);
    } finally {
    }
  };

  const removeBankDetail = (indexToRemove) => {
    setBank_details(bank_details.filter((_, index) => index !== indexToRemove));
  };

  const handleQualificationChange = (index, field, value) => {
    const updated = [...qualifications];
    updated[index][field] = value;
    setQualifications(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...qualifications];
    updated[index].file = file;
    setQualifications(updated);
  };
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const teacherSkills = [
    "Classroom Management",
    "Curriculum Planning",
    "Lesson Planning",
    "Subject Matter Expertise",
    "Communication Skills",
    "Student Engagement",
    "Differentiated Instruction",
    "Assessment and Evaluation",
    "Technology Integration",
    "Collaboration with Colleagues",
    "Adaptability",
    "Conflict Resolution",
    "Critical Thinking",
    "Problem Solving",
    "Time Management",
    "Leadership",
    "Emotional Intelligence",
    "Creative Teaching",
    "Online Teaching Tools",
    "Google Classroom",
    "Microsoft Teams",
    "Zoom/Video Conferencing",
    "Parent Communication",
    "Behavior Management",
    "Inclusive Teaching",
    "Special Education Knowledge",
    "Multilingual Teaching",
    "STEM Instruction",
    "Arts Integration",
    "Team Teaching",
    "Data-Driven Instruction",
  ];
  const tqualifications = [
    "D.El.Ed (Diploma in Elementary Education)",
    "B.Ed (Bachelor of Education)",
    "M.Ed (Master of Education)",
    "B.El.Ed (Bachelor of Elementary Education)",
    "BTC (Basic Training Certificate)",
    "NTT (Nursery Teacher Training)",
    "CTET (Central Teacher Eligibility Test)",
    "STET (State Teacher Eligibility Test)",
    "TET (Teacher Eligibility Test)",
    "Ph.D in Education",
    "M.A. in Education",
    "BA/B.Sc + B.Ed (Integrated Degree)",
    "M.Phil in Education",
    "Diploma in Special Education",
    "UGC NET (National Eligibility Test)",
  ];
  const indianUniversities = [
    "University of Delhi (DU)",
    "Jawaharlal Nehru University (JNU)",
    "Banaras Hindu University (BHU)",
    "Jamia Millia Islamia (JMI)",
    "Aligarh Muslim University (AMU)",
    "Guru Gobind Singh Indraprastha University (GGSIPU)",
    "University of Mumbai",
    "Savitribai Phule Pune University",
    "University of Calcutta",
    "Jadavpur University",
    "University of Madras",
    "Anna University",
    "Osmania University",
    "Dr. B.R. Ambedkar Open University",
    "Panjab University",
    "Lovely Professional University (LPU)",
    "Amity University",
    "Christ University",
    "Symbiosis International University",
    "Tata Institute of Social Sciences (TISS)",
    "Indira Gandhi National Open University (IGNOU)",
    "Birla Institute of Technology and Science (BITS Pilani)",
    "Vellore Institute of Technology (VIT)",
    "SRM Institute of Science and Technology",
    "Manipal Academy of Higher Education",
  ];
  const teacherproffessionalSkills = [
    "Instructional Design",
    "Project-Based Learning",
    "Student-Centered Learning",
    "Formative Assessment Strategies",
    "Gamification in Education",
    "Flipped Classroom Implementation",
    "Digital Content Creation",
    "Educational Leadership",
    "Cross-Curricular Teaching",
    "Education Policy Awareness",
    "Hybrid Teaching Models",
    "Cultural Competency",
    "Professional Development Planning",
    "Virtual Classroom Management",
    "Interactive Whiteboard Proficiency",
    "Learning Management Systems (LMS)",
    "AI-Powered Teaching Tools",
    "Ethical Use of Technology in Education",
    "Curriculum Mapping",
    "Experiential Learning",
    "Emotional and Social Learning (SEL)",
    "Peer Mentoring",
    "Holistic Student Development",
    "21st Century Skills Training",
    "Forming Student Support Groups",
    "Blended Learning Techniques",
    "Digital Literacy Instruction",
    "Universal Design for Learning (UDL)",
    "Research-Based Instruction",
    "Education Analytics Usage",
  ];

  const [professional_info, setprofessional_info] = useState([
    {
      designation: "",
      joining_date: "",
      leaving_date: "",
      employeeId: "",
      experience: "",
      subjects_taught: "",
      class_handled: "",
      previous_institute: "",
      skills: [],
    },
  ]);

  const addprofessional_info = () => {
    setprofessional_info([
      ...professional_info,
      {
        designation: "",
        joining_date: "",
        leaving_date: "",
        employeeId: "",
        experience: "",
        subjects_taught: "",
        class_handled: "",
        previous_institute: "",
        skills: [],
      },
    ]);
  };

  const removeprofessional_info = (indexToRemove) => {
    setprofessional_info(
      professional_info.filter((_, i) => i !== indexToRemove)
    );
  };

  const handleProfessionalChange = (index, field, value) => {
    const updated = [...professional_info];
    updated[index][field] = value;
    setprofessional_info(updated);
  };

  useEffect(() => {
    const { joining_date, leaving_date } = userData;

    if (joining_date && leaving_date) {
      const start = new Date(joining_date);
      const end = new Date(leaving_date);

      if (!isNaN(start) && !isNaN(end) && end > start) {
        const diffInMs = end - start;
        const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
        const roundedYears = Math.floor(diffInYears);

        setUserData((prev) => ({
          ...prev,
          experience: roundedYears,
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          experience: "",
        }));
      }
    }
    fetchFields();
  }, [userData.joining_date, userData.leaving_date]);

  return (
    <div className="min-h-screen">
      <div className="flex justify-between">
        <div className="AJ-crm-adding-title-section ">
          <h2 className="text-2xl font-bold  mb-4 px-3 ">Add Teacher</h2>
        </div>

        <div>
          <button
            className="crm-buttonsection"
            // onClick={toggleAddUserForm}
            onClick={() => navigate("/dashboard/users/teachers")}
          >
            <svg
              fill="white"
              width={22}
              height={22}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
            >
              <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
            </svg>
            View Teachers
          </button>
        </div>
      </div>

      <form
        // onSubmit={handleSubmit}
        className="flex flex-col md:flex-row rounded-lg overflow-x-auto"
      >
        {/* Personal Info */}
        <div className="AJ-section AJ-left-section">
          <div className="AJ-Form-block AJ-crm-personal">
            <div className="p-10">
              <h3 className="text-xl font-bold">PERSONAL INFO</h3>
            </div>

            <div className="border-t border-gray-300 w-full my-2"></div>

            <div className="grid  grid-cols-2 gap-y-1 gap-x-4 ">
              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "first_name"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                {/* <span className="text-red-500">{errors.first_name}</span> */}
                <label className="AJ-floating-label">First Name</label>
              </div>

              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "middle_name"
                  )} AJ-floating-input`}
                  placeholder=" "
                />

                <label className="AJ-floating-label">Middle Name</label>
              </div>

              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "last_name"
                  )} AJ-floating-input`}
                  placeholder=""
                />

                <label className="AJ-floating-label">Last Name</label>
              </div>

              <div className="AJ-floating-label-wrapper ">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("dob")} AJ-floating-input`}
                />

                <label className="AJ-floating-label">Date Of Birth</label>
              </div>
              <div className="AJ-floating-label-wrapper  ">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("gender")} AJ-floating-input`}
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className="AJ-floating-label">Gender</label>
              </div>
              <div className="AJ-floating-label-wrapper  ">
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "blood_group"
                  )} AJ-floating-select AJ-floating-input`}
                >
                  <option value="" disabled></option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>

                <label className="AJ-floating-label">Blood Group</label>
              </div>
              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("email")} AJ-floating-input`}
                  placeholder=""
                />

                <label className="AJ-floating-label">Email</label>
              </div>
              <div className="AJ-floating-label-wrapper ">
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("phone")} AJ-floating-input`}
                  placeholder=""
                />

                <label className="AJ-floating-label">Phone</label>
              </div>

              <div></div>
            </div>
            <div className="AJ-floating-label-wrapper ">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getFieldClassName("status")} AJ-floating-input`}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="AJ-floating-label">Status</label>
            </div>
            <div className="AJ-floating-label-wrapper">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${getFieldClassName(
                  "address"
                )} AJ-floating-textarea AJ-floating-input`}
                placeholder=""
                autoComplete="off"
              ></textarea>
              <label className="AJ-floating-label">
                Address<span className="text-red-500">*</span>
              </label>
            </div>

            <div className="AJ-floating-label-wrapper  ">
              <select
                className="AJ-floating-select AJ-floating-input"
                name="skills"
                multiple
              >
                <option disabled>select </option>

                {teacherSkills.map((skills) => (
                  <option key={skills} value={skills}>
                    {skills}
                  </option>
                ))}
              </select>

              <label className="AJ-floating-label">Skills</label>
            </div>
          </div>
          {/* Verification Info */}
          <div className="AJ-Form-block AJ-crm-personal">
            <div className="">
              <h3 className="text-xl font-bold">VERIFICATION & DOCUMENTS</h3>
              <div className="border-t border-gray-300 w-full my-2"></div>
              <div className="AJ-crm-combinition space-y-4 grid  grid-cols-1 gap-y-1 gap-x-4 ">
                <div className="file-upload flex  ">
                  <input
                    className="  hidden"
                    type="file"
                    name="aadhaar"
                    id="aadhaar"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <div className="AJ-crm-adhar-label">
                    <label className="text-sm">Upload Adhar Card :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="aadhaar"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {selectedFiles.aadhaar
                        ? `Adhar-Attachment: ${selectedFiles.aadhaar.name}`
                        : " + Upload file "}
                    </label>
                  </div>
                </div>
                <div className="file-upload flex justify-around">
                  <input
                    className="AJ-floating-input hidden"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    name="pan"
                    id="pan"
                  />
                  <div className="AJ-crm-pan-label">
                    <label className="text-sm">Upload Pan Card :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="pan"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {selectedFiles.pan
                        ? `Pan-Attachment: ${selectedFiles.pan.name}`
                        : " + Upload file "}
                    </label>
                  </div>
                </div>
                <div className="file-upload flex justify-around">
                  <input
                    className="AJ-floating-input hidden"
                    type="file"
                    name="voter_or_dl"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    id="voter_or_dl"
                  />
                  <div className="AJ-crm-voter-label">
                    <label className="text-sm">Upload Voter Id :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="voter_or_dl"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {selectedFiles.voter_or_dl
                        ? `Voterid-Attachment: ${selectedFiles.voter_or_dl.name}`
                        : " + Upload file "}
                    </label>
                  </div>
                </div>
                <div className="file-upload flex justify-around">
                  <input
                    className="AJ-floating-input hidden"
                    type="file"
                    name="photo"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    id="photo"
                  />
                  <div className="AJ-crm-photo-label">
                    <label className="text-sm">Upload Photograph :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="photo"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {selectedFiles.photo
                        ? `Photograph-Attachment: ${selectedFiles.photo.name}`
                        : " + Upload file"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="btn"
            onClick={(e) => handleSubmit(e)}
            disabled={loading}
            className={`AJ-Form-submit-button mt-4 w-100 mt-10 mx-auto block px-10 text-white rounded flex items-center justify-center gap-2 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            {loading ? "Creating..." : "Create"}
          </button>
        </div>

        <div className="AJ-section AJ-right-section h-auto">
          {/* qualification */}
          <div className="AJ-Form-block AJ-crm-professional">
            <div className="AJ-crm-top-most-title-with-add flex justify-between  border-gray-300 w-full  mb-5 border-b -borderDarkBlue    ">
              <div className="AJ-crm-qualification">
                <h3 className="text-xl font-bold">QUALIFICATIONS</h3>
              </div>
              <div>
                <button
                  type="button"
                  onClick={addQualification}
                  className=" bg-green-600 text-white px-3 py-1 mb-1 mr-12 rounded"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="AJ-crm-combinition grid grid-cols-1 gap-4">
              {qualifications.map((q, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-y-1 gap-x-3 AJ-floating-label-wrapper"
                >
                  <div className="AJ-floating-label-wrapper">
                    <select
                      name={`qualification-${index}`}
                      className="AJ-floating-select AJ-floating-input"
                      value={q.qualification}
                      onChange={(e) =>
                        handleQualificationChange(
                          index,
                          "qualification",
                          e.target.value
                        )
                      }
                    >
                      <option disabled></option>
                      {tqualifications.map((qualification) => (
                        <option value={qualification}>{qualification}</option>
                      ))}
                    </select>

                    <label className="AJ-floating-label">Qualification</label>
                  </div>

                  <div className="first-left AJ-floating-label-wrapper ">
                    <select
                      name={`university-${index}`}
                      className="AJ-floating-select AJ-floating-input"
                      value={q.university}
                      onChange={(e) =>
                        handleQualificationChange(
                          index,
                          "university",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select</option>
                      {indianUniversities.map((indianUniversiy) => (
                        <option value={indianUniversiy}>
                          {indianUniversiy}
                        </option>
                      ))}
                    </select>

                    <label className="AJ-floating-label">University</label>
                  </div>

                  <div className="AJ-floating-label-wrapper ">
                    <input
                      className="AJ-floating-input"
                      type="number"
                      name={`year-${index}`}
                      placeholder=""
                      value={q.year}
                      onChange={(e) =>
                        handleQualificationChange(index, "year", e.target.value)
                      }
                    />
                    <label className="AJ-floating-label">Year</label>
                  </div>

                  <div className="AJ-crm-upload-point-qualification relative">
                    <input
                      className="AJ-floating-input hidden"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      name={`documents-${index}`}
                      id={`documents-${index}`}
                      onChange={(e) =>
                        handleFileChange(index, e.target.files[0])
                      }
                    />
                    <label
                      htmlFor={`documents-${index}`}
                      className="inline-block text-sm border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-gray-100 text-center cursor-pointer hover:bg-gray-200 transition duration-200"
                    >
                      {q.documents
                        ? `Selected: ${q.documents.name}`
                        : "+ Upload file"}
                    </label>
                  </div>

                  {index > 0 && (
                    <div className="AJ-crm-remove-button flex items-end">
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="rounded bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                      >
                        <svg
                          fill="white"
                          width={28}
                          height={28}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* experience info */}

          <div className="AJ-Form-block AJ-crm-qualifications">
            <div className="AJ-top-title-professional flex justify-between ">
              <h3 className="text-xl font-bold"> EXPERIENCE</h3>
              <button
                type="button"
                onClick={addprofessional_info}
                className="bg-green-600 text-white px-3 py-1 mb-1 mr-12 rounded"
              >
                + Add
              </button>
            </div>

            {professional_info.map((item, index) => (
              <div
                key={index}
                className="border-t border-gray-300 w-full my-4 relative"
              >
                {index > 0 && (
                  <div className="AJ-crm-remove-button justify-end flex items-end">
                    <button
                      type="button"
                      onClick={() => removeprofessional_info(index)}
                      className="rounded bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                    >
                      <svg
                        fill="white"
                        width={28}
                        height={28}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                      >
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-y-1 gap-x-4 mt-4">
                  <div className="AJ-floating-label-wrapper">
                    <input
                      className="AJ-floating-input"
                      type="text"
                      name="designation"
                      value={item.designation}
                      onChange={(e) =>
                        handleProfessionalChange(
                          index,
                          "designation",
                          e.target.value
                        )
                      }
                      placeholder=""
                    />
                    <label className="AJ-floating-label">Designation</label>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                    <div className="AJ-floating-label-wrapper">
                      <input
                        className="AJ-floating-input"
                        type="date"
                        value={item.joining_date}
                        name="joining_date"
                        onChange={(e) =>
                          handleProfessionalChange(
                            index,
                            "joining_date",
                            e.target.value
                          )
                        }
                        placeholder=""
                      />
                      <label className="AJ-floating-label">Joining Date</label>
                    </div>
                    <div className="AJ-floating-label-wrapper">
                      <input
                        className="AJ-floating-input"
                        type="date"
                        name="leaving_date"
                        value={item.leaving_date}
                        onChange={(e) =>
                          handleProfessionalChange(
                            index,
                            "leaving_date",
                            e.target.value
                          )
                        }
                        placeholder=""
                      />
                      <label className="AJ-floating-label">Leaving Date</label>
                    </div>
                  </div>

                  <div className="AJ-floating-label-wrapper">
                    <input
                      className="AJ-floating-input"
                      type="number"
                      name="employeeId"
                      value={item.employeeId}
                      onChange={(e) =>
                        handleProfessionalChange(
                          index,
                          "employeeId",
                          e.target.value
                        )
                      }
                      placeholder=""
                    />
                    <label className="AJ-floating-label">Employee Id</label>
                  </div>

                  <div className="AJ-floating-label-wrapper">
                    <input
                      className="AJ-floating-input"
                      type="number"
                      name="experience"
                      value={item.experience}
                      readOnly
                      placeholder=""
                    />
                    <label className="AJ-floating-label">
                      Years Of Experience
                    </label>
                  </div>

                  <div className="AJ-floating-label-wrapper">
                    <input
                      className="AJ-floating-input"
                      type="text"
                      name="subjects_taught"
                      value={item.subjects_taught}
                      onChange={(e) =>
                        handleProfessionalChange(
                          index,
                          "subjects_taught",
                          e.target.value
                        )
                      }
                      placeholder=""
                    />
                    <label className="AJ-floating-label">Subjects Taught</label>
                  </div>

                  <div className="AJ-floating-label-wrapper">
                    <select
                      className="AJ-floating-select AJ-floating-input"
                      value={item.class_handled}
                      name="class_handled"
                      multiple
                      onChange={(e) =>
                        handleProfessionalChange(
                          index,
                          "class_handled",
                          e.target.value
                        )
                      }
                    >
                      <option value=""> </option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <label className="AJ-floating-label">Class Handled</label>
                  </div>
                </div>

                <div className="AJ-crm-combinition space-y-4 grid grid-cols-2 gap-y-1 gap-x-4 mt-2">
                  <div className="AJ-floating-label-wrapper">
                    <input
                      className="AJ-floating-input"
                      type="text"
                      name="previous_institute"
                      value={item.previous_institute}
                      onChange={(e) =>
                        handleProfessionalChange(
                          index,
                          "previous_institute",
                          e.target.value
                        )
                      }
                      placeholder=""
                    />
                    <label className="AJ-floating-label">
                      Previous Institute
                    </label>
                  </div>

                  <div className="AJ-floating-label-wrapper">
                    <select
                      className="AJ-floating-select AJ-floating-input"
                      multiple
                      name="skills"
                      value={item.skills}
                      onChange={(e) =>
                        handleProfessionalChange(
                          index,
                          "skills",
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          )
                        )
                      }
                    >
                      <option disabled>select</option>
                      {teacherproffessionalSkills.map((skillss) => (
                        <option key={skillss} value={skillss}>
                          {skillss}
                        </option>
                      ))}
                    </select>
                    <label className="AJ-floating-label">Skills</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* other expertise */}
          <div className="AJ-Form-block AJ-crm-expertise">
            <div>
              <div className="AJ-crm-top-most-title-with-add flex justify-between  border-gray-300 w-full my-2 mt-8 border-b -borderDarkBlue   pb-2 ">
                <div className="AJ-crm-qualification">
                  <div>
                    <h3 className="text-xl font-bold">OTHER EXPERTISE</h3>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addother_expertise}
                    className="mt-2 bg-green-600 text-white px-3 py-1 mr-12 rounded"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
            <div className="AJ-crm-combinition grid grid-cols-1 gap-4">
              {other_expertise.map((expertise, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-y-1 gap-x-3 AJ-floating-label-wrapper "
                >
                  <div className="AJ-floating-label-wrapper">
                    <input
                      className="AJ-floating-input"
                      type="text"
                      name={`expertisename-${index}`}
                      placeholder=""
                      value={expertise.name}
                      onChange={(e) =>
                        handleExpertiseChange(index, "name", e.target.value)
                      }
                    />
                    <label className="AJ-floating-label">Name</label>
                  </div>

                  <div className="AJ-floating-label-wrapper">
                    <select
                      name={`expertisetitle-${index}`}
                      className="AJ-floating-select AJ-floating-input"
                      value={expertise.title}
                      onChange={(e) =>
                        handleExpertiseChange(index, "title", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="communication">Communication</option>
                      <option value="teamwork">Teamwork</option>
                      <option value="leadership">Leadership</option>
                      <option value="creativity">Creativity</option>
                    </select>
                    <label className="AJ-floating-label">Title</label>
                  </div>

                  <div className="AJ-floating-label-wrapper ">
                    <input
                      className="AJ-floating-input"
                      type="number"
                      name={`expertise-year-${index}`}
                      placeholder=""
                      value={expertise.year}
                      onChange={(e) =>
                        handleExpertiseChange(index, "year", e.target.value)
                      }
                    />
                    <label className="AJ-floating-label">Year</label>
                  </div>

                  <div className="AJ-crm-upload-point-qualification relative">
                    <input
                      className="AJ-floating-input hidden"
                      type="file"
                      name={`expertise-upload-${index}`}
                      id={`expertise-upload-${index}`}
                      onChange={(e) =>
                        handleExpertiseChange(
                          index,
                          "upload",
                          e.target.files[0]
                        )
                      }
                    />
                    <label
                      htmlFor={`expertise-upload-${index}`}
                      className="inline-block text-sm border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-gray-100 text-center cursor-pointer hover:bg-gray-200 transition duration-200"
                    >
                      {expertise.upload
                        ? `Otherexpertise-Attachment: ${expertise.upload.name}`
                        : "+ Upload file"}
                    </label>
                  </div>

                  {index > 0 && (
                    <div className="AJ-crm-remove-button flex items-end">
                      <button
                        type="button"
                        onClick={() => removeother_expertise(index)}
                        className="rounded bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                      >
                        <svg
                          fill="white"
                          width={20}
                          height={20}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* bank details */}
          <div className="AJ-Form-block AJ-crm-qualifications">
            <div className="AJ-crm-top-most-title-with-add flex justify-between  border-gray-300 w-full my-2 mb-3    pb-2 border-b ">
              <div className="AJ-crm-qualification">
                <h3 className="text-xl font-bold">BANK DETAILS</h3>
              </div>
              <div>
                <button
                  type="button"
                  onClick={addBankDetail}
                  // onClick={addbank_details}
                  className="mt-2 bg-green-600 text-white px-3 py-1 mr-12 rounded"
                >
                  + Add
                </button>
              </div>
            </div>
            {bank_details.map((bank, index) => (
              <div
                key={index}
                className=" AJ-crm-bank-section grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
              >
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    name="accountholdername"
                    type="text"
                    placeholder=""
                    value={bank.accountholdername}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].accountholdername = e.target.value;
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">Account Holder </label>
                </div>
                <div className="AJ-crm-baniking ">
                  <input
                    className="AJ-floating-input"
                    type="text"
                    placeholder=""
                    value={bank.bank_name}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].bank_name = e.target.value;
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">bank_name</label>
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    type="text"
                    value={bank.account_number}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].account_number = e.target.value;
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">Account Number</label>
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    type="password"
                    value={bank.account_number}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].account_number = e.target.value;
                      // Simple matching check
                      if (updated[index].account_number !== e.target.value) {
                        updated[index].error = "Account number do not match";
                      } else {
                        updated[index].error = "";
                      }
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">
                    Reconfirm Account Number
                  </label>
                  {bank.error && (
                    <span className="text-red-500 text-sm">{bank.error}</span>
                  )}
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    name="ifsc_code"
                    type="text"
                    value={bank.ifsc_code}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].ifsc_code = e.target.value;
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">IFSC Code</label>
                </div>

                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    name="cisf"
                    placeholder=""
                    type="text"
                    value={bank.cisf}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].cisf = e.target.value;
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">CISF Code</label>
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    name="micr"
                    placeholder=""
                    type="number"
                    value={bank.micr}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].micr = e.target.value;
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">MICR Code</label>
                </div>

                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    type="text"
                    value={bank.branch}
                    onChange={(e) => {
                      const updated = [...bank_details];
                      updated[index].branch = e.target.value;
                      setBank_details(updated);
                    }}
                  />
                  <label className="AJ-floating-label">Branch</label>
                </div>

                <div className=" AJ-crm-bank-section ">
                  <div className="AJ-crm-baniking grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                    <input
                      className="AJ-floating-input"
                      placeholder=""
                      type="file"
                      name="documents"
                      onChange={(e) => {
                        const updated = [...bank_details];
                        updated[index].file = e.target.files[0];
                        setBank_details(updated);
                      }}
                    />
                    <label className="AJ-floating-label">Documents</label>
                  </div>
                </div>

                {/* Remove Button (only if more than one row and not the first row) */}
                {index > 0 && (
                  <button
                    type="button"
                    className="text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 mt-2"
                    onClick={() => removeBankDetail(index)}
                  >
                    <svg
                      fill="white"
                      width={28}
                      height={28}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                    >
                      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {formConfig?.groups?.map((section, index) => (
            <div key={index} className="AJ-Form-block AJ-crm-personal">
              <div className="p-10">
                <h3 className="text-xl font-bold">{section.label}</h3>
              </div>
              <div className="border-t border-gray-300 w-full my-2"></div>

              <div
                className={`grid ${
                  section.groupLabel === "VERIFICATION & DOCUMENTS"
                    ? "grid-cols-1 space-y-4"
                    : "grid-cols-2 gap-y-1 gap-x-4"
                }`}
              >
                {section.fields.map((field) => {
                  if (field.type === "select" || field.type === "dropdown") {
                    return (
                      <div
                        key={field.name}
                        className="AJ-floating-label-wrapper"
                      >
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`${getFieldClassName(
                            field.name
                          )} AJ-floating-select AJ-floating-input`}
                        >
                          <option value="" disabled>
                            Select an option
                          </option>
                          {field.options.map((opt) => {
                            const [value, label] =
                              typeof opt === "string" && opt.includes("|")
                                ? opt.split("|").map((part) => part.trim())
                                : [opt, opt];

                            return (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                        <label className="AJ-floating-label">
                          {field.label}
                        </label>
                      </div>
                    );
                  }

                  if (field.type === "multiselect") {
                    return (
                      <div
                        key={field.name}
                        className="AJ-floating-label-wrapper"
                      >
                        <select
                          className="AJ-floating-select AJ-floating-input"
                          name={field.name}
                          multiple
                          value={formData[field.name]}
                          onChange={handleChange}
                        >
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <label className="AJ-floating-label">
                          {field.label}
                        </label>
                      </div>
                    );
                  }

                  if (field.type === "textarea") {
                    return (
                      <div
                        key={field.name}
                        className="AJ-floating-label-wrapper"
                      >
                        <textarea
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`${getFieldClassName(
                            field.name
                          )} AJ-floating-textarea AJ-floating-input`}
                        ></textarea>
                        <label className="AJ-floating-label">
                          {field.label}
                        </label>
                      </div>
                    );
                  }

                  if (field.type === "file") {
                    return (
                      <div
                        key={field.name}
                        className="file-upload flex justify-around"
                      >
                        <input
                          type="file"
                          name={field.name}
                          id={field.name}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden AJ-floating-input"
                          onChange={handleFileUpload}
                        />
                        <div className={`AJ-crm-${field.name}-label`}>
                          <label className="text-sm">{field.label} :</label>
                        </div>
                        <div className="AJ-crm-upload-point">
                          <label
                            htmlFor={field.name}
                            className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                          >
                            {selectedFiles[field.name]
                              ? `${field.label}: ${
                                  selectedFiles[field.name].name
                                }`
                              : " + Upload file "}
                          </label>
                        </div>
                      </div>
                    );
                  }

                  // Default input (text, date, number)
                  return (
                    <div key={field.name} className="AJ-floating-label-wrapper">
                      <input
                        type={field.type}
                        name={field.key}
                        value={formData[field.key]}
                        autoComplete="off"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`${getFieldClassName(
                          field.key
                        )} AJ-floating-input`}
                        placeholder=" "
                      />
                      <label className="AJ-floating-label">{field.label}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default TeacherForm;
