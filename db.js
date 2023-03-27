import mongoose from 'mongoose'

mongoose.Promise = global.Promise;
// require("dotenv").config()

export const connect = () => {
    mongoose.connect(
        "mongodb+srv://admin:lIvSBTuy77TkPI2R@cluster0.wlgq8.mongodb.net/test",
        {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
    ).then(() => { console.log("db connected") })
        .catch((err) => { console.log(err) }
        )
};