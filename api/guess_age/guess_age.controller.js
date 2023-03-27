import { Guess_Age } from "./guess_age.modal.js";
import validator from "validator";
import { check } from "express-validator";
import { Users } from "./users.modal.js";
import { Reminder } from "./reminder.modal.js";
import excelJS from "exceljs";
import cron from "node-cron";
import bcrypt from "bcrypt";
import { sendEmail } from "./sendEmail.js";
import shortUrl from "node-url-shortener";
import fetch from "node-fetch";
import { exchangeRates, convert } from "exchange-rates-api";
import ping from "ping";

// Save Guess Age data
export const guessAgeSave = async (req, res) => {
  try {
    console.log("req.query", req.query, req.body);
    const {
      email,
      age,
      month,
      day,
      date,
      user_name,
      s_date,
      title_name,
      user_id,
    } = req.body;

    const check_title = await Guess_Age.find({
      user_id: user_id,
      title_name: title_name,
    });
    const check_user = await Guess_Age.find({ user_id: user_id });
    if (check_title.length > 0) {
      console.log("checktitle", check_title);
      return res.send({
        status: 405,
        success: false,
        message: "The title name already exists",
      });
    }
    const check = await validation(req.body);
    console.log("check", check);
    if (check === true) {
      let max =
        check_user.length > 0 ? check_user[check_user.length - 1].max + 1 : 1;
      let guess = await Guess_Age.create({
        email,
        age,
        month,
        day,
        date,
        user_name,
        s_date,
        title_name,
        max,
        user_id,
      });
      return res.send({
        status: 201,
        success: true,
        message:
          req.query.lang === "sp"
            ? "Los datos de Guess Age se agregaron con éxito"
            : req.query.lang === "ch"
            ? "猜猜年龄数据添加成功"
            : "Guess Age data added successfully",
        data: guess,
      });
    } else {
      res.send({
        status: 404,
        success: false,
        message: check,
      });
    }
  } catch (error) {
    res.send({
      status: 404,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const insertUsers = async (req, res) => {
  const { email, name, id, user_id } = req.query;
  try {
    const created_at = new Date();
    await Users.create({
      email,
      name,
      id,
      created_at,
      user_id,
    });
    exportExcel();
    return res.send({
      status: 201,
      success: true,
      message:
        req.query.lang === "ch"
          ? "保存在数据库中的用户信息"
          : req.query.lang === "sp"
          ? "Información de los usuarios guardada en la base de datos"
          : "Users Information Saved on database",
      data: req.query,
    });
  } catch (error) {
    res.send({
      status: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const register = async (req, res) => {
  try {
    console.log("register social", req.query, req.body);

    if (req.body?.type) {
      var { type, social_media_id, email, first_name, last_name } = req.body;
      // Validation
      var check = await ErrorHandling(req.body);
    }

    if (req.query?.type) {
      var { type, social_media_id, email, first_name, last_name } = req.query;
      // Validation
      var check = await ErrorHandling(req.query);
    }

    if (check) {
      res.send({
        status: 401,
        success: false,
        message: check,
      });
      return;
    }
    // Check user is available or not
    const check_user = await Users.findOne({
      social_media_id: social_media_id,
    });

    if (check_user === null) {
      const user = await Users.create({
        type,
        social_media_id,
        email,
        first_name,
        last_name,
      });
      exportExcel();
      res.send({
        status: 201,
        success: true,
        message: "New Users Added",
        data: {
          user_id: user._id,
          email: user.email,
          social_media_id: user.social_media_id,
          first_name,
          last_name,
          type,
        },
      });
      return;
    }
    exportExcel();
    res.send({
      status: 201,
      success: true,
      message:
        req.query.lang === "sp"
          ? "Datos de los usuarios recuperados"
          : req.query.lang === "ch"
          ? "获取的用户数据"
          : "Users data fetched",
      data: {
        user_id: check_user._id,
        email: check_user.email,
        social_media_id: check_user.social_media_id,
        first_name: check_user.first_name,
        last_name: check_user.last_name,
        type: check_user.type,
      },
    });
  } catch (error) {
    res.send({
      status: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const registerEmail = async (req, res) => {
  try {
    const { email, firstname, lastname, password, confirm_password } = req.body;
    console.log("registerEmail", req.body);
    const check = validationEmail(
      email,
      password,
      confirm_password,
      firstname,
      lastname
    );
    if (check.success) {
      const existUser = await Users.findOne({ email: email }).lean().exec();
      if (existUser) {
        res.send({
          status: 401,
          success: false,
          user_type: existUser.type,
          message:
            req.query.lang === "sp"
              ? "El usuario ya existe"
              : req.query.lang === "ch"
              ? "用户已存在"
              : "User already exists",
        });
      } else {
        const verification_no = Math.floor(
          100000000 + Math.random() * 900000000
        );
        let newUser = new Users();
        newUser.email = email;
        newUser.password = bcrypt.hashSync(password, 10);
        newUser.type = "email";
        newUser.verification_no = verification_no;
        newUser.is_verify = false;
        newUser.first_name = firstname;
        newUser.last_name = lastname;

        if (password === confirm_password) {
          const storedUser = await newUser.save();
          if (storedUser) {
            sendEmail(
              email,
              verification_no,
              storedUser._id,
              firstname,
              lastname
            )
              .then(async () => {
                await Users.findByIdAndUpdate(
                  { _id: storedUser._id },
                  { social_media_id: storedUser._id }
                );
                res.status(200).send({
                  success: true,
                  data: storedUser,
                });
              })
              .catch((err) => {
                res.send({
                  code: 404,
                  success: false,
                  error: err,
                });
              });
          } else {
            res.send({ code: 404, msg: "something wrong" });
          }
        } else {
          res.send({
            code: 404,
            success: false,
            msg: "Password is not matching",
          });
        }
      }
    } else {
      res.send({ code: 404, success: false, msg: check.msg });
    }
  } catch (err) {
    res.send({
      status: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + err,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("login", req.body);

    if (validator.isEmpty(email)) {
      res.send({
        status: 400,
        success: false,
        message: "Email is empty",
      });
      return;
    }

    if (validator.isEmpty(password)) {
      res.send({
        status: 400,
        success: false,
        message: "Password is empty",
      });
      return;
    }

    const existUser = await Users.findOne({ email: email, type: "email" })
      .lean()
      .exec();
    if (!existUser) {
      res.send({
        status: 400,
        success: false,
        message: "User does not exist",
      });
      return;
    }
    const pass = bcrypt.compareSync(password, existUser?.password);
    if (pass) {
      if (existUser.is_verify) {
        res.send({
          status: 200,
          success: true,
          message: "Successfully Login",
          data: existUser,
        });
        return;
      } else {
        res.send({
          code: 400,
          success: false,
          message: "Your account is not verify. Please verify it.",
        });
        return;
      }
    }
    res.send({
      code: 400,
      success: false,
      message: "Password is wrong",
    });
  } catch (err) {
    res.send({
      status: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + err,
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { code, user } = req.query;

    if (validator.isEmpty(code)) {
      return res.send({
        status: 400,
        success: false,
        message: "Oops verification code is missing",
      });
    }

    if (validator.isEmpty(user)) {
      return res.send({
        status: 400,
        success: false,
        message: "Oops user id is missing",
      });
    }

    const existUser = await Users.findById({ _id: user }).exec();

    if (!existUser) {
      return res.send({
        status: 400,
        success: false,
        message: "Oops User not exist",
      });
    }

    if (existUser.verification_no !== Number(code)) {
      return res.send({
        status: 400,
        success: false,
        message: "Verification code is not valid",
      });
    }

    const update = await Users.findByIdAndUpdate(
      { _id: user },
      { is_verify: true }
    ).exec();
    if (update) {
      return res.render("verify");
    } else {
      return res.send({
        status: 400,
        success: false,
        message: "Oops some error occured",
      });
    }
  } catch (err) {
    res.send({
      code: 400,
      success: false,
      msg: "oops some error occur",
      error: err,
    });
  }
};

export const fetchHistory = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const check_user_id = validator.isEmpty(user_id);
    const history = await Guess_Age.find({ user_id: user_id });
    if (!check_user_id) {
      if (history.length == 0) {
        res.send({
          code: 404,
          success: false,
          message:
            req.query.lang === "ch"
              ? "此用户 ID 没有可用数据"
              : req.query.lang === "sp"
              ? "No hay datos disponibles para este ID de usuario"
              : "No data is available for this user id",
        });
      } else {
        res.send({
          code: 201,
          success: true,
          message:
            req.query.lang === "sp"
              ? "Obtención de datos con éxito"
              : req.query.lang === "ch"
              ? "数据获取成功"
              : "Data fetch successfully",
          data: history,
        });
      }
    } else {
      res.send({
        code: 404,
        success: false,
        message:
          req.query.lang === "ch"
            ? "请提供用户名"
            : req.query.lang === "sp"
            ? "Por favor proporcione identificación de usuario"
            : "Please provide user id",
      });
    }
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const deleteSingleEntry = async (req, res) => {
  try {
    console.log("req.query", req.query);
    const id = req.query.id;
    const check_id = validator.contains(id);
    const history = await Guess_Age.deleteOne({ _id: id });
    if (check_id) {
      if (history.length == 0) {
        res.send({
          code: 404,
          success: false,
          message:
            req.query.lang === "sp"
              ? "no lo encontre"
              : req.query.lang === "ch"
              ? "没有找到"
              : "Id not found",
        });
      } else {
        res.send({
          code: 201,
          success: true,
          message:
            req.query.lang === "ch"
              ? "数据删除成功"
              : req.query.lang === "sp"
              ? "Datos eliminados con éxito"
              : "Data deleted successfully",
        });
      }
    } else {
      res.send({
        code: 404,
        success: false,
        message:
          req.query.lang === "sp"
            ? "Proporcione una identificación única o la identificación no es válida"
            : req.query.lang === "ch"
            ? "请提供唯一 ID 或 ID 无效"
            : "Please provide unique id or id is invalid",
      });
    }
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const deleteSingleUser = async (req, res) => {
  try {
    const id = req.query.id;
    const history = await Users.deleteOne({ _id: id });
    if (history) {
      res.send({
        code: 200,
        success: true,
        message: "Users data is deleted successfully",
      });
    }
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    console.log("delete user", req.query, req.parms);
    if (id === undefined || id === "" || validator.isEmpty(id)) {
      res.send({
        code: 201,
        success: false,
        message: "Id is required",
      });
      return;
    }
    const getUser = await Users.findOne({ social_media_id: id }).lean().exec();
    const history = await Users.deleteOne({ social_media_id: id });
    console.log(getUser, "||", history);
    if (history && getUser) {
      const data = await Guess_Age.deleteMany({ email: getUser?.email });

      res.send({
        code: 200,
        success: true,
        message: "Users data is deleted successfully",
      });
      return;
    }
    const reminder = await Reminder.deleteMany({ user_id: id });
    const user = await Guess_Age.deleteMany({ user_id: id });
    res.send({
      code: 200,
      success: true,
      message: "Users data is deleted successfully",
    });
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const deleteAllEntry = async (req, res) => {
  try {
    console.log("req.query", req.query);
    const user_id = req.query.user_id;
    const check_user_id = validator.isEmpty(user_id);
    const history = await Guess_Age.deleteMany({ user_id: user_id });
    const reminder = await Reminder.deleteMany({ user_id: user_id });
    if (!check_user_id) {
      if (history.length == 0) {
        res.send({
          code: 404,
          success: false,
          message:
            req.query.lang === "ch"
              ? "未找到用户 ID 或没有关于此用户 ID 的数据"
              : req.query.lang === "sp"
              ? "ID de usuario no encontrado o no hay datos sobre este ID de usuario."
              : "User ID not found or there is no data regarding this user id.",
        });
      } else {
        res.send({
          code: 201,
          success: true,
          message:
            req.query.lang === "sp"
              ? "Datos eliminados con éxito"
              : req.query.lang === "ch"
              ? "数据删除成功"
              : "Data deleted successfully",
        });
      }
    } else {
      res.send({
        code: 404,
        success: false,
        message:
          req.query.lang === "ch"
            ? "请提供用户 ID 或用户 ID 无效"
            : "Please provide user id or user id is invalid",
      });
    }
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const shareUrl = async (req, res) => {
  try {
    if (req.body) {
      var { url } = req.body;
    }
    if (req.query) {
      var { url } = req.query;
    }
    console.log("url", url);
    await shortUrl.short(url, (err, urls) => {
      console.log("data", err, urls);
      res.send({ success: true, message: "success", urls });
    });
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const saveReminder = async (req, res) => {
  try {
    const today_year = new Date().getFullYear();
    const today_month = new Date().getMonth() + 1;
    const today_date = new Date().getDate();
    const { user_id, name, date, month } = req.query;
    let year = today_year;
    if (month < today_month) {
      year = today_year + 1;
    } else if (month == today_month && date < today_date) {
      year = today_year + 1;
    }

    const fullDate = `${month}/${date}/${year}`;

    const reminder = await Reminder.create({
      user_id,
      name,
      fullDate,
      date,
      month,
      year,
    });
    if (reminder) {
      res.send({
        code: 200,
        success: true,
        message: "Remainder Added Successfully",
      });
    }
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const fetchReminder = async (req, res) => {
  try {
    const { user_id } = req.query;
    const reminder = await Reminder.find({ user_id: user_id }).lean().exec();

    res.send({
      code: 200,
      success: true,
      message:
        reminder.length > 0
          ? "Remainder Fetch Successfully"
          : "There is no data",
      data: reminder,
    });
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};
export const DeleteReminder = async (req, res) => {
  try {
    const { id } = req.query;
    const reminder = await Reminder.deleteOne({ _id: id }).lean().exec();

    if (reminder) {
      res.send({
        code: 200,
        success: true,
        message: "Remainder Deleted Successfully",
      });
    }
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

export const deleteAllReminder = async (req, res) => {
  try {
    const deleteReminder = await Reminder.deleteMany({
      user_id: req.query.id,
    }).exec();

    if (deleteReminder) {
      res.send({
        code: 200,
        success: true,
        message: "All Remainder Deleted Successfully",
      });
    }
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

// export const exportExcel = async (req, res) => {
//     try {
//         const workbook = new excelJS.Workbook();  // Create a new workbook
//         const worksheet = workbook.addWorksheet("My Users"); // New Worksheet
//         const path = "./files";  // Path to download excel
//         // Column for data in excel. key must match data key
//         worksheet.columns = [
//           { header: "S no.", key: "s_no", width: 10 },
//           { header: "Email", key: "email", width: 30 },
//           { header: "First Name", key: "first_name", width: 20 },
//           { header: "Last Name", key: "last_name", width: 20 },
//           { header: "Social Media Id", key: "social_media_id", width: 20 },
//           { header: "Social Type", key: "type", width: 20 },
//           { header: "Login", key: "updatedAt", width: 20 },
//           ];
//           // Looping through User data
//           let counter = 1;

//           const users = await Users.find({})
//           users.forEach((user) => {
//               user.s_no = counter;
//               worksheet.addRow(user); // Add data in worksheet
//               counter++;
//           });

//           await workbook.xlsx.writeFile(`${path}/users.xlsx`).then((res) => {
//               console.log("res", res)
//               // https://birthday-calculator-api.herokuapp.com/files/users.xlsx
//           }).catch((err) => {
//               console.log("err", err)
//           })

//     } catch (error) {
//         res.send({
//             code: 401,
//             success: false,
//             message: 'Oops error throw' + error
//         })
//     }
// }

export const getSubscriptionData = async (req, res) => {
  try {
    let ip = req.ip;
    if (ip.includes("f")) {
      ip = ip.split(":").pop();
    }
    // ip = "116.72.0.101";

    var fetch_res = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=d224dbd5da574a679909d0e676fe9461&ip=${ip}`
    );
    var fetch_data = await fetch_res.json();
    console.log(
      await exchangeRates()
        .setApiBaseUrl("https://api.exchangerate.host")
        .latest()
        .base("USD")
        .symbols("INR")
        .fetch()
    );

    let fetchMonthly = await fetch(
      `https://api.exchangerate.host/${new Date()}?base=USD&symbols=${
        fetch_data?.currency?.code
      }&amount=0.99`
    );
    let amountMonthly = await fetchMonthly.json();
    let fetchYearly = await fetch(
      `https://api.exchangerate.host/${new Date()}?base=USD&symbols=${
        fetch_data?.currency?.code
      }&amount=9.99`
    );
    let amountYearly = await fetchYearly.json();
    res.json({
      success: true,
      location: fetch_data?.country_name,
      amountMonthly: amountMonthly.rates[fetch_data?.currency?.code].toFixed(2),
      amountYearly: amountYearly.rates[fetch_data?.currency?.code].toFixed(2),
      code: fetch_data?.currency?.code,
    });
  } catch (error) {
    res.send({
      code: 401,
      success: false,
      message:
        req.query.lang === "sp"
          ? "Oops tiro de error"
          : req.query.lang === "ch"
          ? "哎呀错误抛出"
          : "Oops error throw" + error,
    });
  }
};

function validation(data) {
  if (data.email !== "" && validator.isEmpty(data.email)) {
    return errorThrow("Email");
  } else if (validator.isEmpty(data.user_id)) {
    return errorThrow("User ID");
  } else if (validator.isEmpty(data.age)) {
    return errorThrow("age");
  } else if (validator.isEmpty(data.month)) {
    return errorThrow("month");
  } else if (validator.isEmpty(data.date)) {
    return errorThrow("date");
  } else if (validator.isEmpty(data.day)) {
    return errorThrow("day");
  } else if (validator.isEmpty(data.title_name)) {
    return errorThrow("title_name");
  } else {
    return true;
  }
}

function validationEmail(
  email,
  password,
  confirm_password,
  firstname,
  lastname
) {
  if (validator.isEmpty(email)) {
    return errorThrowv2("Email");
  } else if (validator.isEmpty(password)) {
    return errorThrowv2("Password");
  } else if (validator.isEmpty(confirm_password)) {
    return errorThrowv2("Confirm Password");
  } else if (validator.isEmpty(firstname)) {
    return errorThrowv2("First name");
  } else if (validator.isEmpty(lastname)) {
    return errorThrowv2("Last name");
  } else {
    return { success: true };
  }
}

async function ErrorHandling(data) {
  if (validator.isEmpty(data.type)) {
    return errorThrow("Social Media Id");
  } else {
    return false;
  }
}

async function exportExcel() {
  const workbook = new excelJS.Workbook(); // Create a new workbook
  const worksheet = workbook.addWorksheet("My Users"); // New Worksheet
  const path = "./files"; // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    { header: "S no.", key: "s_no", width: 10 },
    { header: "Email", key: "email", width: 30 },
    { header: "First Name", key: "first_name", width: 20 },
    { header: "Last Name", key: "last_name", width: 20 },
    { header: "Social Media Id", key: "social_media_id", width: 20 },
    { header: "Social Type", key: "type", width: 20 },
    { header: "Login", key: "updatedAt", width: 20 },
  ];
  // Looping through User data
  let counter = 1;

  const users = await Users.find({});
  users.forEach((user) => {
    user.s_no = counter;
    worksheet.addRow(user); // Add data in worksheet
    counter++;
  });

  await workbook.xlsx
    .writeFile(`${path}/users.xlsx`)
    .then((res) => {
      console.log("res", res);
      // https://birthday-calculator-api.herokuapp.com/files/users.xlsx
    })
    .catch((err) => {
      console.log("err", err);
    });
}

function errorThrow(data) {
  return "Oops error throw " + data + " is required";
}

function errorThrowv2(data) {
  return {
    success: false,
    msg: data + " is empty",
  };
}

cron.schedule("*/5 * * * *", async () => {
  console.log("running a task every two minutes");
  var host2 = [
    "100.20.92.101",
    "44.225.181.72",
    "44.227.217.144",
    "216.24.57.3",
  ];

  var frequency = 1000; //1 second

  host2.forEach(function (host) {
    // setInterval(function () {
    ping.sys.probe(host, function (active) {
      var info = active
        ? "IP " + host + " = Active"
        : "IP " + host + " = Non-Active";
      console.log(info);
    });
    // }, frequency);
  });
  var fetch_res = await fetch(
    `https://birthday-calculator-backend.onrender.com`
  );
  var fetch_data = await fetch_res.json();
  console.log("fetch_data", fetch_data);
  exportExcel();
});
