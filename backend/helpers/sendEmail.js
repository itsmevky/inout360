const nodemailer = require("nodemailer");
const EmailTemplate = require("../models/Template.js");

//=====Configure the email transport (Gmail is used in this example)====//
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ===========Function to send email using a template======//
async function sendEmail(templateName, to, dynamicData) {
  try {
    //==========Fetch email template from the database=======//
    const template =
      (await EmailTemplate.findOne({ name: templateName })) ||
      // fallback default template if DB is empty
      {
        subject: "Notification",
        body: "<p>{{message}}</p>",
      };

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
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    // console.log(mailOptions)
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail };
