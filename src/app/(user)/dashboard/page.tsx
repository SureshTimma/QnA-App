"use client";
import axios from "axios";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  title: string;
  desc: string;
  topics: string[];
  userId: string;
  user: {
    username: string;
  };
  createdAt?: string;
}

interface Answer {
  id: string;
  questionId: string;
  answer: string;
  likes: number;
  userId: string;
  user: {
    username: string;
  };
  createdAt?: string;
}

interface Topic {
  id: string;
  topicName: string;
}

// Helper function to format relative time
const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "Recently";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  } catch (error) {
    return "Recently";
  }
};

const UserDashboard = () => {
  const [qnData, setQnData] = useState({
    title: "",
    desc: "",
    topics: [] as string[],
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(
    null
  );
  const [selectedQuestionTopics, setSelectedQuestionTopics] = useState<
    string[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
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
    try {
      const dataToSubmit = {
        ...qnData,
        topics: selectedQuestionTopics,
      };
      const response = await axios.post("/api/questions", dataToSubmit);
      console.log(response.data); // Reset form after successful submission
      setQnData({ title: "", desc: "", topics: [] });
      setSelectedQuestionTopics([]);
      setShowQuestionForm(false);
      // Refresh questions list
      fetchQuestions();
    } catch (error) {
      console.error("Error submitting question:", error);
    }
  };
  const [answerData, setAnswerData] = useState({
    questionId: "",
    answer: "",
  });
  const [answerValues, setAnswerValues] = useState<{ [key: string]: string }>(
    {}
  );
  const handleAnswerChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    questionId: string
  ) => {
    const { value } = e.target;
    setAnswerValues({
      ...answerValues,
      [questionId]: value,
    });
    setAnswerData({
      questionId,
      answer: value,
    });
  };

  const answerQuestion = async (
    e: React.FormEvent<HTMLFormElement>,
    questionId: string
  ) => {
    e.preventDefault();
    try {
      const answerResponse = await axios.post("/api/answerQn", {
        questionId,
        answer: answerValues[questionId] || "",
      });
      console.log(answerResponse.data);
      // Clear the specific answer form
      setAnswerValues({
        ...answerValues,
        [questionId]: "",
      });
      setAnswerData({ questionId: "", answer: "" });
      // Refresh answers list
      fetchAnswers();
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleLikeAnswer = async (answerId: string) => {
    try {
      const response = await axios.put("/api/likes", { answerId });
      console.log(response.data);
      // Refresh answers to show updated likes
      fetchAnswers();
    } catch (error) {
      console.error("Error liking answer:", error);
    }
  };

  const handleTopicSelection = (topicId: string) => {
    if (selectedQuestionTopics.includes(topicId)) {
      setSelectedQuestionTopics(
        selectedQuestionTopics.filter((id) => id !== topicId)
      );
    } else {
      setSelectedQuestionTopics([...selectedQuestionTopics, topicId]);
    }
  };

  const handleTopicFilter = (topicId: string | null) => {
    setSelectedTopicFilter(topicId);
  };

  const fetchQuestions = async () => {
    try {
      const qnsData = await axios.get("/api/questions");
      setQuestions(qnsData.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const answersData = await axios.get("/api/answerQn");
      setAnswers(answersData.data.answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const topicsData = await axios.get("/api/topicsMenu");
      setTopics(topicsData.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };
  useEffect(() => {
    fetchQuestions();
    fetchAnswers();
    fetchTopics();
  }, []);

  // Filter questions based on selected topic
  useEffect(() => {
    if (selectedTopicFilter) {
      setFilteredQuestions(
        questions.filter(
          (question) =>
            question.topics && question.topics.includes(selectedTopicFilter)
        )
      );
    } else {
      setFilteredQuestions(questions);
    }
  }, [questions, selectedTopicFilter]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Bar */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Q&A Hub</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="font-medium">Ask Question</span>
              </button>
              <button
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="sm:hidden p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
                aria-label="Ask question"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Filter by Topics
              </h2>
              <p className="text-sm text-gray-500">
                Browse questions by category
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => handleTopicFilter(null)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  selectedTopicFilter === null
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">All Topics</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {filteredQuestions.length}
                  </span>
                </div>
              </button>

              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicFilter(topic.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedTopicFilter === topic.id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{topic.topicName}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {
                        filteredQuestions.filter((q) =>
                          q.topics?.includes(topic.id)
                        ).length
                      }
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Q&A Hub
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Share your knowledge, ask questions, and learn from the
                community. Connect with experts and get answers to your
                questions.
              </p>
            </div>

            {/* Question Form Modal */}
            {showQuestionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Ask a Question
                      </h2>
                      <button
                        onClick={() => setShowQuestionForm(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Question Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={qnData.title}
                        required
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="What's your question?"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="desc"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Description *
                      </label>
                      <textarea
                        id="desc"
                        name="desc"
                        value={qnData.desc}
                        required
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        placeholder="Provide more details about your question..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Topics
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4">
                        {topics.map((topic) => (
                          <label
                            key={topic.id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedQuestionTopics.includes(
                                topic.id
                              )}
                              onChange={() => handleTopicSelection(topic.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {topic.topicName}
                            </span>
                          </label>
                        ))}
                      </div>

                      {selectedQuestionTopics.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Selected topics:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedQuestionTopics.map((topicId) => {
                              const topic = topics.find(
                                (t) => t.id === topicId
                              );
                              return topic ? (
                                <span
                                  key={topicId}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {topic.topicName}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowQuestionForm(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        Submit Question
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Questions Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTopicFilter
                      ? topics.find((t) => t.id === selectedTopicFilter)
                          ?.topicName || "Questions"
                      : "Recent Questions"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredQuestions.length} question
                    {filteredQuestions.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                {selectedTopicFilter && (
                  <button
                    onClick={() => handleTopicFilter(null)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all questions →
                  </button>
                )}
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-12 h-12 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {selectedTopicFilter
                      ? "No questions in this topic yet. Be the first to ask!"
                      : "Start the conversation by asking the first question."}
                  </p>
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Ask First Question</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Question Header */}
                      <div className="p-6">
                        {" "}
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4 leading-tight">
                            {question.title}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatRelativeTime(question.createdAt)}
                          </span>
                        </div>
                        {question.topics && question.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {question.topics.map((topicId) => {
                              const topic = topics.find(
                                (t) => t.id === topicId
                              );
                              return topic ? (
                                <span
                                  key={topicId}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {topic.topicName}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {question.desc}
                        </p>{" "}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {
                              answers.filter(
                                (answer) => answer.questionId === question.id
                              ).length
                            }{" "}
                            answers
                          </span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  {question.user?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </span>
                              </div>
                              <span>
                                By {question.user?.username || "Unknown User"}
                              </span>
                            </div>
                            <span>•</span>
                            <span>
                              {formatRelativeTime(question.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Answers Section */}
                      <div className="border-t border-gray-100">
                        <div className="p-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-4">
                            Answers (
                            {
                              answers.filter(
                                (answer) => answer.questionId === question.id
                              ).length
                            }
                            )
                          </h4>

                          {answers.filter(
                            (answer) => answer.questionId === question.id
                          ).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p className="mb-3">No answers yet</p>
                              <p className="text-sm">Be the first to help!</p>
                            </div>
                          ) : (
                            <div className="space-y-4 mb-6">
                              {answers
                                .filter(
                                  (answer) => answer.questionId === question.id
                                )
                                .map((answer) => (
                                  <div
                                    key={answer.id}
                                    className="bg-gray-50 rounded-lg p-4"
                                  >
                                    <div className="flex items-start space-x-3 mb-3">
                                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs text-white font-medium">
                                          {answer.user?.username
                                            ?.charAt(0)
                                            .toUpperCase() || "U"}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        {" "}
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-medium text-gray-900 text-sm">
                                            {answer.user?.username ||
                                              "Unknown User"}
                                          </span>{" "}
                                          <span className="text-xs text-gray-500">
                                            {formatRelativeTime(
                                              answer.createdAt
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">
                                          {answer.answer}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pl-11">
                                      <button
                                        onClick={() =>
                                          handleLikeAnswer(answer.id)
                                        }
                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        <span>
                                          {Number(answer.likes) || 0} likes
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          {/* Answer Form */}
                          <form
                            onSubmit={(e) => answerQuestion(e, question.id)}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <textarea
                              placeholder="Write your answer..."
                              onChange={(e) =>
                                handleAnswerChange(e, question.id)
                              }
                              name="answer"
                              value={answerValues[question.id] || ""}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                              rows={3}
                            ></textarea>
                            <div className="flex justify-end mt-3">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium text-sm shadow-sm"
                              >
                                Submit Answer
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
