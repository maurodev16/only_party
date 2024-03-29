import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment/Establishment.js";
import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Post from "../../models/Posts.js";
import BarDetails from "../../models/Establishment/Details/BarDetail.js"
import ClubDetails from "../../models/Establishment/Details/ClubDetail.js"
import KioskDetails from "../../models/Establishment/Details/KioskDetail.js"
import PromoterDetails from "../../models/Establishment/Details/PromoterDetail.js"
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import CityAndCountry from "../../models/CityAndCountry.js";
import logoMiddleware from "../../middleware/logoMiddleware.js";
import configureCloudinary from "../../services/Cloudinary/cloudinary_config.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
configureCloudinary();
const router = Router();

router.post("/signup-establishment", logoMiddleware.single("file"),async (req, res) => {
  const file = req.file; // Imagem enviada na solicitação
  try {
    const {
      establishmentName,
      email,
      password,
      phone,
      companyType,
    } = await req.body;

    // Verifica se o email do Establishment já está em uso
    const emailExists = await Establishment.findOne({ email: email });
    if (emailExists) {
      return res.status(422).json({ error: 'EmailAlreadyExistsException' });
    }
    console.log("file up", file)
   // Check if photos for the gallery have been sent
    if (!file || file.length === 0) {
      return res.status(400).json({ error: "No File provided." });
    }
    console.log("file down", file)

    const logo_name = `${file.originalname.split(".")[0]}`;

    // Cria uma instância do Establishment com os dados fornecidos
    const establishment = new Establishment({
        establishmentName,
        email,
        password,
        phone,
        companyType,
      });

    // Salva o estabelecimento no banco de dados
    const newEstablishment = await establishment.save();

    // // Envio do arquivo para o Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `wasGehtAb-folder/allEstablishments/${newEstablishment._id}/${newEstablishment.establishmentName}/logo/`,
      resource_type: "auto",
      allowedFormats: ["jpg", "png", "jpeg"],
      public_id: logo_name,
      overwrite: false,
      upload_preset: "wasGehtAb_preset",
      transformation: [{ width: 200, height: 200, crop: "limit" }],
    });
    console.log("CAMINHO DA IMAGEM NO NOJS:::", file.path)
    if (!result.secure_url) {
      console.log("Error uploading Logo to cloudinary:", result); // Adiciona este log
      return res.status(500).send("Error uploading Logo");
    }
    console.log("result file", result)
    // Atualiza a URL do logo do estabelecimento com a URL do Cloudinary
    newEstablishment.logoUrl = result.secure_url;
    await newEstablishment.save();

 // Verifique se o companyType é válido antes de prosseguir
if (!['promoter', 'bar', 'club', 'kiosk'].includes(newEstablishment.companyType)) {
  res.status("400").json({error:"Invalid company type! Sorry, the specified company type is not valid. Please choose between, promoter, bar,club, or kiosk"})
  res.status("400").json({error:"The establishment creation has been halted."})
  res.status("400").json({error:"Please contact support if you need further assistance."})
  res.status("400").json({error:"Please contact support if you need further assistance."})
  console.error('Invalid company type.');
  console.error('The establishment creation has been halted.');
  console.error('Please contact support if you need further assistance.');
 throw new Error('Comapny type invalid.');
}
    // Crie os detalhes correspondentes automaticamente
    let details;
    switch (newEstablishment.companyType) {
      case 'promoter':
        details = await PromoterDetails.create({ establishment: newEstablishment._id });
      case 'bar':
        details = await BarDetails.create({ establishment: newEstablishment._id });
        break;
      case 'club':
        details = await ClubDetails.create({ establishment: newEstablishment._id });
        break;
      case 'kiosk':
        details = await KioskDetails.create({ establishment: newEstablishment._id });
        break;
        
    }
  
    // Associe os detalhes criados ao estabelecimento
    newEstablishment.details = details._id;
    await newEstablishment.save();
    const createdEstablishment = await Establishment.findById(newEstablishment._id).select('-password');
    // Responde com o estabelecimento criado
    console.log("Establishment created successfully:", createdEstablishment); // Adiciona este log
    return res.status(201).json({ establishment: createdEstablishment });
  } catch (error) {
    console.error("Error creating Establishment: ", error);
    return res.status(500).json({ error: 'Error creating establishment, please try again later!' });
  }
});



