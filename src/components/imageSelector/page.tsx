"use client";
import { useState } from "react";

const imageSelector = () => {
  const [base64Image, setBase64Image] = useState("");
  const [preview, setPreview] = useState("");

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setBase64Image(base64String);
        setPreview(base64String);
        console.log("Base64:", base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <label htmlFor="image-uploader">Upload an image:</label>
      <input
        type="file"
        accept="image/*"
        placeholder="Select an image"
        onChange={handleImageSelect}
      />
      {preview && (
        <div>
          <h3>Preview:</h3>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "300px", maxHeight: "300px" }}
          />
        </div>
      )}
    </>
  );
};

export default imageSelector;
