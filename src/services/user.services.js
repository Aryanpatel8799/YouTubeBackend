import userModel from '../models/user.models.js';

const createUser = async (userName,fullName,email,password,avatar,coverImage) => {

    const user = await userModel.create({
        userName,
        fullName,
        email,
        password,
        avatar,
        coverImage
    })

    return user;
}

export {createUser};