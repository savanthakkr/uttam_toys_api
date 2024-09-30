const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require("../middlewares/roleMiddleware");

const {createAge,
    getSubCategories,
    createBarand,
    getAllAge,
    fetchProductDetails,
    fetchStockData,
    getAllBrand,
    fetchSaveItems,
    getProduct,UserLogin,addUserAddress,fetchUserAddress,fetchUserAllAddress,createOrder,updateProductCart,deleteProductCart,deleteProductFromCart,
    fetchSubCategories,createSubCategory,getAllCategories,createCategory, deleteImageProductService ,deleteImage ,updateProductService, updateRequirement,updateUserName, updateGroupName, updateUserPersonalProfile, getUserPlan, verifyBusinessProfile, verifyStory, fetchTopUsersWithCompletedRequirements, fetchUsersTotalCountAll, updateUserSubscription,getUserStory,createStory,fetchUserProfile, fetchUserRequirementsLetter, fetchUsersForAdminPersonal, getSavedRequirements, markMessagesAsSeen, updateUserToken,
    getUserToken,getUserStorybyId,getHomeData,getProductBySubCategory,getProductDetails,addProductCart,fetchCartItems,
    getRoomUserToken,fetchRequirementDetails,fetchUserRequirements, fetchUsersForAdmin, loginUserAdmin, getClickSellIt,saveProduct,clickSellIt, getMessages, sendMessage, registerUser,updateUserProfile, loginUser,updateUserType,createUserProfile,createBusinessProfile,sendMessageRoom,getMessagesSenderRoom,getMessagesRoom, findRoomByUserId, getUserProfile, getImage, OTPVerify,createRoom, sendPasswordOTP, OTPVerifyEmail, updatepassword,createRequirement,
    getAllUsers,getAllUserRequirementsUserFollo,getAllUsersIfFollow,getAllUserRequirements,getPersonalProfile,getBusinessProfile,sendFollowRequest,getFollowRequest,updateRequestStatus,getFollowAllUsers,
    createProduct,getAllUserPrductService,deleteRequirement,updateBusinessProfile,updateRequirementStatus } = userController; 

// admin api 

router.post('/users/loginUserAdmin', loginUserAdmin);
router.post('/users/fetchStockData', fetchStockData);
router.post('/users/fetchProductDetails', fetchProductDetails);
router.post('/users/createAge', createAge);
router.post('/users/deleteProductFromCart', deleteProductFromCart);
router.post('/users/getSubCategories', getSubCategories);
router.post('/users/createBarand', createBarand);
router.get('/users/getAllAge', getAllAge);
router.get('/users/getAllBrand', getAllBrand);
router.get('/users/fetchSubCategories', fetchSubCategories);
router.post('/users/updateProductCart', updateProductCart);
router.post('/users/deleteProductCart', deleteProductCart);
router.post('/users/addUserAddress', addUserAddress);
router.post('/users/fetchUserAddress', fetchUserAddress);
router.post('/users/fetchUserAllAddress', fetchUserAllAddress);
router.post('/users/createOrder', createOrder);
router.get('/users/getProduct', getProduct);
router.get('/users/getAllCategories', getAllCategories);
router.post('/users/getHomeData', getHomeData);
router.post('/users/getProductBySubCategory', getProductBySubCategory);
router.post('/users/getProductDetails', getProductDetails);
router.post('/users/addProductCart', addProductCart);
router.post('/users/fetchCartItems', fetchCartItems);
router.post('/users/fetchSaveItems', fetchSaveItems);

