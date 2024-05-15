const mongoose = require("mongoose");

// Define a sub-schema for default state history records
const HistorySchema = new mongoose.Schema({
    RAP: { type: Number, required: false },
    exists: { type: Number, required: false },
    updated_at: { type: Date, default: Date.now },
});

const PetSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: false },
        indexDesc: { type: String, required: false },

        // States for exists and RAP
        existsDefault: { type: Number, required: false },
        existsDefaultShiny: { type: Number, required: false },
        existsGolden: { type: Number, required: false },
        existsGoldenShiny: { type: Number, required: false },
        existsRainbow: { type: Number, required: false },
        existsRainbowShiny: { type: Number, required: false },

        RAPDefault: { type: Number, required: false },
        RAPDefaultShiny: { type: Number, required: false },
        RAPGolden: { type: Number, required: false },
        RAPGoldenShiny: { type: Number, required: false },
        RAPRainbow: { type: Number, required: false },
        RAPRainbowShiny: { type: Number, required: false },

        thumbnail: { type: String, required: false },
        goldenThumbnail: { type: String, required: false },
        investValue: { type: Number, required: false },
        demand: { type: Number, required: false },
        projected: { type: Boolean, required: false },
        rapFluctuation: { type: Number, required: false },

        defaultHistory: [HistorySchema],
        defaultShinyHistory: [HistorySchema],
        goldenHistory: [HistorySchema],
        goldenShinyHistory: [HistorySchema],
        rainbowHistory: [HistorySchema],
        rainbowShinyHistory: [HistorySchema],
    },
    {
        timestamps: true,
    }
);

const Pet = mongoose.model("Pet", PetSchema, "Pets");

module.exports = Pet;
