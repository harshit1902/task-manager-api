const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SG_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "dev.harshit19@gmail.com",
    subject: "Welcome To Task Manager App!!",
    text: `Welcome, ${name}, Let us know how you get along with the App.`,
    // html:""
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "dev.harshit19@gmail.com",
    subject: "Goodbye!!",
    text: `Its bad to see you leaving, ${name}, Let us know what we can do to keep you onboard.`,
    // html:""
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
