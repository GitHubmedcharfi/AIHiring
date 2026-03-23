import axios from "axios";

const API_URL = "http://localhost:3000/interviews";

export const getInterviews = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const getInterviewById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createInterview = async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
};

export const updateInterview = async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
};

export const deleteInterview = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};