/// Login route
router.post("/login-establishment", async (req, res) => {
  try {
    const { email, password } = await req.body;

    // Validate establishment data
    if (!email) {
      console.log(email);

      return res.status(401).json({ error: "Please provide a valid email!" });
    }

    let establishment;

    // Check if Email is an email using regular expression
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (isEmail) {
      establishment = await Establishment.findOne({ email: email });
      console.log(email);
    } else {
      // Find establishment using email
      establishment = await Establishment.findOne({
        email: { $regex: `^${email}`, $options: "i" },
      });
      console.log(establishment);
    }

    if (!establishment) {
      return res.status(404).json({ error: "No establishment found with this email!" });
    }

    if (!password) {
      return res.status(422).json({ error: "Password is required!" });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, establishment.password);

    if (!isPasswordValid) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign({ _id: establishment._id, }, AUTH_SECRET_KEY, { expiresIn: "1h", });
    establishment.token = token;
    // Return the authentication token, ID, and email
    return res
      .status(200).json({ login: establishment });
  } catch (error) {
    console.error(`Erro no login: ${error}`);
    res.status(500).json({ error: 'Erro no login' });
  }
});

//fetch-all-establishment
router.get("/fetch-all-establishment", async (req, res) => {
  try {
    const establishments = await Establishment.find({})
      .sort({ createdAt: 1 })


    if (establishments.length === 0) {
      return res.status(404).json({ error: "Establishment not found" });
    }

    return res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json(error.message);
  }
});


