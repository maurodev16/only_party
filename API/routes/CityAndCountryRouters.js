import mongoose from "mongoose";
import { Router } from "express";
import CityAndCountry from "../models/CityAndCountry.js";
import checkToken from "../middleware/checkToken.js";

const router = Router();


router.post("/register", checkToken, async (req, res) => {
  const { cityName, countryName } = req.body;
  try {
    //Valid City
    if (!cityName) {
      res.status(422).json({ msg: "City name obrigatorio!" });
      return;
    }

    //check if City with Country exists
    const cityAndCountyExists = await CityAndCountry.findOne({
      cityName: cityName,
      countryName: countryName,
    });
    if (cityAndCountyExists) {
      res.status(422).json({ msg: "ja existe uma cidade com este nome!" });
      return;
    }

    //Create City and Country
    const cityCountry = new CityAndCountry({
      cityName,
      countryName,
    });
    const createdCityCountry = await cityCountry.save();
    if (createdCityCountry) {
      res.status(200).json({
        msg: `${createdCityCountry.cityName} and ${createdCityCountry.countryName} Created!`,
      });
    }
  } catch (error) {
    console.log(`Erro ao criar cidade: ${error}`);
    res
      .status(500)
      .json({ msg: "Erro ao cadastrar Cidade, tente novamente mais tarde!" });
  }
});

router.get("/fetch-city-countries", async (req, res) => {
  try {
    const cities = await CityAndCountry.find()
      .sort({ cityName: 1 })
      .select("-__v");
    if (!cities || cities.length === 0) {
      return res.status(404).json({ msg: "Cities not found" });
    }
    return res.status(201).json(cities);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get("/fetch-city-countries/:cityName", async (req, res) => {
  try {
    const cityName = req.params.cityName;
    const city = await CityAndCountry.find({cityName: cityName }).select("-__v");

    if (city) {
      return res.status(201).json(city);
    } else {
      return res.status(404).json({ message: "City not found." });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
