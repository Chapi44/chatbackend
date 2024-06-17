const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

const register = async (req, res) => {
  try {
    let { name, email, password, username, bio, pictures, profession } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Email already exists" });
    }

    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? "admin" : "user";

    // Check if username and bio are provided, otherwise assign default values
    if (!username) username = null; // Set username to null if empty
    if (!bio) bio = "";
    if (!profession) profession = ""; // Set profession to empty string if not provided

    // Create the user directly without checking username
    const user = await User.create({
      name,
      email,
      password,
      role,
      username,
      bio,
      pictures,
      profession // Include profession field
    });

    const secretKey = process.env.JWT_SECRET;
    const tokenExpiration = process.env.JWT_LIFETIME;

    if (!secretKey) {
      throw new CustomError.InternalServerError("JWT secret key is not configured.");
    }

    if (!tokenExpiration) {
      throw new CustomError.InternalServerError("Token expiration is not configured.");
    }

    // Generate JWT token with specific user fields
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        bio: user.bio,
        pictures: user.pictures,
        profession: user.profession // Include profession field in the token payload
      },
      secretKey,
      { expiresIn: tokenExpiration }
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Successfully registered",
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
};



const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: "Password is incorrect" });
  }

  // Use the secret key and token expiration from environment variables
  const secretKey = process.env.JWT_SECRET;
  const tokenExpiration = process.env.JWT_LIFETIME;

  if (!secretKey || !tokenExpiration) {
    return res.status(500).json({ message: "JWT secret key or token expiration not configured" });
  }

  // Generate a JSON Web Token (JWT) with specific user fields
  const token = jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      bio: user.bio,
      pictures: user.pictures,
      profession: user.profession // Include profession field in the token payload
    },
    secretKey,
    { expiresIn: tokenExpiration }
  );

  res.status(StatusCodes.OK).json({
    token
  });
};

// Logout endpoint
const logout = async (req, res) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }

    // Extract the token value from the 'Bearer ' string
    const authToken = token.split(' ')[1];

    // Add any necessary validation here (e.g., token format, signature verification)

    // Respond with a success message
    return res.status(StatusCodes.OK).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};


// const forgotPassword = async (req, res) => {
//   try {
//     var email = req.body.email;
//     console.log(req.body);
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("User Not found");
//       return res.status(404).json({ error: "User Not found" });
//     }

//     console.log("forget password");
//     var nodemailer = require("nodemailer");
//     var transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "enterct35i@gmail.com",
//         pass: "eivj sueg qdqg zmsl",
//       },
//     });
//     const forgotPasswordToken = jwt.sign(
//       { userEmail: email },
//       "Wintu-Yoni@2022",
//       {
//         expiresIn: "4h",
//       }
//     );

//     // var forgotPasswordLink =
//     //   "http://localhost:3000/login/?token=" + forgotPasswordToken;
//     console.log("hello", email);
//     if (email) {
//       console.log(email);

//       var forgotPasswordLink = `http://localhost:3000/reset-password/?token=${forgotPasswordToken}`;
//       var mailOptions = {
//         from: "socialmedia@gmail.com",
//         to: email,
//         subject: "Reset Password",
//         html:
//           '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
//           '<html xmlns="http://www.w3.org/1999/xhtml"><head>' +
//           '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
//           "<title>Forgot Password</title>" +
//           "<style> body {background-color: #FFFFFF; padding: 0; margin: 0;}</style></head>" +
//           '<body style="background-color: #FFFFFF; padding: 0; margin: 0;">' +
//           '<table style="max-width: 650px; background-color: #2F6296; color: #ffffff;" id="bodyTable">' +
//           '<tr><td align="center" valign="top">' +
//           '<table id="emailContainer" style="font-family: Arial; color: #FFFFFF; text-align: center;">' +
//           '<tr><td align="left" valign="top" colspan="2" style="border-bottom: 1px solid #CCCCCC; padding-  bottom: 10px;">' +
//           "</td></tr><tr>" +
//           '<td align="left" valign="top" colspan="2" style="border-bottom: 1px solid #FFFFFF; padding: 20px 0 10px 0;">' +
//           '<span style="font-size: 24px; font-weight: normal;color: #FFFFFF">FORGOT PASSWORD</span></td></tr><tr>' +
//           '<td align="left" valign="top" colspan="2" style="padding-top: 10px;">' +
//           '<span style="font-size: 18px; line-height: 1.5; color: #333333;">' +
//           " We have sent you this email in response to your request to reset your password on <a href='http://localhost:3000'>NeuroGen AI System</a><br/><br/>" +
//           'To reset your password for, please follow the link below: <button style="font:inherit; cursor: pointer; border: #272727 2px solid; background-color: transparent; border-radius: 5px;"><a href="' +
//           forgotPasswordLink +
//           '"style="color: #272727; text-decoration: none;">Reset Password</a></button><br/><br/>' +
//           "We recommend that you keep your password secure and not share it with anyone.If you didn't request to this message, simply ignore this message.<br/><br/>" +
//           "Saarada Management System </span> </td> </tr> </table> </td> </tr> </table> </body></html>",
//       };

//       transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//           console.log(error);
//           return res.json({
//             ErrorMessage: error,
//           });
//         } else {
//           console.log("succcesssss");
//           return res.json({
//             SuccessMessage: "email successfully sent!",
//           });
//         }
//       });
//     } else {
//       return res.json({
//         ErrorMessage: "Email can't be none!",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// const ResetPassword = async (req, res) => {
//   console.log(req.body);
//   try {
//     const { newPassword, email } = req.body;
//     console.log(newPassword, email);
//     const encreptedPassword = await bcrypt.hash(newPassword, 10);
//     console.log(encreptedPassword);
//     const existingUser = await User.findOne({ email });
//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Use the updateOne method with async/await
//     const result = await User.updateOne(
//       { email: email },
//       { $set: { password: encreptedPassword } }
//     );
//     console.log(result);

//     // Check the result and handle it accordingly
//     if (result.modifiedCount === 1) {
//       return res.json({ message: "Password reset successful" });
//     } else {
//       return res
//         .status(404)
//         .json({ message: "User not found or password not modified" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };



const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "enterct35i@gmail.com",
        pass: "eivj sueg qdqg zmsl",
      },
    });

    const mailOptions = {
      from: "socialmedia@gmail.com",
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP to reset password is: ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to send OTP" });
      } else {
        console.log("OTP sent successfully");
        return res.status(200).json({ message: "OTP sent successfully", otp });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const ResetPassword = async (req, res) => {
  try {
    const { newPassword, email } = req.body;
    const encreptedPassword = await bcrypt.hash(newPassword, 10);
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Use the updateOne method with async/await
    const result = await User.updateOne(
      { email: email },
      { $set: { password: encreptedPassword } }
    );

    // Check the result and handle it accordingly
    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: "Password reset successful" });
    } else {
      return res.status(404).json({ message: "User not found or password not modified" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  register,
  signin,
  logout,
  forgotPassword,
  ResetPassword,
};