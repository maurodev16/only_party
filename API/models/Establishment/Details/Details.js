import mongoose from "mongoose";
import Follower from "../../Followers.js";
import dotenv from 'dotenv';
dotenv.config();
const detailsSchema = new mongoose.Schema({
    logoUrl: { type: String, default: "" },
    stateName: { type: String, default: "" },
    cityName: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    streetName: { type: String, default: "" },
    number: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follower", default: [] }],
    followersCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },

},
    {
        discriminatorKey: 'companyType', _id: false
    });


const Details = mongoose.model('Details', detailsSchema);

export default Details;
