import mongoose from "mongoose";
import { Router } from "express";
import MusicCategory from "../../models/MusicCategoryModel/MusicCategory.js";
import checkToken from "../../middleware/checkRefreshToken.js";
import checkRequiredFields from "../../middleware/postMediaMiddleware.js"
import CityAndCountry from "../../models/CityCountryModel/CityAndCountry.js";
const router = Router();

router.post("/bar-detail/:companyId",  async (req, res, next) => {
    try {
        const bardDetailsData = req.body;
        const companyId = req.params.companyId;

        // Verificar se o companyelecimento existe
        const companyObj = await Company.findById(companyId);
        if (!companyObj) {
            return res.status(422).json({ error: 'companyDoesNotExist' });
        }
        // Verificar se o tipo do companyelecimento é um bar
        if (companyObj.companyType !== 'bar') {
            return res.status(422).json({ error: 'CompanyNotBarType' });
        }
        // Verificar se já existe um registro BarDetail para o companyId
        const existingBarDetail = await BarDetail.findOne({ companyId: companyId });
        if (existingBarDetail) {
            return res.status(422).json({ error: 'CompanyIdDetailAlreadyRegistered' });
        }


        // Criar um novo objeto BarDetail
        const barDetail = new BarDetail({
            companyId: companyId,
            // openingHours: [openingHoursSchema],
            isAgeVerified: bardDetailsData.isAgeVerified,
            selectedAge: bardDetailsData.selectedAge,
            isFreeEntry: bardDetailsData.isFreeEntry,
            freeEntryTill: bardDetailsData.freeEntryTill,
            canPayWithCardEntry: bardDetailsData.canPayWithCardEntry,
            canPayWithCardConsumption: bardDetailsData.canPayWithCardConsumption,
            musicCategoryId: bardDetailsData.musicCategoryId,
            musicCategoryName: bardDetailsData.musicCategoryName,

            //Detail
            drinks: bardDetailsData.drinks,
            dance: bardDetailsData.dance,
            casual: bardDetailsData.casual,
            goodToGoWithGroup: bardDetailsData.goodToGoWithGroup,

            //Services options
            dineIn: bardDetailsData.dineIn,
            delivery: bardDetailsData.delivery,
            takeWay: bardDetailsData.takeWay,

            ///Acessibility
            accessibleParking: bardDetailsData.accessibleParking,
            stepFreeEntry: bardDetailsData.stepFreeEntry,
            accessibleRestrooms: bardDetailsData.accessibleRestrooms,
            elevatorOrRamps: bardDetailsData.elevatorOrRamps,
            wideCorridors: bardDetailsData.wideCorridors,
            brailleSignage: bardDetailsData.brailleSignage,
            mobilityAssistance: bardDetailsData.mobilityAssistance,
            serviceDogAccess: bardDetailsData.serviceDogAccess,
            audioDescriptionOrVisualGuide: bardDetailsData.audioDescriptionOrVisualGuide,
            accessibleCommunication: bardDetailsData.accessibleCommunication,

            ///Convenience
            convenienceParking: bardDetailsData.convenienceParking,
            wiFiAccess: bardDetailsData.wiFiAccess,
            outdoorSeating: bardDetailsData.outdoorSeating,
            indoorSeating: bardDetailsData.indoorSeating,
            takeoutOrToGoOrders: bardDetailsData.takeoutOrToGoOrders,
            deliveryService: bardDetailsData.deliveryService,
            reservationService: bardDetailsData.reservationService,
            driveThrough: bardDetailsData.driveThrough,
            onlineOrdering: bardDetailsData.onlineOrdering,
            atmAccess: bardDetailsData.atmAccess,

            // Menu Options
            dining: bardDetailsData.dining,
            alcoholicBeverages: bardDetailsData.alcoholicBeverages,
            shisha: bardDetailsData.shisha,
            wineSelection: bardDetailsData.wineSelection,
            beerSelection: bardDetailsData.beerSelection,
            cocktails: bardDetailsData.cocktails,
            nonAlcoholicBeverages: bardDetailsData.nonAlcoholicBeverages,
            coffeeAndTea: bardDetailsData.coffeeAndTea,
            desserts: bardDetailsData.desserts,
            vegetarian: bardDetailsData.vegetarian,
            veganOptions: bardDetailsData.veganOptions,

            // Atmosphere
            danceFloor: bardDetailsData.danceFloor,
            casualSetting: bardDetailsData.casualSetting,
            formalSetting: bardDetailsData.formalSetting,
            liveMusic: bardDetailsData.liveMusic,
            karaoke: bardDetailsData.karaoke,
            outdoorSeatingAtmosphere: bardDetailsData.outdoorSeatingAtmosphere,
            barArea: bardDetailsData.barArea,
            goodForGroups: bardDetailsData.goodForGroups,
            intimateSetting: bardDetailsData.intimateSetting,
            familyFriendly: bardDetailsData.familyFriendly,
            loungeArea: bardDetailsData.loungeArea,

            // Public type
            goodForGroupsPublic: bardDetailsData.goodForGroupsPublic,
            familyFriendlyPublic: bardDetailsData.familyFriendlyPublic,
            kidFriendly: bardDetailsData.kidFriendly,
            adultsOnly: bardDetailsData.adultsOnly,
            soloFriendly: bardDetailsData.soloFriendly,
            petFriendly: bardDetailsData.petFriendly,
            lgbtqPlusFriendly: bardDetailsData.lgbtqPlusFriendly,
            accessibleToAll: bardDetailsData.accessibleToAll,
            couplesRetreat: bardDetailsData.couplesRetreat,
            studentFriendly: bardDetailsData.studentFriendly,

            // Planning
            reservationsAccepted: bardDetailsData.reservationsAccepted,
            walkInsWelcome: bardDetailsData.walkInsWelcome,
            privateEvents: bardDetailsData.privateEvents,
            eventPlanningServices: bardDetailsData.eventPlanningServices,
            cateringServices: bardDetailsData.cateringServices,
            tableReservations: bardDetailsData.tableReservations,
            onlineBooking: bardDetailsData.onlineBooking,
            eventSpaceRental: bardDetailsData.eventSpaceRental,
            partyPackages: bardDetailsData.partyPackages,
            customEventPackages: bardDetailsData.customEventPackages,

            // Payment Options
            creditCardsAccepted: bardDetailsData.creditCardsAccepted,
            debitCardsAccepted: bardDetailsData.debitCardsAccepted,
            cashOnly: bardDetailsData.cashOnly,
            mobilePayments: bardDetailsData.mobilePayments,
            contactlessPayments: bardDetailsData.contactlessPayments,
            onlinePayments: bardDetailsData.onlinePayments,
            checks: bardDetailsData.checks,
            splitBills: bardDetailsData.splitBills,
            giftCards: bardDetailsData.giftCards,
            cryptoCurrency: bardDetailsData.cryptoCurrency,
            companyIsOnline: bardDetailsData.companyIsOnline,
            extraInfo: bardDetailsData.extraInfo,
        });

        // Salvar o objeto BarDetail no banco de dados
        const savedBarDetail = await barDetail.save();
        return res.status(201).json({ success: true, barDetail: savedBarDetail });
    } catch (error) {
        console.error(`Error creating BarDetail: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;