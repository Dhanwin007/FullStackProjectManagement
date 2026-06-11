import Mailgen from 'mailgen';
import { Resend } from 'resend';

import nodemailer from 'nodemailer';
// for sendng the email u need to provide all these data
// const sendEmail = async (options) => {
//   const mailGenerator = new Mailgen({
//     theme: 'default',
//     product: {
//       name: 'Task Manager',
//       link: 'https://taskmanagerlink.com',
//     },
//   });
//   const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
//   const emailHtml = mailGenerator.generate(options.mailgenContent);
//   const transporter = nodemailer.createTransport({
//     //important
//     host: process.env.MAILTRAP_SMTP_HOST,
//     port: process.env.MAILTRAP_SMTP_PORT,
//     auth: {
//       user: process.env.MAILTRAP_SMTP_USER,
//       pass: process.env.MAILTRAP_SMTP_PASS,
//     },
//   });

//   const mail = {
//     from: 'mail.taskmanager@example.com',
//     to: options.email,
//     subject: options.subject,
//     text: emailTextual,
//     html: emailHtml,
//   };
//   try {
//     await transporter.sendMail(mail);
//   } catch (error) {
//     console.error(
//       'error occured while sending the mail,MAke sure that mailtrap credentials are provided oroperly in the .env file',
//     );
//   }
// };

// const sendEmail = async (options) => {
//   const mailGenerator = new Mailgen({
//     theme: 'default',
//     product: {
//       name: 'Task Manager',
//       link: 'https://taskmanagerlink.com',
//     },
//   });
  
//   const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
//   const emailHtml = mailGenerator.generate(options.mailgenContent);

//   // const transporter = nodemailer.createTransport({
//   //   // Changed to Gmail settings
//   //   service: 'gmail',
//   //   auth: {
//   //     user: process.env.SMTP_USER, // Your Gmail address
//   //     pass: process.env.SMTP_PASS, // Your 16-character App Password
//   //   },
//   // });
// console.log("SMTP_USER:", process.env.SMTP_USER);
// console.log("SMTP_PASS EXISTS:", !!process.env.SMTP_PASS);
//  const transporter = nodemailer.createTransport({
//     host: "smtp-relay.brevo.com", 
//     port: 465,                    // Changed from 587 to 465
//     secure: true,                 // CRUCIAL: Must be set to true for port 465
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//     connectionTimeout: 15000,     // Gives the cloud network 15 seconds to connect
//     socketTimeout: 15000,
//   });

//   const mail = {
//     // Best practice: use your actual email in the 'from' field to avoid spam filters
//     from: `"Task Manager" <${process.env.SMTP_USER}>`,
//     to: options.email,
//     subject: options.subject,
//     text: emailTextual,
//     html: emailHtml,
//   };

//   try {
//     await transporter.sendMail(mail);
//   } catch (error) {
//     console.error(
//       'Error occurred while sending the mail. Make sure Gmail App Password is correct in .env',
//       error // Logging the actual error helps debugging
//     );
//   }
// };
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Task Manager',
      link: 'https://taskmanagerlink.com',
    },
  });
  
  // Note: Resend takes HTML content directly, plaintext generation isn't strictly necessary here
  const emailHtml = mailGenerator.generate(options.mailgenContent);
  console.log("MAIL CONTENT:");
console.log(JSON.stringify(options.mailgenContent, null, 2));

console.log("EMAIL HTML START");
console.log(emailHtml);
console.log("EMAIL HTML END");

  console.log("Attempting to send email via Resend API...");
  console.log("RESEND_API_KEY EXISTS:", !!process.env.RESEND_API_KEY);

  try {
    // This sends over a standard HTTPS web request (Port 443) which Render CANNOT block
    await resend.emails.send({
      from: 'Task Manager <onboarding@resend.dev>', // Keep this exact default testing sender address
      to: options.email,                             // Must be your own registered Resend account email for testing
      subject: options.subject,
      html: emailHtml,
    });

    console.log("Email sent successfully via Resend API!");
  } catch (error) {
    console.error('Error occurred while sending mail via Resend:', error);
  }
};

const emailVerificationMailgenContent = function (username, verificationUrl) {
  let email = {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      action: {
        instructions: 'To verify your email, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Confirm your account',
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  return email;
};
// const resetUrl =
//   `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`;

// console.log("RESET URL:", resetUrl);
const forgotPasswordMailgenContent = function (username, passwordResetUrl) {
  let email = {
    body: {
      name: username,
      intro: 'We got a request to reset your password',
      action: {
        instructions: 'To reset your password, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Reset Password',
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
  return email;
};
export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
