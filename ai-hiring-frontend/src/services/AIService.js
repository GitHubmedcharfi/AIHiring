import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/ai",
});

export const generateQuestion = (data) =>
    API.post("generate-question", data);

export const generateFollowUp = (data) =>
    API.post("generate-followup", data);

export const textToSpeech = (text) =>
    API.post("text-to-speech", { text }, { responseType: "blob" });

export const speechToText = (audioBase64) =>
    API.post("speech-to-text", { audioBase64 });

export const evaluateAnswer = (data) =>
    API.post("evaluate", data);