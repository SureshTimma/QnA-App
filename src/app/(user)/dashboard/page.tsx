"use client";
import axios from "axios";
import { useEffect, useState } from "react";

const UserDashboard = () => {
  const [qnData, setQnData] = useState({
    title: "",
    desc: "",
  });

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
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
    const response = await axios.post("/api/questions", qnData);
    // console.log(response);
  };

  const [answerData, setAnswerData] = useState({
    questionId: "",
    answer: "",
  });

  const handleAnswerChange = (e, questionId) => {
    const { name, value } = e.target;
    setAnswerData({
      ...answerData,
      questionId,
      [name]: value,
    });
  };

  const answerQuestion = async (e) => {
    e.preventDefault();
    const answerResponse = await axios.post("/api/answerQn", answerData);
    // console.log(answerData);
    console.log(answerResponse.data);
  };

  const handleLikeAnswer = async (answerId) => {
    const response = await axios.put("/api/likes", { answerId });
    console.log(response.data);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const qnsData = await axios.get("/api/questions");
      setQuestions(qnsData.data.questions);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchAnswers = async () => {
      const answersData = await axios.get("/api/answerQn");
      setAnswers(answersData.data.answers);
    };
    fetchAnswers();
  }, []);

  return (
    <>
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

      <div>
        {questions.map((question) => (
          <div key={question.id}>
            <h1>{question.title}</h1>
            <p>{question.desc}</p>
            <h2>Answers:</h2>
            {answers
              .filter((answer) => answer.questionId === question.id)
              .map((answer) => (
                <div key={answer.id}>
                  <p>{answer.answer}</p>
                  <button onClick={() => handleLikeAnswer(answer.id)}>
                    Like {answer.likes || 0}
                  </button>
                </div>
              ))}
            <form onSubmit={answerQuestion}>
              <textarea
                placeholder="enter answer"
                onChange={(e) => handleAnswerChange(e, question.id)}
                name="answer"
              ></textarea>
              <button>Answer</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserDashboard;
