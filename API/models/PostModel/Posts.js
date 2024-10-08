import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Favorite from "../FavoriteModel/Favorite.js";
import User from "../UserModel/User.js";
import Like from "../LikeModel/Likes.js";

const postSchema = new mongoose.Schema(
  {
    companyObjId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    }, // Referência ao companyelecimento ao qual o post pertence.
    content: { type: String, required: true }, // O conteúdo do post (texto).
    mediaUrl: { type: String }, // URL de mídia (imagens, vídeos, etc.)
    eventType: { type: String }, // Tipo de evento (pode ser usado para filtrar por tipo)
    tags: { type: [String], default: [] }, // Lista de tags para categorizar o post (ex: #Evento, #Promoção)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }], // Referência aos likes associados a este post
    likesCount: { type: Number, default: 0 },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Favorite" }], // Referência aos likes associados a este post
    favoritesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 }, // Contador de visualizações do post
    cityName: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    streetName: { type: String, default: "" },
    number: { type: String, default: "" },
    eventStartDate: { type: Date },
    eventStartTime: { type: String },
    eventEndTime: { type: String },
    isRecurring: { type: Boolean, default: false }, // Evento que se repete sempre
    comments: [
      {
        userObjId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referência ao modelo de usuário, se aplicável
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.plugin(mongoosePaginate);

const Post = mongoose.model("Post", postSchema);

export default Post;
