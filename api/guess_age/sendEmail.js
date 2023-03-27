import nodemailer from "nodemailer";

export const sendEmail = async (email, code, id, firstname, lastname) => {
  const smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "ducker.detective@gmail.com",
      pass: "zczvvzfjcvboigdc",
      // pass: "dxykreozrdmrqijr",
    },
  });

  const data = {
    to: email,
    from: "Ducker Detective <ducker.detective@gmail.com>",
    subject: "Verification code",
    html:
      "<h2> Hello " +
      firstname +
      " " +
      lastname +
      ' </h2> <br/><p>Click <a href="https://birthday-calculator-backend.onrender.com/api/guessAge/verify?code=' +
      code +
      "&user=" +
      id +
      '">here</a> to verify your account</p>',
  };
  smtpTransport.sendMail(data);
};
