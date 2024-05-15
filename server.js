const express = require("express");
const mongoose = require("mongoose");
const Pet = require("./models/pets.model.js");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Node API Server");
});

app.get("/api/pets", async (req, res) => {
    try {
        const pets = await Pet.find({});
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/pet/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await Pet.findById(id);
        res.status(200).json(pet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cron API Link
const api_url = "https://biggamesapi.io/api/";

app.get("/api/updateDatabase", async (req, res) => {
    try {
        const petsResponse = await fetch(api_url + "collection/pets");
        const rawData = await petsResponse.json();
        let pets = rawData.data;

        const existsResponse = await fetch(api_url + "exists");
        const rawExistsData = await existsResponse.json();
        const existsMap = new Map(
            rawExistsData.data.map((item) => [
                `${item.configData.id}_${item.configData.pt || 0}${
                    item.configData.sh ? "_sh" : ""
                }`,
                item.value,
            ])
        );

        const rapResponse = await fetch(api_url + "rap");
        const rawRapData = await rapResponse.json();
        const rapMap = new Map(
            rawRapData.data.map((item) => [
                `${item.configData.id}_${item.configData.pt || 0}${
                    item.configData.sh ? "_sh" : ""
                }`,
                item.value,
            ])
        );

        console.log("Requested PS99 API pets' data");

        // TESTING //
        let count = 0;

        for (let pet of pets) {
            count += 1;
            // if (count > 5) {
            //     break;
            // }

            const { configName, category, configData } = pet;
            const { indexDesc, thumbnail, goldenThumbnail } = configData;

            // Attempt to fetch values for all states
            const existsDefault = existsMap.get(`${configName}_0`);
            const existsGolden = existsMap.get(`${configName}_1`);
            const existsRainbow = existsMap.get(`${configName}_2`);
            const existsDefaultShiny = existsMap.get(`${configName}_0_sh`);
            const existsGoldenShiny = existsMap.get(`${configName}_1_sh`);
            const existsRainbowShiny = existsMap.get(`${configName}_2_sh`);
            const RAPDefault = rapMap.get(`${configName}_0`);
            const RAPGolden = rapMap.get(`${configName}_1`);
            const RAPRainbow = rapMap.get(`${configName}_2`);
            const RAPDefaultShiny = rapMap.get(`${configName}_0_sh`);
            const RAPGoldenShiny = rapMap.get(`${configName}_1_sh`);
            const RAPRainbowShiny = rapMap.get(`${configName}_2_sh`);

            const updatedData = {
                configName,
                category,
                indexDesc,
                thumbnail,
                goldenThumbnail,
                existsDefault,
                existsDefaultShiny,
                existsGolden,
                existsGoldenShiny,
                existsRainbow,
                existsRainbowShiny,
                RAPDefault,
                RAPDefaultShiny,
                RAPGolden,
                RAPGoldenShiny,
                RAPRainbow,
                RAPRainbowShiny,
            };

            const oldPet = await Pet.findOne({ name: configName });

            const updatedPet = await Pet.findOneAndUpdate(
                { name: configName },
                updatedData,
                {
                    new: true,
                    upsert: true, // creates option if it doesn't exist
                }
            );

            // Handle the history data
            // Check if the data has been updated
            if (updatedPet) {
                // Update Default State History if needed
                if (
                    !oldPet ||
                    oldPet.existsDefault !== updatedPet.existsDefault ||
                    oldPet.RAPDefault !== updatedPet.RAPDefault
                ) {
                    updatedPet.defaultHistory.push({
                        RAP: updatedPet.RAPDefault,
                        exists: updatedPet.existsDefault,
                        updated_at: new Date(),
                    });
                }

                // Update Default Shiny State History if needed
                if (
                    !oldPet ||
                    oldPet.existsDefaultShiny !==
                        updatedPet.existsDefaultShiny ||
                    oldPet.RAPDefaultShiny !== updatedPet.RAPDefaultShiny
                ) {
                    updatedPet.defaultShinyHistory.push({
                        RAP: updatedPet.RAPDefaultShiny,
                        exists: updatedPet.existsDefaultShiny,
                        updated_at: new Date(),
                    });
                }

                // Update Golden State History if needed
                if (
                    !oldPet ||
                    oldPet.existsGolden !== updatedPet.existsGolden ||
                    oldPet.RAPGolden !== updatedPet.RAPGolden
                ) {
                    updatedPet.goldenHistory.push({
                        RAP: updatedPet.RAPGolden,
                        exists: updatedPet.existsGolden,
                        updated_at: new Date(),
                    });
                }

                // Update Golden Shiny State History if needed
                if (
                    !oldPet ||
                    oldPet.existsGoldenShiny !== updatedPet.existsGoldenShiny ||
                    oldPet.RAPGoldenShiny !== updatedPet.RAPGoldenShiny
                ) {
                    updatedPet.goldenShinyHistory.push({
                        RAP: updatedPet.RAPGoldenShiny,
                        exists: updatedPet.existsGoldenShiny,
                        updated_at: new Date(),
                    });
                }

                // Update Rainbow State History if needed
                if (
                    !oldPet ||
                    oldPet.existsRainbow !== updatedPet.existsRainbow ||
                    oldPet.RAPRainbow !== updatedPet.RAPRainbow
                ) {
                    updatedPet.rainbowHistory.push({
                        RAP: updatedPet.RAPRainbow,
                        exists: updatedPet.existsRainbow,
                        updated_at: new Date(),
                    });
                }

                // Update Rainbow Shiny State History if needed
                if (
                    !oldPet ||
                    oldPet.existsRainbowShiny !==
                        updatedPet.existsRainbowShiny ||
                    oldPet.RAPRainbowShiny !== updatedPet.RAPRainbowShiny
                ) {
                    updatedPet.rainbowShinyHistory.push({
                        RAP: updatedPet.RAPRainbowShiny,
                        exists: updatedPet.existsRainbowShiny,
                        updated_at: new Date(),
                    });
                }

                await updatedPet.save(); // Save changes if any history was updated
            }
        }

        res.status(200).json({ message: "Database updated successfully!" });
    } catch (error) {
        console.error("Failed to update database:", error);
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/pets", async (req, res) => {
    try {
        const pet = await Pet.create(req.body);
        res.status(200).json(pet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// upedate a pet's information
app.put("/api/pet/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findByIdAndUpdate(id, req.body);

        if (!pet) {
            return res.status(404).json({ message: "Pet not found!" });
        }

        const updatedPet = await Pet.findById(id);
        res.status(200).json(updatedPet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

mongoose
    .connect(
        "mongodb+srv://oskarbayy:MvbNfgvsAkk1TNy9@petsdb.dyezw73.mongodb.net/PetsDB?retryWrites=true&w=majority&appName=PetsDB"
    )
    .then(() => {
        console.log("Connected to database!");
        app.listen(4000, () => {
            console.log("Server is running on port 4000");
        });
    })
    .catch(() => {
        console.log("Connection Failed!");
    });

// nodemon cmd: 'node node_modules/nodemon/bin/nodemon.js server.js'