// Exemplo de endpoint GET
router.get("/get-details/:establishmentsId", async (req, res) => {
  try {
    const establishmentsId = req.params.establishmentsId;

    // Encontrar o tipo de estabelecimento
    const establishment = await Establishment.findById(establishmentsId);
    if (!establishment) {
      return res.status(404).json({ error: "Establishment not found." });
    }

    const typeEstablishment = establishment.companyType;

    // Recuperar dados com base no tipo de estabelecimento
    let establishmentDetails;
    switch (typeEstablishment) {
      case 'bar':
        establishmentDetails = await BarDetails.findOne({ establishmentId: establishmentsId });
        break;
      case 'club':
        establishmentDetails = await ClubDetails.findOne({ establishmentId: establishmentsId });
        break;
      case 'kiosk':
        establishmentDetails = await KioskDetails.findOne({ establishmentId: establishmentsId });
        break;
      default:
        return res.status(400).json({ message: "Invalid establishment type." });
    }

    // Retorna os dados combinados
    const combinedData = {
      _id: establishment._id,
      establishmentName: establishment.establishmentName,
      logoUrl: establishment.logoUrl,
      email: establishment.email,
      stateName: establishment.stateName,
      cityName: establishment.cityName,
      postalCode: establishment.postalCode,
      streetName: establishment.streetName,
      number: establishment.number,
      phone: establishment.phone,
      companyType: establishment.companyType,
      followers: establishment.followers,
      followersCount: establishment.followersCount,
      ///
      establishmentDetails,
    };

    // Retorna os dados combinados
    return res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error when fetching establishment data:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/get-all-establishments-wiht-details", async (req, res) => {
  try {
    // Encontrar todos os estabelecimentos
    const allEstablishments = await Establishment.find();

    // Array para armazenar os dados combinados de todos os estabelecimentos
    const combinedDataArray = [];

    // Iterar sobre cada estabelecimento
    for (const establishment of allEstablishments) {
      const establishmentsId = establishment._id;
      const typeEstablishment = establishment.companyType;

      // Recuperar dados com base no tipo de estabelecimento
      let establishmentDetails;
      switch (typeEstablishment) {
        case 'bar':
          establishmentDetails = await BarDetails.findOne({ establishmentId: establishmentsId });
          break;
        case 'club':
          establishmentDetails = await ClubDetails.findOne({ establishmentId: establishmentsId });
          break;
        case 'kiosk':
          establishmentDetails = await KioskDetails.findOne({ establishmentId: establishmentsId });
          break;
        default:
          return res.status(400).json({ error: "Invalid establishment type." });
      }

      // Verificar se os detalhes do estabelecimento estão preenchidos
      if (establishmentDetails && Object.keys(establishmentDetails).length > 0) {
        // Dados combinados para o estabelecimento atual
        const combinedData = {
          _id: establishment._id,
          establishmentName: establishment.establishmentName,
          logoUrl: establishment.logoUrl,
          email: establishment.email,
          stateName: establishment.stateName,
          cityName: establishment.cityName,
          postalCode: establishment.postalCode,
          streetName: establishment.streetName,
          number: establishment.number,
          phone: establishment.phone,
          companyType: establishment.companyType,
          followers: establishment.followers,
          followersCount: establishment.followersCount,
          ///
          establishmentDetails,
        };
        // Adicionar os dados combinados ao array
        combinedDataArray.push(combinedData);
      }
    }

    // Retorna o array com os dados combinados de todos os estabelecimentos
    return res.status(200).json(combinedDataArray);
  } catch (error) {
    console.error("Error when fetching establishments data:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});


router.get("/fetch-establishment-type", async (req, res) => {
  try {
    const {cityName, companyType, page = 1, limit = 10 } = req.query;
    let query = {}; // Start the query as empty query

    // Se o parâmetro companyType estiver presente na solicitação, adicione-o à consulta
    if (companyType) {
      query.companyType = companyType;
    }
      // Se o parâmetro companyType estiver presente na solicitação, adicione-o à consulta
    if (cityName) {
      query.cityName = cityName;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Execute a consulta
    const establishments = await Establishment.paginate(query, options, {
      sort: { createdAt: 1 }
    });

    if (establishments.docs.length === 0) {
      return res.status(404).send("Establishments not found for the specified company type");
    }

    // Mapeie os estabelecimentos para remover o campo 'password'
    const sanitizedEstablishments = establishments.docs.map(establishment => {
      const { password, ...rest } = establishment.toObject();
      return rest;
    });

    return res.status(200).json({
      establishments: sanitizedEstablishments,
      total: establishments.totalDocs,
      totalPages: establishments.totalPages,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/establishmentProfile/:establishmentId", async (req, res) => {
  try {
    const establishmentId = req.params.establishmentId;

    // Buscar o estabelecimento pelo ID
    const establishment = await Establishment.findById(establishmentId).select("-password");

    // Verificar se encontrou o estabelecimento
    if (!establishment) {
      return res.status(404).json({ error: "Estabelecimento não encontrado" });
    }

    // Buscar os detalhes do estabelecimento
    const establishmentWithDetails = await Establishment.findById(establishmentId).populate('details').select("-password");

    // Buscar os posts relacionados a este estabelecimento
    const posts = await Post.find({ establishmentObjId: establishmentId }).sort({ createdAt: -1 });
    
    // Retornar o estabelecimento com os detalhes e os posts
    const establishmentWithDetailsAndPosts = {
      establishment: establishmentWithDetails,
      posts: posts
    };

    return res.status(200).json({ establishmentWithDetailsAndPosts: establishmentWithDetailsAndPosts });
  } catch (error) {
    console.error("Erro ao buscar perfil do estabelecimento:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});


router.get("/fetchEstablishmentByEstablishmentId/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const establishment = await Establishment.findById(
      id,
      "-isFeatured"
    ).populate("city", "cityName");
    if (!establishment) {
      res.status(404).json({ error: `Establishment not found for id ${id}` });
      return [];
    }
    res.status(200).json(establishment);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/fetchEstablishmentByCity/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;

    const establishments = await Establishment.find({ cityName: cityName }).select(
      "-isFeatured"
    );

    if (establishments.length === 0) {
      return res
        .status(404)
        .json({ msg: "No establishments found for this city" });
    }

    res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/fetchEstablishmentsForAdults/:for_adults_only?",
  async (req, res) => {
    try {
      const forAdultsOnly = req.params.for_adults_only || true;

      const establishments = await Establishment.find({
        for_adults_only: forAdultsOnly,
      })
        .select("-isFeatured")
        .populate("cityId");

      if (establishments.length === 0) {
        return res
          .status(404)
          .json({ msg: "Nenhum establishment para adultos encontrado" });
      }

      res.status(200).json(establishments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/fetchEventIsFeatured/:isFeatured", async (req, res) => {
  try {
    const isFeatured = req.params.isFeatured;

    const establishments = await Establishment.find({ isFeatured: isFeatured })
      .select("-isFeatured")
      .populate("cityId");
    console.log(establishments);

    if (events.length === 0) {
      return res.status(404).json({ error: `No Featured establishments so far` });
    }

    res.status(200).json(establishments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/fetchEstablishmentByOrganizedBy/:organizedBy",
  async (req, res) => {
    try {
      const organizedBy = req.params.organizedBy;

      const establishments = await Establishment.find({
        organizedBy: organizedBy,
      })
        .select("-isFeatured")
        .populate("cityId");

      if (establishments.length === 0) {
        return res.status(404).json({
          error: `${organizedBy} has not organized any establishments so far`,
        });
      }

      res.status(200).json(establishments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  "/fetchEstablishmentsByDateRange/:startDate/:endDate",
  async (req, res) => {
    try {
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;

      const establishments = await Establishment.find({
        start_date: { $gte: startDate },
        end_date: { $lte: endDate },
      }).select("-isFeatured");

      if (establishments.length === 0) {
        return res
          .status(404)
          .json({ msg: "No establishments found within the date range" })
          .populate("cityId");
      }

      res.status(200).json(establishments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/editEstablishment/:establishmentId",
  checkToken,
  async (req, res) => {
    try {
      const establishmentData = await req.body;
      const establishmentId = req.params.establishmentId;
      // Verificar se o evento existe
      const establishment = await Establishment.findById(establishmentId)
        .select("-isFeatured")
        .populate("cityId");
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }

      // Verificar se o Promoter tem permissão para editar o evento
      if (establishment.promoter.toString() !== req.promoter._id) {
        console.log(establishment.promoter.toString());
        return res.status(403).json({ msg: "Unauthorized access" });
      }
      // Atualizar os dados do evento
      establishment.establishmentName = establishmentData.establishmentName,
        establishment.email = establishmentData.email,
        establishment.password = establishmentData.password,
        establishment.stateName = establishmentData.stateName,
        establishment.cityName = establishmentData.cityName,
        establishment.postalCode = establishmentData.postalCode,
        establishment.streetName = establishmentData.streetName,
        establishment.number = establishmentData.number,
        establishment.phone = establishmentData.phone,
        establishment.companyType = establishmentData.companyType,
        establishment.updatedAt = Date.now();

      // Salvar as alterações no banco de dados
      const updatedEstablishment = await establishmentData.save();

      res.status(200).json(updatedEstablishment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/deleteEstablishment/:establishmentId",
  checkToken,
  async (req, res) => {
    try {
      const establishmentId = req.params.establishmentId;

      // Check if the establishment exists
      const establishment = await Event.findById(establishmentId).select(
        "-isFeatured"
      );
      if (!establishment) {
        return res.status(404).json({ error: "Establishment not found" });
      }

      // Verificar se o User tem permissão para editar o establishment
      if (establishment.user.toString() !== req.user._id) {
        console.log(establishment.user.toString());
        return res.status(403).json({ error: "Unauthorized access" });
      }
      // Delete the establishment
      await Establishment.deleteOne({ _id: establishmentId });

      res.status(200).json({ error: "Establishment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
