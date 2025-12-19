const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const path = require("path");
const EmailTemplate = require("../models/Template.js");

//=====Configure the email transport (Gmail is used in this example)====//
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const buildOtpHtml = (otp) =>
  String(otp || "")
    .split("")
    .map((digit) => `<span class="otp-digit">${digit}</span>`)
    .join("");

const loadTemplateFromFile = async (templateName) => {
  const templatePath = path.join(__dirname, "..", "emailTemplate", templateName);
  return fs.readFile(templatePath, "utf8");
};

const getTemplateAttachments = (templateName) => {
  if (templateName === "pidilitetemplate.html") {
    return [
      {
        filename: "pidilitelogo.avif",
        path: path.join(__dirname, "..", "emailTemplate", "pidilitelogo.avif"),
        cid: "pidilite-logo",
      },
    ];
  }
  return [];
};

// ===========Function to send email using a template======//
async function sendEmail(templateName, to, dynamicData = {}) {
  try {
    let template = null;
    let attachments = [];
    if (templateName && templateName.endsWith(".html")) {
      const body = await loadTemplateFromFile(templateName);
      attachments = getTemplateAttachments(templateName);
      template = {
        subject: dynamicData.subject || "Notification",
        body,
      };
    } else {
      //==========Fetch email template from the database=======//
      template =
        (await EmailTemplate.findOne({ name: templateName })) ||
        // fallback default template if DB is empty
        {
          subject: "Notification",
          body: "<p>{{message}}</p>",
        };
    }

    if (dynamicData.OTP && !dynamicData.OTP_HTML) {
      dynamicData.OTP_HTML = buildOtpHtml(dynamicData.OTP);
    }

    //==========Perform dynamic data replacement (e.g., replace
    // {{first_name}} with the actual name)
    let emailContent = template.body;
    for (const key in dynamicData) {
      const regex = new RegExp(`{{${key}}}`, "g");
      emailContent = emailContent.replace(regex, dynamicData[key]);
    }

    //================Send email=================//
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: template.subject,
      html: emailContent,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    // console.log(mailOptions)
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail };
