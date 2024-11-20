const { body } = require("express-validator");

// const userDataValidateChainableAPI = [
//   body("fname")
//     .exists({ checkFalsy: true })
//     .withMessage("First Name is required")
//     .isString()
//     .withMessage("First Name should be string"),
//   body("lname")
//     .exists({ checkFalsy: true })
//     .withMessage("Lsat Name is required")
//     .isString()
//     .withMessage("Last Name should be string"),
//   body("user_name")
//     .exists({ checkFalsy: true })
//     .withMessage("User name is required")
//     .isString()
//     .withMessage("User name should be string"),
//   body("password")
//     .exists()
//     .withMessage("Password is required")
//     .isString()
//     .withMessage("Password should be string")
//     .isLength({ min: 5 })
//     .withMessage("Password should be at least 5 characters"),
//   body("email").optional().isEmail().withMessage("Provide valid email"),
// //   body("gender")
// //     .optional()
// //     .isString()
// //     .withMessage("Gender should be string")
// //     .isIn(["Male", "Female", "Other"])
// //     .withMessage("Gender value is invalid"),
// //   body("dateOfBirth")
// //     .optional()
// //     .isDate()
// //     .withMessage("DOB should be valid date"),
//   body("phone_number")
//     .optional()
//     .isString()
//     .withMessage("phone number should be string")
//     .custom((value) => {
//       if (value.length !== 10) {
//         return Promise.reject("Phone number should be 10 digits");
//       } else {
//         return true;
//       }
//     }),
// ];

const userDataValidate = (req, res, next) => {
    console.log(req.body);
    if (!req.body.user_name) {
      throw Error("username is required");
    }
    if (!req.body.password) {
      throw Error("password is required");
    }
    if (req.body.password.length < 5) {
      throw Error("password should have atleast 5 characters");
    }
    if (!isValidEmail()) {
      throw Error("provide valid email");
    } 
  };

module.exports = { userDataValidate };