const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/authMiddleware');
const fs = require('fs');
const puppeteer = require('puppeteer');
const axios = require('axios');

const path = require('path');

const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const { error } = require('console');



const generateToken = (user) => {
  const payload = {
    email: user.email,
    password: user.password,
    id: user.id,
  };
  return jwt.sign(payload, 'crud', { expiresIn: '24h' });
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sponda.netclues@gmail.com',
    pass: 'qzfm wlmf ukeq rvvb'
  }
});

function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
const otpganrate = Math.floor(100000 + Math.random() * 900000);
const now = new Date();
const expiration_time = AddMinutesToDate(now, 10);

const genrateOTP = () => {
  const payload = {
    otpganrate,
    now,
    expiration_time,
  };
  return (payload);

}
const otpPassword = Math.floor(1000 + Math.random() * 9000);

function generateOTPS() {
  const payload = {
    otpPassword,
    now,
    expiration_time,
  };
  return (payload);
}

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sponda.netclues@gmail.com',
      pass: 'qzfm wlmf ukeq rvvb'
    }
  });

  const mailOptions = {
    from: 'sponda.netclues@gmail.com',
    to: options.to,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTPS();
    console.log(otp);



    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Your OTP',
      message: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}






const updateUserSubscription = async (req, res) => {
  try {
    const { userId, subscriptionPlan } = req.body;

    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // Set end date to one year from now

    const result = await sequelize.query(
      'UPDATE register SET subscriptionPlan = ?, subscriptionStartDate = ?, subscriptionEndDate = ? WHERE id = ?',
      {
        replacements: [subscriptionPlan, subscriptionStartDate, subscriptionEndDate, userId],
        type: QueryTypes.UPDATE
      }
    );

    if (result[0] === 0) {
      return res.status(400).json({ error: true, message: 'User not found or no changes made' });
    }

    res.status(200).json({ error: false, message: 'Subscription plan updated successfully' });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};




const accountSid = 'ACd9806a2bd9b26c568fef24290dbfdbec';
const authToken = 'c3362abb36dbc9d3ab407886b70c1452';
const client = require('twilio')(accountSid, authToken);

const sendOTP = async (mobileNumber) => {
  // Generate a 6-digit OTP
  const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });

  console.log(otp);
  // Save the OTP to the database
  await sequelize.query(
    'INSERT INTO otp (otp, mobileNumber, createdAt) VALUES (?, ?, ?)',
    {
      replacements: [otp, mobileNumber, new Date()],
      type: QueryTypes.INSERT
    }
  );

  // Send the OTP to the user's mobile number using Twilio's SMS API
  client.messages
    .create({
      body: `Your OTP is ${otp}`,
      from: '+12178639574', // Replace with your Twilio phone number
      to: `+${mobileNumber}`
    })
    .then((message) => console.log(message.sid))
    .catch((error) => console.error(error));
};


