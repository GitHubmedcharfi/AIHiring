import axios from "axios";

const API_URL = "http://localhost:3000/jobs";

export const getJobs = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getJobById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createJob = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updateJob = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};