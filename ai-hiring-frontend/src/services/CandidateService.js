import axios from "axios";

const API_URL = "http://localhost:3000/candidates";

export const getCandidates = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const getCandidateById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createCandidate = async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
};

export const updateCandidate = async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
};

export const deleteCandidate = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};