// src/services/uploader.js
import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;

export async function uploadImage(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET); // unsigned preset
  const { data } = await axios.post(url, form);
  return data.secure_url; // save this in Firestore
}

// Later swap to Firebase Storage with the same signature:
// export async function uploadImage(file) { ... return downloadURL; }