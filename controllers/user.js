const userServices = require('../services/user');
const fs = require('fs');

const uploadedImage = async (base64Image, fileNameConst) => {
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
      
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image string');
    }
    
    const fileFormat = matches[1];
    const base64Data = matches[2];
    
    // Remove the data:image/png;base64 part
    const dataBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const fileName = `${fileNameConst}_${Date.now()}.${fileFormat}`;
    
    const filePath = `uploads/${fileName}`;
    
    // Save the image to the "uploads" folder
    fs.writeFile(filePath, dataBuffer, (err) => {
        if (err) {
        console.error(err);
        throw new Error('Error uploading image');
        } else {
        console.log('Image uploaded successfully');
        }
    });
    
    return fileName;
}

const deleteImage = async (fileName) => {
    const filePath = `uploads/${fileName}`;
  
    // Delete the image file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error deleting image');
      } else {
        console.log('Image deleted successfully');
      }
    });
}

module.exports = {
    userRegistration: async (req, res, next) => {
        try {
            const params = req.body;

            if (!params.email) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User email is required' });
            }

            if (!params.countryCode) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Country code is required' });
            }

            if (!params.number) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mobile number is required' });
            }

            let checkExistUserWithEmail = await userServices.getUserByEmail(params.email);

            if (checkExistUserWithEmail.length) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User already exist with this email' });
            }

            let checkExistUser = await userServices.getUserByMobileNumber(params);


            if (checkExistUser.length) {
                return res.status(400).json({ 
                    IsSuccess: false, Data: [], Message: 'User already exist with this contact information'
                });
            }

            const addUser = await userServices.registerUser(params);

            if (addUser) {
                return res.status(200).json({ IsSuccess: true, Data: [addUser], Message: 'User registered successfully' });
            } else {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'User not registered' });
            }    
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    signInUser: async (req, res, next) => {
        try {
            const params = req.query;

            if (!params.countryCode) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Country code is required' });
            }

            if (!params.number) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Mobile number is required' });
            }

            let checkExistUser = await userServices.getUserByMobileNumber(params);

            if (checkExistUser.length === 1) {
                const userId = checkExistUser[0]._id;
                let token = await userServices.createUserToken(userId);
                if (token) {
                    return res.status(200).json({ IsSuccess: true, Data: checkExistUser, token, Message: 'User logged In...!!!' });
                } else {
                    return res.status(400).json({ IsSuccess: true, Data: [], Message: 'Token not created' });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: checkExistUser, token, Message: 'User not found' });
            }
            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    editUserProfile: async (req, res, next) => {
        try {
            const params = req.body;

            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            params.userId = user._id;

            let editProfile = await userServices.updateUserProfileInformation(params);

            if (editProfile) {
                return res.status(200).json({ IsSuccess: true, Data: editProfile, Message: 'User Profile Updated' });
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'User Profile Not Updated' });
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            let users = await userServices.getAllUsers();

            if (users.length) {
                return res.status(200).json({ IsSuccess: true, Count: users.length, Data: users, Message: 'All users found' }); 
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'No users found' }); 
            }
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },
    
    userVerification: async (req, res, next) => {
        try {
            const params = req.body;
            const user = req.user;

            if (!user) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide valid authrized token' });
            }

            params.userId = user._id;

            if (!params.dl_front_image) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide DL Front image (dl_front_image)' });
            }

            if (!params.dl_back_image) {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide DL Back image (dl_back_image)' });
            }

            if (params.isVerify === undefined || params.isVerify === null || params.isVerify === '') {
                return res.status(400).json({ IsSuccess: false, Data: [], Message: 'Please provide isVerify boolean parameter' });
            }

            let addDLFront = await uploadedImage(params.dl_front_image, user.firstName);
            let addDLBack = await uploadedImage(params.dl_back_image, user.firstName);

            if (addDLFront && addDLBack) {
                params.dl_front_image = addDLFront;
                params.dl_back_image = addDLBack;
                let verifyUser = await userServices.verifyUserLicence(params);

                if (verifyUser) {
                    return res.status(200).json({ IsSuccess: true, Data: [verifyUser], Message: 'User licence details updatded' });
                } else {
                    if (addDLFront) {
                        await deleteImage(addDLFront);
                    }

                    if (addDLBack) {
                        await deleteImage(addDLBack);
                    }
                    return res.status(400).json({ IsSuccess: true, Data: [], Message: 'User licence details not updatded' });
                }
            } else {
                return res.status(400).json({ IsSuccess: true, Data: [], Message: 'User licence image not uploaded' });
            }

        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    },

    dscds: async (req, res, next) => {
        try {
            
        } catch (error) {
            return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message });
        }
    }
}