router.get('/users/fetchUsersForAdmin', fetchUsersForAdmin);
router.get('/users/fetchTopUsersWithCompletedRequirements', fetchTopUsersWithCompletedRequirements);
router.get('/users/fetchUsersTotalCountAll', fetchUsersTotalCountAll);
router.post('/users/getUserStory', getUserStory);
router.post('/users/deleteImage', deleteImage);
router.post('/users/createSubCategory', createSubCategory);
router.post('/users/createCategory', createCategory);
router.post('/users/deleteImageProductService', deleteImageProductService);
router.post('/users/updateProductService', updateProductService);
router.post('/users/updateUserName', updateUserName);
router.post('/users/updateRequirement', updateRequirement);
router.post('/users/updateUserPersonalProfile', updateUserPersonalProfile);
router.post('/users/getUserPlan', getUserPlan);
router.post('/users/updateGroupName', updateGroupName);
router.post('/users/verifyBusinessProfile', verifyBusinessProfile);
router.post('/users/verifyStory', verifyStory);
router.post('/users/fetchUserRequirements', fetchUserRequirements);
router.post('/users/createStory', createStory);
router.post('/users/fetchUserProfile', fetchUserProfile);
router.post('/users/fetchUserRequirementsLetter', fetchUserRequirementsLetter);
router.post('/users/fetchRequirementDetails', fetchRequirementDetails);
router.post('/users/getUserStorybyId', getUserStorybyId);
router.get('/users/fetchUsersForAdminPersonal', fetchUsersForAdminPersonal);

// Register a new user
router.post('/users/register', registerUser);
router.post('/users/updateUserSubscription', updateUserSubscription);
router.post('/users/getSavedRequirements', getSavedRequirements);
router.post('/users/passwordOTP', sendPasswordOTP);
router.post('/users/updateToken', updateUserToken);
router.post('/users/markMessagesAsSeen', markMessagesAsSeen);
router.post('/users/getToken', getUserToken);
router.post('/users/getRoomToken', getRoomUserToken);

router.post('/users/sendMessage', sendMessage);
router.post('/users/getMessages', getMessages);
router.post('/users/saveProduct', saveProduct);
router.post('/users/clickSellIt', clickSellIt);
router.post('/users/getClickSellIt', getClickSellIt);
router.post('/users/sendMessageRoom', sendMessageRoom);

router.post('/users/otpEmail', OTPVerifyEmail);

router.post('/users/otp', OTPVerify);

// Login
router.post('/users/login', loginUser);
router.post('/users/userlogin', UserLogin);

router.post('/users/updateType', updateUserType);
router.post('/users/createProfile', createUserProfile);
router.post('/users/createBusinessProfile', createBusinessProfile);
router.post('/users/createRequirement', createRequirement);
router.post('/users/fetchAllUsers', getAllUsers);
router.post('/users/getAllUsersIfFollow', getAllUsersIfFollow);
router.post('/users/fetchAllUserRequirments', getAllUserRequirements);
router.post('/users/fetchAllUserRequirementsUserFollo', getAllUserRequirementsUserFollo);
router.post('/users/fetchPersonalProfile', getPersonalProfile);
router.post('/users/fetchBusinessProfile', getBusinessProfile);
router.post('/users/sendFollowRequest', sendFollowRequest);
router.post('/users/getFollowRequest', getFollowRequest);
router.post('/users/updateRequestStatus', updateRequestStatus);
router.post('/users/getFollowAllUsers', getFollowAllUsers);
router.post('/users/createProduct', createProduct);
router.post('/users/getAllUserPrductService', getAllUserPrductService);
router.post('/users/deleteRequirement', deleteRequirement);
router.post('/users/updateBusinessProfile', updateBusinessProfile);
router.post('/users/updateRequirementStatus', updateRequirementStatus);

// chat routs SBO

router.post('/users/createRoom', createRoom);
router.post('/users/findRoomByUserId', findRoomByUserId);


// Get user profile by id
router.get('/users/profile',verifyToken, getUserProfile);

router.get('/getMessagesSenderRoom/:id',verifyToken, getMessagesSenderRoom);

router.post('/users/getMessagesRoom', getMessagesRoom);

router.get('/findRoomByUserId/:id',verifyToken, findRoomByUserId);

// Update user profile 
router.put('/users/editProfile/:id',verifyToken, getImage); 

router.put('/users/editProfile',verifyToken, updateUserProfile); 


router.put('/users/updatePass',verifyToken, updatepassword); 

module.exports = router;
