"use client";

import axios from "axios";
import { useEffect, useState } from "react";

interface Topic {
  id: string;
  topicName: string;
}

const TopicsMenu = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get("/api/topicsMenu");
        setTopics(response.data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  return (
    <div>
      {topics.map((topic) => (
        <div key={topic.id}>
          <h1>{topic.topicName}</h1>
        </div>
      ))}
    </div>
  );
};

export default TopicsMenu;
