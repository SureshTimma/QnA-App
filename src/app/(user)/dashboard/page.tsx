"use client";
import axios from "axios";
import { useState } from "react";

const UserDashboard = () => {
  const [qnData, setQnData] = useState({
    title: "",
    desc: "",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQnData({
      ...qnData,
      [name]: value,
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.post("/api/dashboard", qnData);
    console.log(qnData);
    console.log(response);
  };
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1">
            Title:
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="desc" className="mb-1">
            Description:
          </label>
          <textarea
            id="desc"
            name="desc"
            required
            onChange={handleInputChange}
            className="border p-2 rounded h-32"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </main>
  );
};

export default UserDashboard;
