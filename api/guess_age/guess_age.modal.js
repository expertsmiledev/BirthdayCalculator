import mongoose from 'mongoose';
const { Schema } = mongoose

const guess_ageSchema = Schema({
    email: String,
    age: String,
    month: String,
    day: String,
    date: String,
    user_name: String,
    s_date: String,
    title_name: String,
    max: Number,
    user_id: String
})

export const Guess_Age = mongoose.model('guessAge', guess_ageSchema);