const OTPVerifyEmail = async (req, res) => {
  try {
    const { otp } = req.body; // get both otp and email from request body

    const existingUser = await sequelize.query('SELECT * FROM users WHERE email');
    if (existingUser) {
      const user = existingUser;

      if (otp == otpPassword) {
        const currentTime = new Date();
        const otpExpiryTime = new Date(expiration_time);

        if (currentTime < otpExpiryTime) {
          const token = generateToken(user);
          const userId = user.id;
          const userRole = user.userRole;

          return res.status(200).send({ message: 'Login success!', token: token, userId: userId, userRole: userRole });
        } else {
          return res.status(401).send({ message: 'OTP has expired! Please request for a new OTP.' });
        }
      } else {
        return res.status(401).send({ message: 'Invalid OTP! Please enter a valid OTP.' });
      }
    } else {
      return res.status(404).send({ message: 'Email not found! Sign up!' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Error in login check api!',
      error
    });
  }
};

const OTPVerify = async (req, res) => {
  try {
    const { otp } = req.body; // get both otp and email from request body

    const existingUser = await sequelize.query('SELECT * FROM users WHERE email');
    if (existingUser) {
      const user = existingUser;

      if (otp == otpganrate) {
        const currentTime = new Date();
        const otpExpiryTime = new Date(expiration_time);

        if (currentTime < otpExpiryTime) {
          const token = generateToken(user);
          const userId = user.id;
          const userRole = user.userRole;

          return res.status(200).send({ message: 'Login success!', token: token, userId: userId, userRole: userRole });
        } else {
          return res.status(401).send({ message: 'OTP has expired! Please request for a new OTP.' });
        }
      } else {
        return res.status(401).send({ message: 'Invalid OTP! Please enter a valid OTP.' });
      }
    } else {
      return res.status(404).send({ message: 'Email not found! Sign up!' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Error in login check api!',
      error
    });
  }
};


const updateUserType = async (req, res) => {
  try {
    const { type, userId } = req.body;

    userStatus = "0";

    if(type == "Business"){
      userStatus = "1";
    } else {
      userStatus = "0";
    }

    await sequelize.query(
      'UPDATE register SET type = ?,status = ? WHERE id = ?',
      {
        replacements: [type,userStatus, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({ error: false, message: 'User type updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const createUserProfile = async (req, res) => {
  try {
    const { userId, email, qualification, cityQualification, occupation, cityOccupation, employment, about, profile, cover, address,homeTown } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email");
      return res.status(400).json({ error: true, message: 'Invalid email' });
    }

    // Check if user already has a profile
    const existingUser = await sequelize.query(
      'SELECT * FROM personal_profile WHERE user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      console.log("Personal Profile already exists for user ID:", userId);
      return res.status(400).json({ error: true, message: 'Personal Profile already exists' });
    }

    // Create new profile
    await sequelize.query(
      'INSERT INTO personal_profile (user_id, email, qualification, qAddress, occupation, oAddress, employment, about, profile, cover, address,homeTown) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [userId, email, qualification, cityQualification, occupation, cityOccupation, employment, about, profile, cover, address,homeTown],
        type: QueryTypes.INSERT
      }
    );

    // Optionally, generate and send OTP
    // await sendOTP(mobileNumber);

    console.log("Personal Profile created successfully for user ID:", userId);
    return res.status(200).json({ error: false, message: 'Personal Profile created successfully' });

  } catch (error) {
    console.error('Error creating personal profile:', error);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const updateUserPersonalProfile = async (req, res) => {
  try {
    const { userId, email, qualification, cityQualification, occupation, cityOccupation, employment, about, profile, cover, address,homeTown } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email");
      return res.status(400).json({ error: true, message: 'Invalid email' });
    }

    // Check if user profile exists
    const existingUser = await sequelize.query(
      'SELECT * FROM personal_profile WHERE user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );
    if (existingUser.length === 0) {
      console.log("Personal Profile does not exist for user ID:", userId);
      return res.status(404).json({ error: true, message: 'Personal Profile does not exist' });
    }

    // Update profile
    await sequelize.query(
      'UPDATE personal_profile SET email = ?, qualification = ?, qAddress = ?, occupation = ?, oAddress = ?, employment = ?, about = ?, profile = ?, cover = ?, address = ?, homeTown = ? WHERE user_id = ?',
      {
        replacements: [email, qualification, cityQualification, occupation, cityOccupation, employment, about, profile, cover, address,homeTown, userId],
        type: QueryTypes.UPDATE
      }
    );

    console.log("Personal Profile updated successfully for user ID:", userId);
    return res.status(200).json({ error: false, message: 'Personal Profile updated successfully' });

  } catch (error) {
    console.error('Error updating personal profile:', error);
    return res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const createBusinessProfile = async (req, res) => {
  try {
    const { userId, business_name, email, business_type, business_category, description, profile, cover, address, address2, state, city, pinCode, homeTwon } = req.body;

    // Validate mobile number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email");
      res.status(400).json({ error: true, message: 'Invalid email' });
      return;
    }

    const existingUser = await sequelize.query(
      'SELECT * FROM business_profile WHERE user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (existingUser.length === 0) {
      const result = await sequelize.query(
        'INSERT INTO business_profile (user_id,business_name,email,business_type,business_category,description,profile,cover,address,address2,state,city,pincode,homeTwon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        {
          replacements: [userId, business_name, email, business_type, business_category, description, profile, cover, address,address2,state,city,pinCode, homeTwon],
          type: QueryTypes.INSERT
        }
      );
      // Generate and send OTP
      // await sendOTP(mobileNumber);
      res.status(200).json({ error: false, message: 'Business Profile create successfully' });
    } else {
      res.status(400).json({ error: true, message: 'Business Profile is already exist' });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};


const updateBusinessProfile = async (req, res) => {
  try {
    const { userId, business_name, email, business_type, business_category, description, profile, cover, address,address2,state,city,pinCode, homeTwon  } = req.body;

console.log(req.body);
    const existingUser = await sequelize.query(
      'SELECT * FROM business_profile WHERE user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      await sequelize.query(
        `UPDATE business_profile 
         SET business_name = ?, email = ?, business_type = ?, business_category = ?, description = ?, profile = ?,cover = ?,address = ?,address2 = ?,state = ?,city = ?,pinCode = ?,homeTwon = ?
         WHERE user_id = ?`,
        {
          replacements: [business_name, email, business_type, business_category, description, profile, cover, address,address2,state,city,pinCode, homeTwon, userId ],
          type: QueryTypes.UPDATE
        }
      );
      res.status(200).json({ error: false, message: 'Business Profile updated successfully' });
    } else {
      res.status(404).json({ error: true, message: 'Business Profile not found' });
    }
  } catch (error) {
    console.error('Error updating Business Profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const createRequirement = async (req, res) => {
  try {
    const { userId, title, description, images, value } = req.body;
    const result = await sequelize.query(
      'INSERT INTO add_new_requirement (user_id,Title,Description, value) VALUES (?,?,?,?)',
      {
        replacements: [userId, title, description, value],
        type: QueryTypes.INSERT
      }
    );

    if (result && result[0] != null) {
      const reqId = result[0];
      if (Array.isArray(images)) {

        for (let index = 0; index < images.length; index++) {
          const data = images[index];
          await sequelize.query(
            'INSERT INTO requirment_photo (requirment_id, photo) VALUES (?, ?)',
            {
              replacements: [reqId, data],
              type: QueryTypes.INSERT
            }
          );
        }

        res.status(200).json({ message: 'Requirement created!', error: false });
      }
    } else {
      res.status(400).json({ message: 'Data not inserted', error: true });
    }
  } catch (error) {
    console.error('Error creating Requirement:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const getAllUserRequirementsUserFollo = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch users who follow or are followed by the given user
    const users = await sequelize.query(
      `SELECT id FROM register
      WHERE id != :userId 
      AND (id IN (SELECT user_id FROM user_follower WHERE follower_id = :userId AND status = '0')
           OR id IN (SELECT follower_id FROM user_follower WHERE user_id = :userId AND status = '0'))`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const idArray = users.map(user => user.id);
    if (idArray.length === 0) {
      return res.status(200).json({ error: false, message: "No requirements found", allRequirment: [] });
    }

    // Add the current user to the array, but filter their requirements below
    idArray.push(userId);

    // Fetch requirements, excluding the current user's requirements
    const requirementsQuery = `
      SELECT 
        add_new_requirement.*, 
        requirment_photo.id AS PHID, 
        requirment_photo.photo AS RIMAGE,
        register.name AS userName,
        register.type AS userType,
        saved_requirements.requirement_id AS savedRequirementId,
        COALESCE(business_profile.profile, personal_profile.profile) AS profile
      FROM add_new_requirement
      LEFT JOIN requirment_photo ON add_new_requirement.id = requirment_photo.requirment_id
      JOIN register ON add_new_requirement.user_id = register.id
      LEFT JOIN saved_requirements ON add_new_requirement.id = saved_requirements.requirement_id AND saved_requirements.user_id = :userId
      LEFT JOIN business_profile ON register.id = business_profile.user_id AND register.type = 'Business'
      LEFT JOIN personal_profile ON register.id = personal_profile.user_id AND register.type = 'Personal'
      WHERE add_new_requirement.user_id IN (:idArray) 
      AND add_new_requirement.user_id != :userId 
      AND add_new_requirement.value = 'Now'
      AND add_new_requirement.status = '0'
    `;


    const requirements = await sequelize.query(requirementsQuery, {
      replacements: { idArray, userId },
      type: sequelize.QueryTypes.SELECT
    });

    // Fetch sell data for each requirement and compute the user count
    for (let i = 0; i < requirements.length; i++) {
      const sellDataWithUser = await sequelize.query(
        `SELECT sid.*, r.name as name, r.mobileNumber, r.type, r.batchYear
         FROM sell_it_data sid
         JOIN register r ON sid.user_id = r.id
         WHERE sid.requirement_id = ?`,
        {
          replacements: [requirements[i].id],
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      // Attach sell data to each requirement
      requirements[i].sellData = sellDataWithUser;

      // Compute and attach user count
      requirements[i].userCount = sellDataWithUser.length;
    }

    const groupedRequirements = requirements.reduce((acc, row) => {
      const { id, PHID, RIMAGE, userName, userType, savedRequirementId, sellData, userCount, ...requirementData } = row;
      if (!acc[id]) {
        acc[id] = {
          id, // Include the requirement ID here
          ...requirementData,
          userName,
          userType,
          isSaved: !!savedRequirementId,
          images: [],
          sellData: sellData || [], // Include sell data here
          userCount: userCount || 0, // Attach user count
        };
      }
      if (PHID) {
        acc[id].images.push({ id: PHID, url: RIMAGE });
      }
      return acc;
    }, {});

    const resultArray = Object.values(groupedRequirements);

    res.status(200).json({ error: false, message: "Requirements Fetched", allRequirment: resultArray });
  } catch (error) {
    console.error('Error fetching user requirements:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};






const getSavedRequirements = async (req, res) => {
  try {
    const { userId } = req.body;

    const requirementsQuery = `
      SELECT 
        add_new_requirement.*, 
        requirment_photo.id AS PHID, 
        requirment_photo.photo AS RIMAGE 
      FROM 
        saved_requirements
      JOIN 
        add_new_requirement ON saved_requirements.requirement_id = add_new_requirement.id
      LEFT JOIN 
        requirment_photo ON add_new_requirement.id = requirment_photo.requirment_id
      WHERE 
        saved_requirements.user_id = ?
    `;

    const requirements = await sequelize.query(requirementsQuery, {
      replacements: [userId],
      type: QueryTypes.SELECT
    });

    const groupedRequirements = requirements.reduce((acc, row) => {
      const { id, PHID, RIMAGE, ...requirementData } = row;
      if (!acc[id]) {
        acc[id] = {
          id, // Include the requirement ID here
          ...requirementData,
          images: [],
        };
      }
      if (PHID) {
        acc[id].images.push({ id: PHID, url: RIMAGE });
      }
      return acc;
    }, {});

    const resultArray = Object.values(groupedRequirements);

    res.status(200).json({ error: false, message: "Requirements fetched successfully", allRequirment: resultArray });
  } catch (error) {
    console.error('Error fetching saved requirements:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const getAllUserRequirements = async (req, res) => {
  try {
    const { userId } = req.body;

    const requirements = await sequelize.query(
      'SELECT add_new_requirement.*, requirment_photo.id AS PHID, requirment_photo.photo AS RIMAGE FROM add_new_requirement LEFT JOIN requirment_photo ON add_new_requirement.id = requirment_photo.requirment_id WHERE add_new_requirement.user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );


    for (let i = 0; i < requirements.length; i++) {
      console.log(requirements[i].id);
      const sellDataWithUser = await sequelize.query(
        `SELECT sid.*, r.name as name, r.mobileNumber, r.type, r.batchYear
         FROM sell_it_data sid
         JOIN register r ON sid.user_id = r.id
         WHERE sid.requirement_id = ?`,
        {
          replacements: [requirements[i].id],
          type: QueryTypes.SELECT
        }
      );
      
      // Attach sell data to each requirement
      requirements[i].sellData = sellDataWithUser;

      // Compute and attach user count
      requirements[i].userCount = sellDataWithUser.length;
    }

    const groupedRequirements = requirements.reduce((acc, row) => {
      const { id, PHID, RIMAGE, sellData, userCount, ...requirementData } = row;
      if (!acc[id]) {
        acc[id] = {
          id, // Include the requirement ID here
          ...requirementData,
          images: [],
          sellData: sellData || [], // Include sell data here
          userCount: userCount || 0, // Attach user count
        };
      }
      if (PHID) {
        acc[id].images.push({ id: PHID, url: RIMAGE });
      }
      return acc;
    }, {});

    const resultArray = Object.values(groupedRequirements);

    res.status(200).json({ error: false, message: "Requirment Fetch", allRequirment: resultArray });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};



const getAllUsers = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT r.*, uf.id AS FID, uf.user_id AS REQID, uf.status AS FSTATUS FROM register r LEFT JOIN user_follower uf ON (r.id = uf.user_id AND uf.follower_id = ?) OR (r.id = uf.follower_id AND uf.user_id = ?) AND uf.status != ? WHERE r.id != ?',
      {
        replacements: [userId, userId, '2', userId],
        type: QueryTypes.SELECT
      }
    );

    let userCount = 0;

    for (let i = 0; i < users.length; i++) {
      if (users[i].FSTATUS === '0') {
        userCount++;
      }

      let image,category;
      if (users[i].type === 'Business') {
        // Fetch image from business table
        const businessImage = await sequelize.query(
          'SELECT business_category,profile FROM business_profile WHERE user_id = ?',
          {
            replacements: [users[i].id],
            type: sequelize.QueryTypes.SELECT
          }
        );
        image = businessImage.length > 0 ? businessImage[0].profile : null;
        category = businessImage.length > 0 ? businessImage[0].business_category : null;
      } else if (users[i].type === 'Personal') {
        // Fetch image from personal table
        const personalImage = await sequelize.query(
          'SELECT profile FROM personal_profile WHERE user_id = ?',
          {
            replacements: [users[i].id],
            type: sequelize.QueryTypes.SELECT
          }
        );
        image = personalImage.length > 0 ? personalImage[0].profile : null;
        category = null;
      }

      users[i].image = image;
      users[i].category = category;
    }
    console.log(userCount);

    res.status(200).json({ error: false, message: "User Data Fetch", allUsers: users, userCount: userCount });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const getFollowAllUsers = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT * FROM register WHERE id != ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    const userIds = users.map(user => user.id);
    const followers = await sequelize.query(
      'SELECT * FROM user_follower WHERE user_id IN (:userIds) OR follower_id IN (:userIds)',
      {
        replacements: { userIds },
        type: QueryTypes.SELECT
      }
    );

    const usersWithFollowers = users.map(user => {
      user.followers = followers.filter(follower => follower.userId === user.id);
      return user;
    });

    res.status(200).json({ error: false, message: "User Data Fetch", allUsers: usersWithFollowers });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};

const getPersonalProfile = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT personal_profile.*,register.name AS NAME,register.batchYear as BYEAR,register.yearTo as BYEARTO,register.mobileNumber as PHONE FROM personal_profile INNER JOIN register ON personal_profile.user_id = register.id WHERE personal_profile.user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json({ error: false, message: "User Data Fetch", personalProfile: users });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};

const getBusinessProfile = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT business_profile.*,register.name AS NAME,register.batchYear as BYEAR,register.yearTo as BYEARTO,register.mobileNumber as PHONE,register.subscriptionPlan as subscriptionPlan, register.subscriptionEndDate as subscriptionEndDate FROM business_profile INNER JOIN register ON business_profile.user_id = register.id WHERE business_profile.user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json({ error: false, message: "User Data Fetch", businessProfile: users });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};




const sendFollowRequest = async (req, res) => {
  try {
    const { userId, followerId } = req.body;

    const existingUser = await sequelize.query(
      'SELECT * FROM user_follower WHERE user_id = ? AND follower_id = ? AND status != ?',
      {
        replacements: [userId, followerId, '2'],
        type: QueryTypes.SELECT
      }
    );

    const existingUser1 = await sequelize.query(
      'SELECT * FROM user_follower WHERE user_id = ? AND follower_id = ? AND status != ?',
      {
        replacements: [followerId, userId, '2'],
        type: QueryTypes.SELECT
      }
    );

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const totalRequests = await sequelize.query(
      'SELECT COUNT(*) as total FROM user_follower WHERE user_id = ? AND created_at >= ? AND status != ?',
      {
        replacements: [userId, oneMonthAgo, '2'],
        type: QueryTypes.SELECT
      }
    );

    console.log(totalRequests);

    const userPlan = await sequelize.query(
      'SELECT subscriptionPlan, subscriptionEndDate,type FROM register WHERE id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (userPlan.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const subscriptionEndDate = new Date(userPlan[0].subscriptionEndDate);
    const currentDate = new Date();

    if(userPlan[0].type == "Personal"){
      if (existingUser.length === 0 && existingUser1.length === 0) {
        const result = await sequelize.query(
          'INSERT INTO user_follower (user_id,follower_id) VALUES (?, ?)',
          {
            replacements: [userId, followerId],
            type: QueryTypes.INSERT
          }
        );
        res.status(200).json({ error: false, message: 'Request send successfully' });
      } else {
        res.status(400).json({ error: true, message: 'Request already exist' });
      }
    }else{
      if (currentDate > subscriptionEndDate) {
        res.status(400).json({ error: true, message: 'Subscription is expired', isExpired: true });
      } else {
  
        if(userPlan[0].subscriptionPlan == "Silver"){
          if(totalRequests[0].total < 10){
            if (existingUser.length === 0 && existingUser1.length === 0) {
              const result = await sequelize.query(
                'INSERT INTO user_follower (user_id,follower_id) VALUES (?, ?)',
                {
                  replacements: [userId, followerId],
                  type: QueryTypes.INSERT
                }
              );
              res.status(200).json({ error: false, message: 'Request send successfully' });
            } else {
              res.status(400).json({ error: true, message: 'Request already exist' });
            }
          }else{
            res.status(400).json({ error: true, message: 'Your Plan Limit Has Reached' });
          }
        }else{
          if (existingUser.length === 0 && existingUser1.length === 0) {
            const result = await sequelize.query(
              'INSERT INTO user_follower (user_id,follower_id) VALUES (?, ?)',
              {
                replacements: [userId, followerId],
                type: QueryTypes.INSERT
              }
            );
            res.status(200).json({ error: false, message: 'Request send successfully' });
          } else {
            res.status(400).json({ error: true, message: 'Request already exist' });
          }
        }
      }
    }

    // Check if the subscription is expired
    
  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};

const getFollowRequest = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT user_follower.*,register.name AS NAME,register.batchYear as BYEAR,register.mobileNumber as PHONE FROM user_follower INNER JOIN register ON user_follower.user_id = register.id WHERE user_follower.follower_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json({ error: false, message: "Follow Request Fetch", followRequest: users });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { reqId, status } = req.body;

    await sequelize.query(
      'UPDATE user_follower SET status = ? WHERE id = ?',
      {
        replacements: [status, reqId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    var msg = "";
    if (status == "0") {
      msg = "Accept request successfully";
    } else {
      msg = "Reject request successfully";
    }

    res.json({ error: false, message: msg });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

// i want to check user enter otp is valid or not and if valid then verify otp and go to home screen 

// Function to login


// Function to get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await sequelize.query(
      'SELECT * FROM users WHERE id != :userId',
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const { email, password, name } = req.body;

    await sequelize.query(
      'UPDATE users SET email = ?, password = ?, name = ? WHERE id = ?',
      {
        replacements: [email, password, name, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getImage = async (req, res) => {
  try {
    console.log(req.files)
    let id = req.params.id
    let image = req.files.profile_pic //key and auth


    if (image.length > 1) {
      throw new error('multiple file not allowed!')
    }

    const dirExists = fs.existsSync(`public/assets/`);

    if (!dirExists) {
      fs.mkdirSync(`public/assets/`, { recursive: true });
    }

    if (image == undefined || image == null) throw new Error("file not found!");

    let savePath = `/public/assets/${Date.now()}.${image.name.split(".").pop()}`

    image.mv(path.join(__dirname, ".." + savePath), async (err) => {
      if (err) throw new Error("error in uploading")

      else {
        const updateQuery = 'UPDATE users SET profile_pic = :profile_pic WHERE id = :id';

        await sequelize.query(updateQuery, {
          replacements: { profile_pic: savePath, id: id },
          type: sequelize.QueryTypes.UPDATE
        });
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'error in file upload api!' });
  }
}



const updatepassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const email = req.user.email;
    console.log(userId);
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await sequelize.query(
      'UPDATE users SET password = ? WHERE email = ?',
      { replacements: [hashedPassword, email], type: QueryTypes.UPDATE }
    );
    res.json({ message: 'password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};












// const findRoomByUserId = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const rooms = await sequelize.query(
//       'SELECT user_id FROM rooms ',
//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const roomExists = rooms.map(room => room.user_id === userId);

//     if (!roomExists) {
//       res.status(404).json({ error: 'Room not found' });
//       return;
//     }

//     const selectUserId = await sequelize.query(
//       `SELECT * FROM posts WHERE user_id IN (?)`,
//       {
//         type: sequelize.QueryTypes.SELECT,
//         replacements: [rooms[0].user_id],
//       }
//     );

//     res.json(selectUserId);
//   } catch (error) {
//     console.error('Error finding room by user ID:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
const sendMessageRoom = async (req, res) => {
  try{
    const { content, senderId, roomId,type } = req.body;
  console.log(req.body);

  await sequelize.query(
    'INSERT INTO message_room (senderId,roomId, content,type) VALUES (?, ?, ?, ?)',
    {
      replacements: [senderId, roomId, content, type],
      type: sequelize.QueryTypes.INSERT
    }
  );

  res.status(200).json({error: false,message: "send success "});
  }catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
}


// const sendMessageRoom = async (req, res) => {
//   const { content, senderId, receiverId,type } = req.body;
//   const receiverId = req.params.id;
//   console.log(receiverId);
//   const senderId = req.user.id;

//   await sequelize.query(
//     'INSERT INTO group_chat (user_id, room_id, created_at, content) VALUES (?, ?, NOW(), ?)',
//     {
//       replacements: [senderId, receiverId, content],
//       type: sequelize.QueryTypes.INSERT
//     }
//   );

//   res.json({ message: 'Message sent successfully' });
// }



const getMessagesSenderRoom = async (req, res) => {
  const receiverId = req.params.id;
  console.log(receiverId);
  const senderId = req.user.id;

  const messages = await sequelize.query(
    'SELECT * FROM group_chat WHERE (user_id = ? AND room_id = ?) OR (user_id = ? AND room_id = ?) ORDER BY created_at ASC',
    {
      replacements: [senderId, receiverId, senderId, receiverId],
      type: sequelize.QueryTypes.SELECT
    }
  );

  res.json(messages);
}


// const getAllUsersIfFollow = async (req, res) => {
//   try {
//     // const userId = req.user.id;
//     const { userId } = req.body;
//     const users = await sequelize.query(
//       `SELECT r.*, uf.id AS FID, uf.user_id AS REQID, uf.status AS FSTATUS
//        FROM register r
//        LEFT JOIN user_follower uf ON 
//          (r.id = uf.user_id AND uf.follower_id = ? AND uf.status = 0) OR 
//          (r.id = uf.follower_id AND uf.user_id = ? AND uf.status = 0)
//        WHERE r.id != ?`,
//       {
//         replacements: [userId, userId, userId],
//         type: QueryTypes.SELECT
//       }
//     );
//     res.status(200).json({ error: false, message: "User Data Fetch", allUsers: users });
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Internal server error', error: true });
//   }
// };


const getAllUsersIfFollow = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch users who follow the given user or are followed by the given user
    const users = await sequelize.query(
      `SELECT * FROM register
      WHERE id != :userId
      AND (id IN (SELECT user_id FROM user_follower WHERE follower_id = :userId AND status = '0')
           OR id IN (SELECT follower_id FROM user_follower WHERE user_id = :userId AND status = '0'))`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Initialize unseen messages count and last message creation time for each user
    for (let i = 0; i < users.length; i++) {
      const unseenMessagesCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM message WHERE seen = false AND senderId = ? AND reciverId = ?',
        {
          replacements: [users[i].id, userId],
          type: sequelize.QueryTypes.SELECT
        }
      );

      // Get the last message creation time
      const lastMessageTime = await sequelize.query(
        `SELECT createdAt FROM message 
         WHERE (senderId = ? AND reciverId = ?) OR (senderId = ? AND reciverId = ?)
         ORDER BY createdAt DESC LIMIT 1`,
        {
          replacements: [users[i].id, userId, userId, users[i].id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      let image,category;
      if (users[i].type === 'Business') {
        // Fetch image from business table
        const businessImage = await sequelize.query(
          'SELECT business_category,profile FROM business_profile WHERE user_id = ?',
          {
            replacements: [users[i].id],
            type: sequelize.QueryTypes.SELECT
          }
        );
        image = businessImage.length > 0 ? businessImage[0].profile : null;
        category = businessImage.length > 0 ? businessImage[0].business_category : null;
      } else if (users[i].type === 'Personal') {
        // Fetch image from personal table
        const personalImage = await sequelize.query(
          'SELECT profile FROM personal_profile WHERE user_id = ?',
          {
            replacements: [users[i].id],
            type: sequelize.QueryTypes.SELECT
          }
        );
        image = personalImage.length > 0 ? personalImage[0].profile : null;
        category = null;
      }

      // Add unseen message count and last message time to each user object
      users[i].unseenMessagesCount = unseenMessagesCount[0].count;
      users[i].lastMessageTime = lastMessageTime.length > 0 ? lastMessageTime[0].createdAt : null;
      users[i].image = image;
      users[i].category = category;
    }

    res.status(200).json({ error: false, message: "Users fetched successfully", chatUsers: users });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};



const markMessagesAsSeen = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    await sequelize.query(
      'UPDATE message SET seen = true, seen_at = NOW() WHERE senderId = ? AND reciverId = ?',
      {
        replacements: [receiverId, senderId],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ error: false, message: "Messages marked as seen" });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};




// chat api 


const createRoom = async (req, res) => {
  try {
    const { userId, selectedUsers } = req.body;

    // Assuming `userId` is the ID of the current user creating the room

    // Insert into chat_rooms table
    const result = await sequelize.query(
      'INSERT INTO rooms (user_id) VALUES (?)',
      {
        replacements: [userId],
        type: sequelize.QueryTypes.INSERT
      }
    );

    const roomId = result[0]; // Assuming the ID of the created room is returned
    const participants = [...selectedUsers, userId];

    // Insert participants into chat_room_participants table
    for (const participant of participants) {
      await sequelize.query(
        'INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)',
        {
          replacements: [roomId, participant],
          type: sequelize.QueryTypes.INSERT
        }
      );
    }
    res.status(200).json({ error: false, message: 'Room Created Successfully' });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const findRoomByUserId = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    // Fetch rooms where the user is either the creator or a participant
    const roomsQuery = await sequelize.query(
      `
      SELECT DISTINCT rooms.id, rooms.user_id, rooms.g_name, rooms.created_at
      FROM rooms
      LEFT JOIN room_participants ON rooms.id = room_participants.room_id
      WHERE rooms.user_id = ? OR room_participants.user_id = ?
      `,
      {
        replacements: [userId, userId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (roomsQuery.length === 0) {
      return res.status(404).json({ error: true, message: 'No rooms found for this user' });
    }

    // Fetch participants and message details for each room
    const roomDetails = await Promise.all(roomsQuery.map(async (room) => {
      const participantsQuery = await sequelize.query(
        `
        SELECT register.id, register.name
        FROM room_participants
        JOIN register ON room_participants.user_id = register.id
        WHERE room_participants.room_id = ?
        `,
        {
          replacements: [room.id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      const lastMessageTimeQuery = await sequelize.query(
        `SELECT createdAt FROM message_room 
         WHERE roomId = ?
         ORDER BY createdAt DESC LIMIT 1`,
        {
          replacements: [room.id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      const lastMessageTime = lastMessageTimeQuery.length > 0 ? lastMessageTimeQuery[0].createdAt : null;

      return {
        room: {
          id: room.id,
          user_id: room.user_id,
          g_name: room.g_name,
          created_at: room.created_at,
          lastMessageTime: lastMessageTime
        },
        participants: participantsQuery
      };
    }));

    res.status(200).json({ error: false, message: "Rooms fetched successfully", roomDetails: roomDetails });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





const sendMessage = async (req, res) => {
  try{
    const { content, senderId, receiverId,type } = req.body;
  console.log(req.body);

  // await sequelize.query("SET SESSION max_allowed_packet=67108864");

  await sequelize.query(
    'INSERT INTO message (senderId, reciverId, content,type) VALUES (?, ?, ?, ?)',
    {
      replacements: [senderId, receiverId, content,type],
      type: sequelize.QueryTypes.INSERT,
    }
  );

  res.status(200).json({error: false,message: "send success "});
  }catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
}

const getMessages = async (req, res) => {
  try {
    const { receiverId, senderId } = req.body;
    console.log(receiverId);

    // Fetch messages between sender and receiver
    const messages = await sequelize.query(
      'SELECT * FROM message WHERE (senderId = ? AND reciverId = ?) OR (reciverId = ? AND senderId = ?) ORDER BY createdAt DESC',
      {
        replacements: [senderId, receiverId, senderId, receiverId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Process messages to include requirement details if needed
    for (let i = 0; i < messages.length; i++) {
      console.log(messages[i].type);
      if (messages[i].type === "requirement") {
        const requirementId = messages[i].content;
        console.log(requirementId);

        const requirementsQuery = `
          SELECT add_new_requirement.*, 
                 requirment_photo.id AS PHID, 
                 requirment_photo.photo AS RIMAGE
          FROM add_new_requirement
          LEFT JOIN requirment_photo ON add_new_requirement.id = requirment_photo.requirment_id
          WHERE add_new_requirement.id = ?
        `;

        const requirements = await sequelize.query(requirementsQuery, {
          replacements: [requirementId],
          type: sequelize.QueryTypes.SELECT
        });

        const groupedRequirements = requirements.reduce((acc, row) => {
          const { id, PHID, RIMAGE, ...requirementData } = row;
          if (!acc[id]) {
            acc[id] = {
              id,
              ...requirementData,
              images: [],
            };
          }
          if (PHID) {
            acc[id].images.push({ id: PHID, url: RIMAGE });
          }
          return acc;
        }, {});

        // Attach the requirement details to the message
        messages[i].requirement = Object.values(groupedRequirements)[0] || null;
      }
    }

    // Get the total number of unseen messages
    

    res.status(200).json({ 
      error: false, 
      message: "Messages fetched successfully", 
      messages: messages, 
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};





const getMessagesRoom = async (req, res) => {
  try{
    const { roomId } = req.body;

  const messages = await sequelize.query(
    'SELECT * FROM message_room WHERE roomId = ? ORDER BY createdAt ASC',
    {
      replacements: [roomId],
      type: sequelize.QueryTypes.SELECT
    }
  );

  res.status(200).json({error: false,message: "Message Fetch Successfully",messages: messages});
  }catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
}

const getAllUserPrductService = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;


    const requirments = await sequelize.query(
      'SELECT add_new_productservice.*,productservice_photo.id AS PHID,productservice_photo.photo AS RIMAGE FROM add_new_productservice LEFT JOIN productservice_photo ON add_new_productservice.id = productservice_photo.productservice_id WHERE add_new_productservice.user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    const groupedRequirements = requirments.reduce((acc, row) => {
      const { id, PHID, RIMAGE, ...requirementData } = row;
      if (!acc[id]) {
        acc[id] = {
          ...requirementData,
          images: [],
        };
      }
      if (PHID) {
        acc[id].images.push({ id: PHID, url: RIMAGE });
      }
      return acc;
    }, {});
    const resultArray = Object.values(groupedRequirements);

    res.status(200).json({ error: false, message: "Product Fetch", allProducts: resultArray });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};




const getUserStory = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;

    const users = await sequelize.query(
      `SELECT id FROM register
      WHERE id != :userId 
      AND (id IN (SELECT user_id FROM user_follower WHERE follower_id = :userId AND status = '0')
           OR id IN (SELECT follower_id FROM user_follower WHERE user_id = :userId AND status = '0'))`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const idArray = users.map(user => user.id);
    if (idArray.length === 0) {
      return res.status(200).json({ error: false, message: "No story found", UserStory: [] });
    }

    // Add the current user to the array, but filter their requirements below
    idArray.push(userId);

    const status = "1";
    const usersStory = await sequelize.query(
      'SELECT * FROM ads_photo WHERE user_id IN (:idArray) AND user_id != :userId AND status = :status AND NOW() <= DATE_ADD(created_at, INTERVAL CAST(story_time AS UNSIGNED) HOUR)',
      {
        replacements: { idArray, userId, status },
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json({ error: false, message: "User Story Fetch", UserStory: usersStory });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};

const deleteRequirement = async (req, res) => {
  try {
    const { requirementId } = req.body;
    if (!requirementId) {
      return res.status(400).json({ message: 'Requirement ID is required', error: true });
    }

    const result = await sequelize.query(
      'DELETE FROM add_new_requirement WHERE id = ?',
      {
        replacements: [requirementId],
        type: QueryTypes.DELETE,
      }
    );

    // if (result[0] === 0) {
    //   return res.status(404).json({ message: 'Requirement not found', error: true });
    // }

    res.status(200).json({ message: 'Requirement deleted successfully', error: false });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const updateRequirementStatus = async (req, res) => {
  try {
    const { requirementId } = req.body;
    if (!requirementId ) {
      return res.status(400).json({ message: 'Requirement ID and status are required', error: true });
    }

    const result = await sequelize.query(
      'UPDATE add_new_requirement SET Status = ? WHERE id = ?',
      {
        replacements: [1, requirementId],
        type: QueryTypes.UPDATE,
      }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: 'Requirement not found', error: true });
    }

    res.status(200).json({ message: 'Requirement status updated successfully', error: false });
  } catch (error) {
    console.error('Error updating requirement status:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};




const clickSellIt = async (req, res) => {
  try {
    const { user_id, requirement_user_id, requirement_id } = req.body;
    console.log(req.body);

    // Check if the requirement_id already exists
    const [existingEntry] = await sequelize.query(
      'SELECT * FROM sell_it_data WHERE requirement_id = ?',
      {
        replacements: [requirement_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingEntry) {
      return res.status(400).json({ error: true, message: "Requirement already Sell exists" });
    }

    // If the entry does not exist, insert the new entry
    await sequelize.query(
      'INSERT INTO sell_it_data (user_id, requirement_user_id, requirement_id) VALUES (?, ?, ?)',
      {
        replacements: [user_id, requirement_user_id, requirement_id],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    res.status(200).json({ error: false, message: "Send success" });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const getClickSellIt = async (req, res) => {
  try{
    const {  	user_id, requirement_user_id } = req.body;

    const messages = await sequelize.query(
      'SELECT * FROM sell_it_data WHERE requirement_user_id = ?  AND user_id = ?',
      {
        replacements: [requirement_user_id ,user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json({error: false,message: "Message Fetch Successfully",messages: messages});
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
}

const updateUserToken = async (req, res) => {
  try {
    const { token, userId } = req.body;

    await sequelize.query(
      'UPDATE register SET token = ? WHERE id = ?',
      {
        replacements: [token, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({ error: false, message: 'User token updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};


const getUserToken = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT token FROM register WHERE id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json({ error: false, message: "User Token Fetch", UserToken: users });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};



const createStory = async (req, res) => {
  try {
    const {userId, profile, time} = req.body;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const totalStory = await sequelize.query(
      'SELECT COUNT(*) as total FROM ads_photo WHERE user_id = ? AND created_at >= ? AND status = ?',
      {
        replacements: [userId, oneMonthAgo, '1'],
        type: QueryTypes.SELECT
      }
    );

    const userPlan = await sequelize.query(
      'SELECT subscriptionPlan, subscriptionEndDate FROM register WHERE id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (userPlan.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const subscriptionEndDate = new Date(userPlan[0].subscriptionEndDate);
    const currentDate = new Date();

    if (currentDate > subscriptionEndDate) {
      res.status(400).json({ error: true, message: 'Subscription is expired', isExpired: true });
    } else {
      if(userPlan[0].subscriptionPlan == "Silver"){
        const result = await sequelize.query(
          'INSERT INTO ads_photo (user_id,photo,story_time) VALUES (?, ?, ?)',
          {
            replacements: [userId,  profile, time],
            type: QueryTypes.INSERT
          }
        );
        // Generate and send OTP
        // await sendOTP(mobileNumber);
        res.status(200).json({ error: false, message: 'Stroy create successfully' });
      } else {
        if(totalStory[0].total < 5){
          const result = await sequelize.query(
            'INSERT INTO ads_photo (user_id,photo,story_time) VALUES (?, ?, ?)',
            {
              replacements: [userId,  profile, time],
              type: QueryTypes.INSERT
            }
          );
          // Generate and send OTP
          // await sendOTP(mobileNumber);
          res.status(200).json({ error: false, message: 'Stroy create successfully' });
        } else {
          res.status(400).json({ error: true, message: 'Your Plan Limit Has Reached' });
        }
      }
    }

    

  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};

const getRoomUserToken = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { roomId } = req.body;

    const roomsQuery = await sequelize.query(
      'SELECT user_id FROM room_participants WHERE room_id = ?',
      {
        replacements: [roomId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (roomsQuery.length === 0) {
      return res.status(404).json({ error: true, message: 'No rooms found for this user' });
    }

    const roomDetails = await Promise.all(roomsQuery.map(async (room) => {
      const participantsQuery = await sequelize.query(
        'SELECT token FROM register WHERE id = ?',
        {
          replacements: [room.user_id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      return {
        allUserToken: participantsQuery
      };
    }));

    res.status(200).json({ error: false, message: "User Token Fetch", roomUserToken: roomDetails });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};







// admin api all 
const loginUserAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [existingUser] = await sequelize.query('SELECT * FROM admin WHERE email = ? AND password = ?',
      { replacements: [email, password], type: QueryTypes.SELECT });

    // const [existingUserLoginWith] = await sequelize.query('SELECT type FROM register WHERE mobileNumber = ? ',
    // { replacements: [mobileNumber], type: QueryTypes.SELECT });

    if (existingUser) {

      const user = existingUser;

      const token = generateToken(user);
      const userId = user.id;
      const type = user.type;
      const status = user.status;

      return res.status(200).send({ error: false, message: 'Login success!', token: token, userId: userId, type: type, status: status });
    } else {
      return res.status(404).send({ error: true, message: 'Mobile Number not found! Sign up!' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Error in login check api!',
      error
    });
  }
};

const fetchUsersForAdmin = async (req, res) => {
  try {
    // Fetch all users with type 'Business'
    const users = await sequelize.query(
      'SELECT * FROM register WHERE type = ?',
      {
        replacements: ['Business'],
        type: QueryTypes.SELECT
      }
    );

    // Initialize an array to hold the user details with profiles
    const userDetails = [];

    const currentDate = new Date().toISOString().slice(0, 10);

    // Fetch all users with type 'Business' registered on the current day
    const usersCurrentDate = await sequelize.query(
      'SELECT * FROM register WHERE type = ? AND DATE(created_at) = ?',
      {
        replacements: ['Business', currentDate],
        type: QueryTypes.SELECT
      }
    );

    for (const user of users) {
      // Fetch profile data for Business type users
      const profileData = await sequelize.query(
        'SELECT * FROM business_profile WHERE user_id = ?',
        {
          replacements: [user.id],
          type: QueryTypes.SELECT
        }
      );

      // Add user and profile data to the userDetails array
      userDetails.push({
        ...user,
        profile: profileData[0] || null // Assuming profileData is an array
      });
    }


    const topUsers = await sequelize.query(
      `SELECT user_id, COUNT(*) as completedCount
       FROM add_new_requirement
       WHERE status = ?
       GROUP BY user_id
       ORDER BY completedCount DESC
       LIMIT 3`,
      {
        replacements: ['1'],
        type: QueryTypes.SELECT
      }
    );

    // Fetch user details for the top users
    const userDetailsPromises = topUsers.map(async (user) => {
      const userDetail = await sequelize.query(
        'SELECT id, name, batchYear, mobileNumber, type FROM register WHERE id = ?',
        {
          replacements: [user.user_id],
          type: QueryTypes.SELECT
        }
      );
      return {
        ...userDetail[0],
        completedCount: user.completedCount
      };
    });

    const userComplatedReq = await Promise.all(userDetailsPromises);

    // Count total number of users
    const totalUsers = users.length;
    const totalUsersCurrentDate = usersCurrentDate.length;


    // Send response with user details and total count
    res.status(200).json({ error: false, totalUsers, topUsers: userComplatedReq , totalUsersCurrentDate, users: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const fetchUserProfile = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming userId is passed in the request body

    // Fetch user details
    const user = await sequelize.query(
      'SELECT id, name, batchYear, mobileNumber,subscriptionPlan,subscriptionStartDate,subscriptionEndDate, type,status FROM register WHERE id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (!user || user.length === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const userType = user[0].type;
    let profileData;

    // Fetch profile data based on user type
    if (userType === 'Business') {
      profileData = await sequelize.query(
        'SELECT * FROM business_profile WHERE user_id = ?',
        {
          replacements: [userId],
          type: QueryTypes.SELECT
        }
      );
    } else if (userType === 'Personal') {
      profileData = await sequelize.query(
        'SELECT * FROM personal_profile WHERE user_id = ?',
        {
          replacements: [userId],
          type: QueryTypes.SELECT
        }
      );
    } else {
      return res.status(400).json({ error: true, message: 'Invalid user type' });
    }

    // Add profile data to the user object
    const userDetails = {
      ...user[0],
      profile: profileData[0] || null // Assuming profileData is an array
    };

    res.status(200).json({ error: false, user: userDetails });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};


const fetchUsersForAdminPersonal = async (req, res) => {
  try {
    // Fetch all users with type 'Business'
    const users = await sequelize.query(
      'SELECT id, name, batchYear, mobileNumber, type FROM register WHERE type = ?',
      {
        replacements: ['Personal'],
        type: QueryTypes.SELECT
      }
    );

    // Initialize an array to hold the user details with profiles
    const userDetails = [];

    const currentDate = new Date().toISOString().slice(0, 10);

    // Fetch all users with type 'Business' registered on the current day
    const usersCurrentDate = await sequelize.query(
      'SELECT id, name, batchYear, mobileNumber, type FROM register WHERE type = ? AND DATE(created_at) = ?',
      {
        replacements: ['Personal', currentDate],
        type: QueryTypes.SELECT
      }
    );

    const usersTotalCurrentDate = await sequelize.query(
      'SELECT * FROM register WHERE DATE(created_at) = ?',
      {
        replacements: [ currentDate],
        type: QueryTypes.SELECT
      }
    );

    const usersTotal = await sequelize.query(
      'SELECT * FROM register ',
      {
        type: QueryTypes.SELECT
      }
    );



    for (const user of users) {
      // Fetch profile data for Business type users
      const profileData = await sequelize.query(
        'SELECT * FROM business_profile WHERE user_id = ?',
        {
          replacements: [user.id],
          type: QueryTypes.SELECT
        }
      );

      // Add user and profile data to the userDetails array
      userDetails.push({
        ...user,
        profile: profileData[0] || null // Assuming profileData is an array
      });
    }

    const totalUsers = users.length;
    const totalUsersCurrentDate = usersCurrentDate.length;
    const TotalUserToday = usersTotalCurrentDate.length;
    const TotalUser = usersTotal.length;

    // Send response with user details
    res.status(200).json({ error: false, totalUsers, totalUsersCurrentDate, TotalUserToday, TotalUser, users: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const fetchUserRequirements = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch all requirements for the user where status is 1
    const requirements = await sequelize.query(
      'SELECT * FROM add_new_requirement WHERE user_id = ? ',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    if (requirements.length === 0) {
      return res.status(404).json({ message: 'No requirements found for the user', error: true });
    }

    // Fetch associated images for each requirement
    for (const requirement of requirements) {
      const images = await sequelize.query(
        'SELECT photo FROM requirment_photo WHERE requirment_id = ?',
        {
          replacements: [requirement.id],
          type: QueryTypes.SELECT
        }
      );

      requirement.images = images.map(img => img.photo);
    }

    // Count the total number of requirements where status is 1
    const requirementCount = await sequelize.query(
      'SELECT COUNT(*) AS count FROM add_new_requirement WHERE status = 1',
      {
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json({ requirements, totalRequirements: requirementCount[0].count, error: false });
  } catch (error) {
    console.error('Error fetching user requirements:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};




const fetchUserRequirementsLetter = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetch all requirements for the user where the value is 'Letter'
    const requirements = await sequelize.query(
      'SELECT * FROM add_new_requirement WHERE user_id = ? AND value = ?',
      {
        replacements: [userId, 'Letter'],
        type: QueryTypes.SELECT
      }
    );

    if (requirements.length === 0) {
      return res.status(404).json({ message: 'No requirements found for the user', error: true });
    }

    // Fetch associated images for each requirement
    for (const requirement of requirements) {
      const images = await sequelize.query(
        'SELECT photo FROM requirment_photo WHERE requirment_id = ?',
        {
          replacements: [requirement.id],
          type: QueryTypes.SELECT
        }
      );

      requirement.images = images.map(img => img.photo);
    }

    res.status(200).json({ requirements, error: false });
  } catch (error) {
    console.error('Error fetching user requirements:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};




const fetchRequirementDetails = async (req, res) => {
  try {
    const { requirementId } = req.body;

    // Validate the requirement ID
    const requirement = await sequelize.query(
      'SELECT * FROM add_new_requirement WHERE id = ?',
      {
        replacements: [requirementId],
        type: QueryTypes.SELECT
      }
    );

    if (requirement.length === 0) {
      return res.status(404).json({ message: 'Requirement ID not found', error: true });
    }

    // Fetch data from sell_it_data table and the associated user name from the register table
    const sellDataWithUser = await sequelize.query(
      `SELECT sid.*, r.name as name, r.mobileNumber, r.type, r.batchYear
       FROM sell_it_data sid
       JOIN register r ON sid.user_id = r.id
       WHERE sid.requirement_id = ?`,
      {
        replacements: [requirementId],
        type: QueryTypes.SELECT
      }
    );

    const sellDataCount = sellDataWithUser.length;

    res.status(200).json({
      requirement: requirement[0],
      totalRequirements: requirementCount[0].count,
      totalSellData: sellDataCount,
      sellData: sellDataWithUser,
      error: false
    });
  } catch (error) {
    console.error('Error fetching requirement details:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};



const fetchUsersTotalCountAll = async (req, res) => {
  try {
    const currentDate = new Date().toISOString().slice(0, 10);
    const totalRequirements = await sequelize.query(
      'SELECT * FROM add_new_requirement ',
      {
        type: QueryTypes.SELECT
      }
    );

    const totalRequirementsToday = await sequelize.query(
      'SELECT * FROM add_new_requirement WHERE  createdAt = ?',
      {
        replacements: [currentDate],
        type: QueryTypes.SELECT
      }
    );

    const totalRequirementsComplated = await sequelize.query(
      'SELECT * FROM add_new_requirement WHERE status = ?',
      {
        replacements: ['1'],
        type: QueryTypes.SELECT
      }
    );


    const totalRequirementsComplatedToday = await sequelize.query(
      'SELECT * FROM add_new_requirement WHERE  status = ? AND  createdAt = ?',
      {
        replacements: ['1', currentDate],
        type: QueryTypes.SELECT
      }
    );

    const totalRequirementsLetter = await sequelize.query(
      'SELECT * FROM add_new_requirement WHERE value = ?',
      {
        replacements: ['Letter'],
        type: QueryTypes.SELECT
      }
    );

    const totalServicesToday = await sequelize.query(
      'SELECT * FROM add_new_productservice WHERE Type = ? AND  createdAt = ?',
      {
        replacements: ['Service',currentDate],
        type: QueryTypes.SELECT
      }
    );

    const totalServices = await sequelize.query(
      'SELECT * FROM add_new_productservice WHERE Type = ?',
      {
        replacements: ['Service'],
        type: QueryTypes.SELECT
      }
    );

    const totalProducts = await sequelize.query(
      'SELECT * FROM add_new_productservice WHERE  Type = ? ',
      {
        replacements: ['Product'],
        type: QueryTypes.SELECT
      }
    );

    const totalProductsToday = await sequelize.query(
      'SELECT * FROM add_new_productservice WHERE  status = ? AND  createdAt = ?',
      {
        replacements: ['Product', currentDate],
        type: QueryTypes.SELECT
      }
    );

    const totalRequirement = totalRequirements.length;
    const totalRequirementToday = totalRequirementsToday.length;
    const totalRequirementComplated = totalRequirementsComplated.length;
    const totalRequirementComplatedToday = totalRequirementsComplatedToday.length;
    const totalRequirementLetter = totalRequirementsLetter.length;
    const totalService = totalServices.length;
    const totalServiceToday = totalServicesToday.length;
    const totalProduct = totalProducts.length;
    const totalProductToday = totalProductsToday.length;

    // Send response with user details
    res.status(200).json({ error: false, totalService, totalServiceToday, totalProduct, totalProductToday, totalRequirement,totalRequirementToday ,totalRequirementComplated,totalRequirementComplatedToday,totalRequirementLetter, });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const fetchTopUsersWithCompletedRequirements = async (req, res) => {
  try {
    // Fetch top three users who have completed the highest number of requirements
    const topUsers = await sequelize.query(
      `SELECT user_id, COUNT(*) as completedCount
       FROM add_new_requirement
       WHERE status = ?
       GROUP BY user_id
       ORDER BY completedCount DESC
       LIMIT 3`,
      {
        replacements: ['1'],
        type: QueryTypes.SELECT
      }
    );

    // Fetch user details for the top users
    const userDetailsPromises = topUsers.map(async (user) => {
      const userDetail = await sequelize.query(
        'SELECT id, name, batchYear, mobileNumber, type FROM register WHERE id = ?',
        {
          replacements: [user.user_id],
          type: QueryTypes.SELECT
        }
      );
      return {
        ...userDetail[0],
        completedCount: user.completedCount
      };
    });

    const userDetails = await Promise.all(userDetailsPromises);

    // Send response with the top users and their completed requirements count
    res.status(200).json({ error: false, topUsers: userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getUserPlan = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT subscriptionPlan, status FROM register WHERE id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );

    console.log(users);
    res.status(200).json({ error: false, message: "User Plan Fetch", UserPlan: users });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};



const verifyBusinessProfile = async (req, res) => {
  try {
    const { userId,status } = req.body;
    await sequelize.query(
      'UPDATE register SET status = ? WHERE id = ?',
      {
        replacements: [status, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({ error: false, message: 'Business Verified successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const getUserStorybyId = async (req, res) => {
  try {
    // const userId = req.user.id;
    const { userId } = req.body;
    const users = await sequelize.query(
      'SELECT * FROM ads_photo WHERE user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json({ error: false, message: "User Story Fetch", UserStory: users });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ messsage: 'Internal server error', error: true });
  }
};

const verifyStory = async (req, res) => {
  try {
    const { storyId,status } = req.body;
    await sequelize.query(
      'UPDATE ads_photo SET status = ? WHERE id = ?',
      {
        replacements: [status, storyId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({ error: false, message: 'Business Story Verified successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const updateGroupName = async (req, res) => {
  try {
    const { roomId,userId,name } = req.body;
    await sequelize.query(
      'UPDATE rooms SET g_name = ? WHERE id = ? AND user_id = ?',
      {
        replacements: [name, roomId, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({ error: false, message: 'Group Nane Updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: true, message: 'Group Name Only Updated By Admin' });
  }
};


const updateUserName = async (req, res) => {
  try {
    const { userId, name, batchYear, yearTo } = req.body;

    // Check if all required fields are provided
    if (userId === undefined || name === undefined || batchYear === undefined || yearTo === undefined) {
      return res.status(400).json({ error: true, message: 'All fields are required' });
    }

    // Log the values to confirm they are as expected
    console.log('Request Body:', req.body);

    // Execute the update query
    await sequelize.query(
      'UPDATE register SET name = ?, batchYear = ?, yearTo = ? WHERE id = ?',
      {
        replacements: [name, batchYear, yearTo, userId],
        type: QueryTypes.UPDATE
      }
    );

    res.json({ error: false, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: true, message: 'Profile not updated' });
  }
};

// const createProduct = async (req, res) => {
//   try {
//     const { userId, title, description, images, type } = req.body;

//     const totalProducts = await sequelize.query(
//       'SELECT COUNT(*) as total FROM add_new_productservice WHERE user_id = ?',
//       {
//         replacements: [userId],
//         type: QueryTypes.SELECT
//       }
//     );

//     const userPlan = await sequelize.query(
//       'SELECT subscriptionPlan, subscriptionEndDate FROM register WHERE id = ?',
//       {
//         replacements: [userId],
//         type: QueryTypes.SELECT
//       }
//     );

//     if (userPlan.length === 0) {
//       return res.status(404).json({ error: true, message: 'User not found' });
//     }

//     const subscriptionEndDate = new Date(userPlan[0].subscriptionEndDate);
//     const currentDate = new Date();

//     // Check if the subscription is expired
//     if (currentDate > subscriptionEndDate) {
//       res.status(400).json({ error: true, message: 'Subscription is expired', isExpired: true });
//     } else {
//       if(userPlan[0].subscriptionPlan == "Silver"){
//         if(totalProducts[0].total < 5){
//           const result = await sequelize.query(
//             'INSERT INTO add_new_productservice (user_id,Title,Description, Type) VALUES (?,?,?,?)',
//             {
//               replacements: [userId, title, description, type],
//               type: QueryTypes.INSERT
//             }
//           );
      
//           if (result && result[0] != null) {
//             const reqId = result[0];
//             if (Array.isArray(images)) {
      
//               for (let index = 0; index < images.length; index++) {
//                 const data = images[index];
//                 await sequelize.query(
//                   'INSERT INTO productservice_photo (	productservice_id, photo) VALUES (?, ?)',
//                   {
//                     replacements: [reqId, data],
//                     type: QueryTypes.INSERT
//                   }
//                 );
//               }
      
//               res.status(200).json({ message: 'product created!', error: false });
//             }
//           } else {
//             res.status(400).json({ message: 'Data not inserted', error: true });
//           }
//         } else {
//           res.status(400).json({ error: true, message: 'Your Plan Limit Has Reached' });
//         }
//       } else {
//         if(totalProducts[0].total < 25){
//           const result = await sequelize.query(
//             'INSERT INTO add_new_productservice (user_id,Title,Description, Type) VALUES (?,?,?,?)',
//             {
//               replacements: [userId, title, description, type],
//               type: QueryTypes.INSERT
//             }
//           );
      
//           if (result && result[0] != null) {
//             const reqId = result[0];
//             if (Array.isArray(images)) {
      
//               for (let index = 0; index < images.length; index++) {
//                 const data = images[index];
//                 await sequelize.query(
//                   'INSERT INTO productservice_photo (	productservice_id, photo) VALUES (?, ?)',
//                   {
//                     replacements: [reqId, data],
//                     type: QueryTypes.INSERT
//                   }
//                 );
//               }
      
//               res.status(200).json({ message: 'product created!', error: false });
//             }
//           } else {
//             res.status(400).json({ message: 'Data not inserted', error: true });
//           }
//         } else {
//           res.status(400).json({ error: true, message: 'Your Plan Limit Has Reached' });
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Error creating product:', error);
//     res.status(500).json({ message: 'Internal server error', error: true });
//   }
// };

const updateProductService = async (req, res) => {
  try {
    const { productId, title, description, images, Type } = req.body;

    // user_id,Title,Description, Type
    // Update the main requirement details
    const updateResult = await sequelize.query(
      'UPDATE add_new_productservice SET Title = ?, Description = ?, Type = ? WHERE id = ?',
      {
        replacements: [title, description, Type, productId],
        type: QueryTypes.UPDATE
      }
    );

    // Check if the update was successful
    // if (updateResult && updateResult[0] != null && updateResult[0].affectedRows > 0) {

      // Update requirement photos if images are provided
      if (Array.isArray(images)) {
        // Delete existing photos for the requirement
        await sequelize.query(
          'DELETE FROM productservice_photo WHERE productservice_id = ?',
          {
            replacements: [productId],
            type: QueryTypes.DELETE
          }
        );

        // Insert new photos for the requirement
        for (let index = 0; index < images.length; index++) {
          const data = images[index];
          await sequelize.query(
            'INSERT INTO productservice_photo (productservice_id, photo) VALUES (?, ?)',
            {
              replacements: [productId, data],
              type: QueryTypes.INSERT
            }
          );
        }
      }

      res.status(200).json({ message: 'updated successfully!', error: false });
    // } else {
    //   res.status(404).json({ message: 'not found or could not be updated', error: true });
    // }
  } catch (error) {
    console.error('Error updating Requirement:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const deleteImageProductService = async (req, res) => {
  try {
    const { imageId } = req.body;

    // Delete the image from the requirment_photo table
    const deleteResult = await sequelize.query(
      'DELETE FROM productservice_photo WHERE id = ?',
      {
        replacements: [imageId],
        type: QueryTypes.DELETE
      }
    );

    // Check if the deletion was successful
    res.status(200).json({ message: 'Image deleted successfully!', error: false });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.body;

    // Delete the image from the requirment_photo table
    const deleteResult = await sequelize.query(
      'DELETE FROM requirment_photo WHERE id = ?',
      {
        replacements: [imageId],
        type: QueryTypes.DELETE
      }
    );

    // Check if the deletion was successful
    res.status(200).json({ message: 'Image deleted successfully!', error: false });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};



const updateRequirement = async (req, res) => {
  try {
    const { requirementId, title, description, images, value } = req.body;


    console.log(req.body);

    // Update the main requirement details
    const updateResult = await sequelize.query(
      'UPDATE add_new_requirement SET Title = ?, Description = ?, value = ? WHERE id = ?',
      {
        replacements: [title, description, value, requirementId],
        type: QueryTypes.UPDATE
      }
    );

    // Check if the update was successful
    // if (updateResult && updateResult[0] != null && updateResult[0].affectedRows > 0) {

      // Update requirement photos if images are provided
      if (Array.isArray(images)) {
        // Delete existing photos for the requirement
        await sequelize.query(
          'DELETE FROM requirment_photo WHERE requirment_id = ?',
          {
            replacements: [requirementId],
            type: QueryTypes.DELETE
          }
        );

        // Insert new photos for the requirement
        for (let index = 0; index < images.length; index++) {
          const data = images[index];
          await sequelize.query(
            'INSERT INTO requirment_photo (requirment_id, photo) VALUES (?, ?)',
            {
              replacements: [requirementId, data],
              type: QueryTypes.INSERT
            }
          );
        }
      }

      res.status(200).json({ message: 'Requirement updated successfully!', error: false });
    // } else {
    //   res.status(404).json({ message: 'Requirement not found or could not be updated', error: true });
    // }
  } catch (error) {
    console.error('Error updating Requirement:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};




// uttam toys app api register user 



const registerUser = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;

    // Validate mobile number
    const mobileNumberRegex = /^[6-9]\d{9}$/;
    if (!mobileNumberRegex.test(phone_number)) {
      console.log("Invalid mobile number");
      return res.status(400).json({ error: true, message: 'Invalid mobile number' });
    }

    // Validate email (basic example, consider using a library for more comprehensive validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email address");
      return res.status(400).json({ error: true, message: 'Invalid email address' });
    }

    // Check if user already exists
    const existingUser = await sequelize.query(
      'SELECT * FROM register WHERE phone_number = ?',
      {
        replacements: [phone_number],
        type: QueryTypes.SELECT
      }
    );

    const existingEmail = await sequelize.query(
      'SELECT * FROM register WHERE email = ?',
      {
        replacements: [email],
        type: QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: true, message: 'Mobile number already registered' });
    }

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: true, message: 'Email address already registered' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const result = await sequelize.query(
      'INSERT INTO register (name, email, phone_number, password) VALUES (?, ?, ?, ?)',
      {
        replacements: [name, email, phone_number, hashedPassword],
        type: QueryTypes.INSERT
      }
    );

    const userId = result[0];

    // Generate and send OTP (implement sendOTP function as needed)
    // await sendOTP(phone_number);

    res.status(200).json({ error: false, message: 'User registered successfully', userId: userId });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const UserLogin = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Query to find the user by phone_number
    const [existingUser] = await sequelize.query('SELECT * FROM register WHERE email = ?',
      { replacements: [phone_number], type: QueryTypes.SELECT });

    if (existingUser) {
      const user = existingUser;

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const token = generateToken(user);
        const userId = user.id;

        return res.status(200).send({ error: false, message: 'Login success!', token: token, userId: userId });
      } else {
        return res.status(401).send({ error: true, message: 'Invalid credentials' });
      }
    } else {
      return res.status(404).send({ error: true, message: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Error in login check api!',
      error
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { phone_number } = req.body;

    const [existingUser] = await sequelize.query('SELECT * FROM register WHERE phone_number = ?',
      { replacements: [phone_number], type: QueryTypes.SELECT });


    if (existingUser) {

      const user = existingUser;

      const token = generateToken(user);
      const userId = user.id;

      return res.status(200).send({ error: false, message: 'Login success!', token: token, userId: userId});
    } else {
      return res.status(404).send({ error: true, message: 'Mobile Number not found! Sign up!' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Error in login check api!',
      error
    });
  }
};

const getHomeData = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming userId is passed as a parameter

    // Fetch categories
    const category = await sequelize.query(
      'SELECT * FROM categories WHERE status = ?',
      {
        replacements: ["0"],
        type: QueryTypes.SELECT
      }
    );

    // Fetch products
    const products = await sequelize.query(
      'SELECT * FROM products WHERE status = ? LIMIT 20',
      {
        replacements: ["0"],
        type: QueryTypes.SELECT
      }
    );

    // Fetch images and check wishlist for each product
    for (const product of products) {
      // Check if the product is in the wishlist
      const wishlistCheck = await sequelize.query(
        'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
        {
          replacements: [userId, product.id],
          type: QueryTypes.SELECT
        }
      );

      // Set isSaved property based on wishlist check
      product.isWishlisted = wishlistCheck.length > 0;

      // Fetch images for the product
      const images = await sequelize.query(
        'SELECT image FROM images WHERE product_id = ? AND type = ?',
        {
          replacements: [product.id, "product"],
          type: QueryTypes.SELECT
        }
      );

      // Map the images to the product
      product.images = images.map(img => img.image);
    }

    // Return the data
    res.status(200).json({
      error: false,
      message: "Data Fetched",
      Category: category,
      FeaturedProduct: products,
      TrendingProduct: products,
      BestSellingProduct: products
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const getProductBySubCategory = async (req, res) => {
  try {
    const { subCategory } = req.body;
    // Fetch products
    const products = await sequelize.query(
      'SELECT * FROM products WHERE sub_category_id = ? AND status = ?',
      {
        replacements: [subCategory,"0"],
        type: QueryTypes.SELECT
      }
    );

    // Fetch images for each product
    for (const product of products) {
      const images = await sequelize.query(
        'SELECT image FROM images WHERE product_id = ? AND type = ?',
        {
          replacements: [product.id, "product"],
          type: QueryTypes.SELECT
        }
      );
      // Map the images to the product
      product.images = images.map(img => img.image); // Use the correct field name
    }

    // Return the data
    res.status(200).json({
      error: false,
      message: "Data Fetch",
      AllProducts: products,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.body;
    // Fetch products
    const products = await sequelize.query(
      'SELECT * FROM products WHERE id = ? AND status = ?',
      {
        replacements: [productId,"0"],
        type: QueryTypes.SELECT
      }
    );

    // Fetch images for each product
    for (const product of products) {
      const images = await sequelize.query(
        'SELECT image FROM images WHERE product_id = ? AND type = ?',
        {
          replacements: [product.id, "product"],
          type: QueryTypes.SELECT
        }
      );
      // Map the images to the product
      product.images = images.map(img => img.image); // Use the correct field name
    }

    // Return the data
    res.status(200).json({
      error: false,
      message: "Data Fetch",
      ProductDetails: products,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const addProductCart = async (req, res) => {
  try {
    const {  product_id, user_id,quantity } = req.body;

    const [existingUserCart] = await sequelize.query('SELECT * FROM cart WHERE product_id = ? AND user_id = ?',
      { replacements: [product_id,user_id], type: QueryTypes.SELECT });


    if (!existingUserCart) {
      const result = await sequelize.query(
        'INSERT INTO cart (product_id, user_id,quantity) VALUES (?,?,?)',
        {
          replacements: [product_id, user_id,quantity],
          type: QueryTypes.INSERT
        }
      );
  
      if (result && result[0] != null) {
        res.status(200).json({ message: 'Product added', error: false });
      } else {
        res.status(400).json({ message: 'Product not added', error: true });
      }
    } else {
      return res.status(404).send({ error: true, message: 'Product already exist in cart!' });
    }
  } catch (error) {
    console.error('Error creating Category:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

// const fetchCartItems = async (req, res) => {
//   try {
//     const { user_id } = req.body;

//     console.log(`Fetching product IDs for user_id: ${user_id}`);

//     // Fetch product IDs for the user from the cart
//     const productIdsResult = await sequelize.query(
//       'SELECT product_id FROM cart WHERE user_id = ?',
//       { replacements: [user_id], type: QueryTypes.SELECT }
//     );

//     // Extract product IDs into an array
//     const productIds = productIdsResult.map(item => item.product_id);

//     // Log the fetched product IDs
//     console.log('Product IDs:', productIds);

//     res.status(200).json({
//       error: false,
//       message: "Product IDs fetched successfully",
//       productIds,
//     });
//   } catch (error) {
//     console.error('Error fetching product IDs:', error);
//     res.status(500).json({ message: 'Internal server error', error: true });
//   }
// };


// const fetchCartItems = async (req, res) => {
//   try {
//     const { user_id } = req.body;

//     console.log(`Fetching cart items for user_id: ${user_id}`);

//     // Fetch cart items for the user
//     const UserCartResult = await sequelize.query(
//       'SELECT * FROM cart WHERE user_id = ?',
//       { replacements: [user_id], type: QueryTypes.SELECT }
//     );

//     // Ensure UserCart is always an array
//     const UserCart = Array.isArray(UserCartResult) ? UserCartResult : [UserCartResult];

//     // Log the fetched cart items
//     console.log('UserCart:', UserCart);

//     if (UserCart.length === 0) {
//       return res.status(200).json({
//         error: false,
//         message: "No items in the cart",
//         CartDetails: [],
//       });
//     }

//     // Fetch all products in parallel
//     const productPromises = UserCart.map(async (cart) => {
//       const productResult = await sequelize.query(
//         'SELECT * FROM products WHERE id = ?',
//         {
//           replacements: [cart.product_id],
//           type: QueryTypes.SELECT
//         }
//       );

//       for (const product of productResult) {
//         const images = await sequelize.query(
//           'SELECT image FROM images WHERE product_id = ? AND type = ?',
//           {
//             replacements: [product.id, "product"],
//             type: QueryTypes.SELECT
//           }
//         );
//         // Map the images to the product
//         product.images = images.map(img => img.image); // Use the correct field name
//       }

//       // Ensure products is always an array
//       const products = Array.isArray(productResult) ? productResult : [productResult];

//       // Log the fetched products for each cart item
//       console.log(`Products for cart item ${cart.product_id}:`, products);

//       cart.products = products;
//       return cart;
//     });

//     const updatedCart = await Promise.all(productPromises);

//     // Return the updated cart details
//     res.status(200).json({
//       error: false,
//       message: "Data Fetch",
//       CartDetails: updatedCart,
//     });
//   } catch (error) {
//     console.error('Error fetching cart items:', error);
//     res.status(500).json({ message: 'Internal server error', error: true });
//   }
// };


const fetchCartItems = async (req, res) => {
  try {
    const { user_id } = req.body; 

    console.log(`Fetching cart items for user_id: ${user_id}`);

    // Fetch cart items for the user
    const UserCartResult = await sequelize.query(
      'SELECT * FROM cart WHERE user_id = ?',
      { replacements: [user_id], type: QueryTypes.SELECT }
    );

    // Ensure UserCart is always an array
    const UserCart = Array.isArray(UserCartResult) ? UserCartResult : [UserCartResult];

    // Log the fetched cart items
    console.log('UserCart:', UserCart);

    if (UserCart.length === 0) {
      return res.status(200).json({
        error: false,
        message: "No items in the cart",
        CartDetails: [],
      });
    }

    // WooCommerce API credentials
    const wooUsername = 'ck_56ffdaea4a26ffc13bdde4c637ff9efc42f7719e';
    const wooPassword = 'cs_461b129731f4b0235ee4400bd9829168c7d89b32';
    const wooBaseUrl = 'https://www.uttamtoys.com/wp-json/wc/v3/products';

    // Fetch all products in parallel from WooCommerce API
    const productPromises = UserCart.map(async (cart) => {
      const productResponse = await axios.get(`${wooBaseUrl}/${cart.product_id}`, {
        auth: {
          username: wooUsername,
          password: wooPassword
        }
      });

      // Return the product details
      return productResponse.data;
    });

    const products = await Promise.all(productPromises);
    console.log('products:', products);

    // Combine products with the UserCart items
    const updatedUserCart = UserCart.map((cartItem, index) => {
      return {
        ...cartItem,
        product: products[index]
      };
    });

    // Return the updated cart details
    res.status(200).json({
      error: false,
      message: "Data Fetch",
      UserCart: updatedUserCart,
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};




const createCategory = async (req, res) => {
  try {
    const {  title, images } = req.body;
    const result = await sequelize.query(
      'INSERT INTO categories (name, image) VALUES (?,?)',
      {
        replacements: [title, images],
        type: QueryTypes.INSERT
      }
    );

    console.log(req.body);

    if (result && result[0] != null) {

      res.status(200).json({ message: 'Category created!', error: false });

    } else {
      res.status(400).json({ message: 'Data not inserted', error: true });
    }
    
  } catch (error) {
    console.error('Error creating Category:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};




const getAllCategories = async (req, res) => {
  try {
    const categories = await sequelize.query(
      'SELECT * FROM categories',
      {
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json({ error: false, message: 'Categories fetched successfully', categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};

const createSubCategory = async (req, res) => {
  try {
    const { category, title, images } = req.body;
    const result = await sequelize.query(
      'INSERT INTO subcategories (name, image, categoryName) VALUES (?,?,?)',
      {
        replacements: [title, images, category],
        type: QueryTypes.INSERT
      }
    );

    console.log(req.body);

    if (result && result[0] != null) {

      res.status(200).json({ message: 'Sub Category created!', error: false });

    } else {
      res.status(400).json({ message: 'Data not inserted', error: true });
    }
    
  } catch (error) {
    console.error('Error creating Sub Category:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const fetchSubCategories = async (req, res) => {
  try {
    const result = await sequelize.query(
      'SELECT * FROM subcategories',
      {
        type: QueryTypes.SELECT
      }
    );

    if (result.length > 0) {
      res.status(200).json({ subcategories: result, error: false });
    } else {
      res.status(404).json({ message: 'No subcategories found', error: true });
    }
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const createAge = async (req, res) => {
  try {
    const {  title, images } = req.body;
    const result = await sequelize.query(
      'INSERT INTO age (age) VALUES (?)',
      {
        replacements: [title],
        type: QueryTypes.INSERT
      }
    );

    console.log(req.body);

    if (result && result[0] != null) {

      res.status(200).json({ message: 'Age created!', error: false });

    } else {
      res.status(400).json({ message: 'Data not inserted', error: true });
    }
    
  } catch (error) {
    console.error('Error creating age:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const createBarand = async (req, res) => {
  try {
    const {  title, images } = req.body;
    const result = await sequelize.query(
      'INSERT INTO brands (name, image) VALUES (?,?)',
      {
        replacements: [title, images],
        type: QueryTypes.INSERT
      }
    );

    console.log(req.body);

    if (result && result[0] != null) {

      res.status(200).json({ message: 'Brand created!', error: false });

    } else {
      res.status(400).json({ message: 'Data not inserted', error: true });
    }
    
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const getAllAge = async (req, res) => {
  try {
    const age = await sequelize.query(
      'SELECT * FROM age',
      {
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json({ error: false, message: 'Age fetched successfully', age });
  } catch (error) {
    console.error('Error fetching age:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};
const getAllBrand = async (req, res) => {
  try {
    const brand = await sequelize.query(
      'SELECT * FROM brands',
      {
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json({ error: false, message: 'Brand fetched successfully', brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
};


const createProduct = async (req, res) => {
  try {
    const { name, category_id, sub_category_id,brand_id,description_short,description_long,main_price,discount_price,quantity,sku,tax_value,tags,age, images } = req.body;
    const result = await sequelize.query(
      'INSERT INTO products (name,category_id,sub_category_id, brand_id,description_short,description_long,main_price,discount_price,quantity,sku,tax_value,tags,age,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      {
        replacements: [name, category_id, sub_category_id,brand_id,description_short,description_long,main_price,discount_price,quantity,sku,tax_value,tags,age, "0"],
        type: QueryTypes.INSERT
      }
    );

    if (result && result[0] != null) {
      const reqId = result[0];
      if (Array.isArray(images)) {

        for (let index = 0; index < images.length; index++) {
          const data = images[index];
          await sequelize.query(
            'INSERT INTO images (image, product_id, type) VALUES (?, ?, ?)',
            {
              replacements: [ data, reqId, 'product'],
              type: QueryTypes.INSERT
            }
          );
        }

        res.status(200).json({ message: 'Product created!', error: false });
      }
    } else {
      res.status(400).json({ message: 'Data not inserted', error: true });
    }
  } catch (error) {
    console.error('Error creating Product:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const getProduct = async (req, res) => {
  try {
    const result = await sequelize.query(
      'SELECT * FROM products',
      {
        type: QueryTypes.SELECT
      }
    );

    if (result.length > 0) {
      res.status(200).json({ subcategories: result, error: false });
    } else {
      res.status(404).json({ message: 'No products found', error: true });
    }
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const getSubCategories = async (req, res) => {
  const {  title } = req.body;
  try {
    const result = await sequelize.query(
      'SELECT * FROM subcategories WHERE categoryName = ?',
      {
        replacements: [title],
        type: QueryTypes.SELECT
      }
    );

    if (result.length > 0) {
      res.status(200).json({ subcategories: result, error: false });
    } else {
      res.status(404).json({ message: 'No subcategories found', error: true });
    }
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const fetchSaveItems = async (req, res) => {
  try {
    const { user_id } = req.body; 

    console.log(`Fetching Save items for user_id: ${user_id}`);

    // Fetch cart items for the user
    const UserCartResult = await sequelize.query(
      'SELECT * FROM wishlist WHERE user_id = ?',
      { replacements: [user_id], type: QueryTypes.SELECT }
    );

    // Ensure UserCart is always an array
    const UserCart = Array.isArray(UserCartResult) ? UserCartResult : [UserCartResult];

    // Log the fetched cart items
    console.log('UserSave:', UserCart);

    if (UserCart.length === 0) {
      return res.status(200).json({
        error: false,
        message: "No items in the cart",
        CartDetails: [],
      });
    }

    // WooCommerce API credentials
    const wooUsername = 'ck_56ffdaea4a26ffc13bdde4c637ff9efc42f7719e';
    const wooPassword = 'cs_461b129731f4b0235ee4400bd9829168c7d89b32';
    const wooBaseUrl = 'https://www.uttamtoys.com/wp-json/wc/v3/products';

    // Fetch all products in parallel from WooCommerce API
    const productPromises = UserCart.map(async (cart) => {
      const productResponse = await axios.get(`${wooBaseUrl}/${cart.product_id}`, {
        auth: {
          username: wooUsername,
          password: wooPassword
        }
      });

      // Return the product details
      return productResponse.data;
    });

    const products = await Promise.all(productPromises);
    console.log('products:', products);

    // Combine products with the UserCart items
    const updatedUserCart = UserCart.map((cartItem, index) => {
      return {
        ...cartItem,
        product: products[index]
      };
    });

    // Return the updated cart details
    res.status(200).json({
      error: false,
      message: "Data Fetch",
      UserCart: updatedUserCart,
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const saveProduct = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check if the requirement is already saved by the user
    const existingSave = await sequelize.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      {
        replacements: [userId, productId],
        type: QueryTypes.SELECT
      }
    );

    if (existingSave.length > 0) {
      // If the requirement is already saved, delete it
      const deleteResult = await sequelize.query(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        {
          replacements: [userId, productId],
          type: QueryTypes.DELETE
        }
      );


      console.log("hello");


      // Check if rows were actually affected
      return res.status(200).json({ message: 'product unsaved successfully', error: false });
    } else {
      // If the requirement is not saved, insert it
      const result = await sequelize.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
        {
          replacements: [userId, productId],
          type: QueryTypes.INSERT
        }
      );

      if (result && result[0] !== undefined) {
        return res.status(200).json({ message: 'product saved successfully', error: false });
      } else {
        return res.status(400).json({ message: 'Failed to save product', error: true });
      }
    }
  } catch (error) {
    console.error('Error saving product:', error);
    return res.status(500).json({ message: 'Internal server error', error: true });
  }
};



const addUserAddress = async (req, res) => {
  try {
    const { address_line_1, address_line_2,state,city,pincode,landmark,user_id,type,mobile } = req.body;
    console.log(req.body);
    const [existingUserAddress] = await sequelize.query('SELECT * FROM address WHERE user_id = ? AND type = ?',
      { replacements: [user_id,type], type: QueryTypes.SELECT });
    if (!existingUserAddress) {
      const result = await sequelize.query(
        'INSERT INTO address (address_line_1, address_line_2,state,city,pincode,landmark,user_id,type,mobile) VALUES (?,?,?,?,?,?,?,?,?)',
        {
          replacements: [address_line_1, address_line_2,state,city,pincode,landmark,user_id,type,mobile],
          type: QueryTypes.INSERT
        }
      );
  
      if (result && result[0] != null) {
        res.status(200).json({ message: 'Address added', error: false });
      } else {
        res.status(400).json({ message: 'Address not added', error: true });
      }
    } else {
      const result = await sequelize.query(
        'UPDATE address SET address_line_1 = ?,address_line_2 = ?,state = ?,city = ?,pincode = ?,landmark = ?,mobile = ? WHERE user_id = ? AND type = ?',
        {
          replacements: [address_line_1, address_line_2,state,city,pincode,landmark,mobile,user_id,type],
          type: QueryTypes.UPDATE
        }
      );
      console.log(result);
      res.status(200).json({ message: 'Address update', error: false });
    }
    
  } catch (error) {
    console.error('Error creating Category:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const fetchUserAddress = async (req, res) => {
  try {
    const { userId,type } = req.body;
    // Fetch products
    const address = await sequelize.query(
      'SELECT * FROM address WHERE user_id = ? AND type = ?',
      {
        replacements: [userId,type],
        type: QueryTypes.SELECT
      }
    );
    // Return the data
    res.status(200).json({
      error: false,
      message: "Data Fetch",
      addressDetails: address,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const fetchUserAllAddress = async (req, res) => {
  try {
    const { userId } = req.body;
    // Fetch products
    const address = await sequelize.query(
      'SELECT * FROM address WHERE user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT
      }
    );
    // Return the data
    res.status(200).json({
      error: false,
      message: "Data Fetch",
      addressDetails: address,
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const createOrder = async (req, res) => {
  try {
    const {  userId, addressId,paymentType,transactionId,amount } = req.body;
    const result = await sequelize.query(
      'INSERT INTO user_order (user_id, address_id,payment_type,transaction_id,amount) VALUES (?,?,?,?,?)',
      {
        replacements: [userId, addressId,paymentType,transactionId,amount],
        type: QueryTypes.INSERT
      }
    );
    console.log(req.body);
    console.log(result[0]);
    if (result && result[0] != null) {
      const insertedId = result[0];
      const resultUpdate = await sequelize.query(
        'UPDATE cart SET order_id = ?,status = ? WHERE user_id = ? AND status = ?',
        {
          replacements: [insertedId, '0',userId,'1'],
          type: QueryTypes.UPDATE
        }
      );
  
      res.status(200).json({ message: 'Order created!', error: false });
    } else {
      res.status(400).json({ message: 'Order not create', error: true });
    }
    
  } catch (error) {
    console.error('Error creating Category:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};

const updateProductCart = async (req, res) => {
  try {
    const { cart_id,quantity } = req.body;
    const result = await sequelize.query(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      {
        replacements: [quantity, cart_id],
        type: QueryTypes.UPDATE
      }
    );
    res.status(200).json({ message: 'Cart update', error: false });
  } catch (error) {
    console.error('Error creating Category:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const deleteProductCart = async (req, res) => {
  try {
    const { cartId } = req.body;
    if (!cartId) {
      return res.status(400).json({ message: 'Cart ID is required', error: true });
    }
    const result = await sequelize.query(
      'DELETE FROM cart WHERE id = ?',
      {
        replacements: [cartId],
        type: QueryTypes.DELETE,
      }
    );
    res.status(200).json({ message: 'Item deleted successfully', error: false });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const fetchProductDetails = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required', error: true });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const title = await page.$eval('#productTitle', el => el.textContent.trim()).catch(() => null);

    // Try different selectors for the price element
    const priceSelectors = ['#priceblock_ourprice', '#priceblock_dealprice', '.a-price .a-offscreen'];
    let main_price = null;
    for (let selector of priceSelectors) {
      try {
        main_price = await page.$eval(selector, el => el.textContent.trim());
        if (main_price) break;
      } catch (error) {
        main_price = null;
      }
    }

    // Example selectors for technical details
    const technicalDetails = {
      technicalDetail: await page.$eval('#productDetails_techSpec_section_1', el => el.textContent.trim()).catch(() => null),
      // Add more properties as needed
    };

    // Example selectors, need to be adjusted based on the actual website structure
    const category_id = await page.$eval('#category_id', el => el.textContent.trim()).catch(() => null);
    const sub_category_id = await page.$eval('#sub_category_id', el => el.textContent.trim()).catch(() => null);
    const brand_id = await page.$eval('#bylineInfo', el => el.textContent.trim()).catch(() => null);
    const description_short = await page.$eval('#productDescription p span', el => el.textContent.trim()).catch(() => null);
    const description_long = await page.$eval('#feature-bullets', el => el.textContent.trim()).catch(() => null);
    const discount_price = await page.$eval('#discount_price', el => el.textContent.trim()).catch(() => null);
    const sku = await page.$eval('#sku', el => el.textContent.trim()).catch(() => null);
    const tax_value = await page.$eval('#tax_value', el => el.textContent.trim()).catch(() => null);
    const tags = await page.$$eval('.tags', el => el.map(tag => tag.textContent.trim())).catch(() => null);
    const age = await page.$eval('#age', el => el.textContent.trim()).catch(() => null);

    const images = await page.$$eval('#altImages img', imgs => imgs.map(img => img.src)).catch(() => null);

    await browser.close();

    res.status(200).json({ 
      product: { 
        title, 
        category_id,
        sub_category_id,
        brand_id,
        description_short,
        description_long,
        main_price,
        discount_price,
        sku,
        tax_value,
        tags,
        age,
        images,
        ...technicalDetails  // Include technical details in the response
      }, 
      error: false 
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};


const deleteProductFromCart = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required', error: true });
    }
    const result = await sequelize.query(
      'DELETE FROM cart WHERE user_id = ?',
      {
        replacements: [userId],
        type: QueryTypes.DELETE,
      }
    );
    res.status(200).json({ message: 'Item deleted successfully', error: false });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    res.status(500).json({ message: 'Internal server error', error: true });
  }
};
const API_KEY = '4726e653687b45d4904086ab3484c1ee';

const fetchStockData = async (req, res) => {
  try {
    const { stockName } = req.body;

    if (!stockName) {
      return res.status(400).json({ message: 'Stock name is required', error: true });
    }

    // Search for stock symbol
    const searchURL = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${API_KEY}`;
    const searchResponse = await axios.get(searchURL);
    const matches = searchResponse.data.bestMatches.filter(stock => stock['4. region'].toLowerCase().includes('india'));

    if (matches.length === 0) {
      return res.status(404).json({ message: 'Indian stock not found', error: true });
    }

    const stockSymbol = matches[0]['1. symbol'];

    // Fetch technical indicators
    const technicalURL = `https://www.alphavantage.co/query?function=SMA&symbol=${stockSymbol}&interval=daily&time_period=10&series_type=close&apikey=${API_KEY}`;
    const technicalResponse = await axios.get(technicalURL);

    // Fetch income statement
    const incomeURL = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${stockSymbol}&apikey=${API_KEY}`;
    const incomeResponse = await axios.get(incomeURL);

    // Fetch balance sheet
    const balanceSheetURL = `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${stockSymbol}&apikey=${API_KEY}`;
    const balanceSheetResponse = await axios.get(balanceSheetURL);

    // Fetch cash flow
    const cashFlowURL = `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${stockSymbol}&apikey=${API_KEY}`;
    const cashFlowResponse = await axios.get(cashFlowURL);

    return res.status(200).json({
      technical: technicalResponse.data,
      income: incomeResponse.data,
      balanceSheet: balanceSheetResponse.data,
      cashFlow: cashFlowResponse.data,
      error: false
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return res.status(500).json({ message: 'Internal server error', error: true });
  }
};

module.exports = {
  registerUser,
  fetchStockData,
  getMessagesSenderRoom,
  createAge,
  createBarand,
  getSubCategories,
  getAllAge,
  getAllBrand,
  getAllCategories,
  createSubCategory,
  fetchSubCategories,
  getProduct,
  sendMessageRoom,
  sendMessage,
  getMessages,
  getMessagesRoom,
  updateGroupName,
  updateUserProfile,
  createCategory,
  updateUserPersonalProfile,
  updateUserName,
  loginUser,
  UserLogin,
  getAllUsersIfFollow,
  deleteImageProductService,
  updateRequirement,
  updateUserType,
  createUserProfile,
  createBusinessProfile,
  createStory,
  createRoom,
  findRoomByUserId,
  getUserProfile,
  getImage,
  OTPVerify,
  sendPasswordOTP,
  deleteImage,
  OTPVerifyEmail,
  updatepassword,
  createRequirement,
  getAllUsers,
  getAllUserRequirements,
  getPersonalProfile,
  getBusinessProfile,
  sendFollowRequest,
  getFollowRequest,
  updateRequestStatus,
  updateProductService,
  getFollowAllUsers,
  fetchProductDetails,
  getAllUserRequirementsUserFollo,
  createProduct,
  getAllUserPrductService,
  deleteRequirement,
  fetchUsersTotalCountAll,
  updateBusinessProfile,
  saveProduct,
  updateRequirementStatus,
  clickSellIt,
  getClickSellIt,
  loginUserAdmin,
  fetchUsersForAdmin,
  fetchUserRequirements,
  fetchUserProfile,
  fetchRequirementDetails,
  fetchUserRequirementsLetter,
  fetchUsersForAdminPersonal,
  fetchTopUsersWithCompletedRequirements,
  updateUserToken,
  getUserToken,
  updateUserSubscription,
  getUserStory,
  getRoomUserToken,
  markMessagesAsSeen,
  getSavedRequirements,
  getUserPlan,
  verifyBusinessProfile,
  verifyStory,
  getUserStorybyId,
  getHomeData,
  getProductBySubCategory,
  getProductDetails,
  addProductCart,
  fetchCartItems,
  fetchSaveItems,
  updateProductCart,
  deleteProductCart,
  addUserAddress,
  fetchUserAddress,
  fetchUserAllAddress,
  createOrder,
  deleteProductFromCart
};