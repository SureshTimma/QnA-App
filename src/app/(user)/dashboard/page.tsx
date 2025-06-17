"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";



//interfaces
interface Question {
  id: string;
  title: string;
  desc: string;
  topics: string[];
  image?: string;
  userId: string;
  createdAt?: string;
}

interface Answer {
  id: string;
  questionId: string;
  answer: string;
  likes: number;
  userId: string;
  createdAt?: string;
  isLiked?: boolean;
}

interface Topic {
  id: string;
  topicName: string;
}



// function to format relative time
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



//pages main code starts here
const UserDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [qnData, setQnData] = useState({
    title: "",
    desc: "",
    topics: [] as string[],
    image: "" as string,
  });

  // State variables
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(
    null
  );
  const [selectedQuestionTopics, setSelectedQuestionTopics] = useState<
    string[]
  >([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/signin",
      redirect: true,
    });
  };

  //toggles
  const toggleShowMoreAnswers = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const toggleAnswerForm = (questionId: string) => {
    setShowAnswerForm((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  //handlers
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

      //resetting form
      setQnData({ title: "", desc: "", topics: [], image: "" });
      setSelectedQuestionTopics([]);
      setImagePreview("");
      setShowQuestionForm(false);

      fetchQuestions();
    } catch (error) {
      console.error("Error submitting question:", error);
    }
  };

  //handeling image

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setQnData({
          ...qnData,
          image: base64String,
        });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setQnData({
      ...qnData,
      image: "",
    });
    setImagePreview("");
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

      setAnswerValues({
        ...answerValues,
        [questionId]: "",
      });
      setAnswerData({ questionId: "", answer: "" });

      fetchAnswers();
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleLikeAnswer = async (answerId: string) => {
    try {
      const response = await axios.put("/api/likes", { answerId });

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



  //fetching data
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header Bar */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5 text-white"
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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Q&A Hub</h1>
              </div>
            </div>{" "}            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
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
                </svg>                <span className="hidden md:inline">Ask Question</span>
                <span className="md:hidden">Ask</span>
              </button>

              {/* Profile Section */}
              <div className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200">
                {/* Profile Icon */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-white font-medium">
                      {session?.user?.name?.charAt(0)?.toUpperCase() ||
                        session?.user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </span>
                  </div>                  <div className="hidden sm:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24 sm:max-w-none">
                      {session?.user?.name || session?.user?.email || "User"}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
                  title="Sign out"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>{" "}
      <div className="flex">        {/* Sidebar */}
        <aside
          className={`fixed top-14 sm:top-16 left-0 bottom-0 z-40 w-64 sm:w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Filter by Topics
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Browse questions by category
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              <button
                onClick={() => handleTopicFilter(null)}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 ${
                  selectedTopicFilter === null
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base">All Topics</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {questions.length}
                  </span>
                </div>
              </button>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicFilter(topic.id)}
                  className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 ${
                    selectedTopicFilter === topic.id
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm sm:text-base truncate pr-2">{topic.topicName}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                      {
                        questions.filter((q) => q.topics?.includes(topic.id))
                          .length
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
        )}{" "}        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-6 sm:py-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome to Q&A Hub
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                Share your knowledge, ask questions, and learn from the
                community. Connect with experts and get answers to your
                questions.
              </p>
            </div>            {/* Question Form Modal */}
            {showQuestionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-4 sm:py-6 px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full mb-2 sm:mb-3">
                          <svg
                            className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                          Ask a Question
                        </h2>
                        <p className="text-blue-100 text-xs sm:text-sm">
                          Share your question with the community
                        </p>
                      </div>
                      <button
                        onClick={() => setShowQuestionForm(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-2 sm:ml-4"
                        aria-label="Close"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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

                  <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                    <div>
                      {" "}
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
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
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="What's your question?"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="desc"
                        className="block text-sm font-medium text-gray-700 mb-1"
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
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white text-sm resize-none"
                        placeholder="Provide more details about your question..."
                      ></textarea>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attach Image (Optional)
                      </label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          aria-label="Upload image for question"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        />
                        {imagePreview && (
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-w-xs max-h-40 rounded-lg border border-gray-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Topics
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 sm:p-4">
                        {topics.map((topic) => (
                          <label
                            key={topic.id}
                            className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedQuestionTopics.includes(
                                topic.id
                              )}
                              onChange={() => handleTopicSelection(topic.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                              {topic.topicName}
                            </span>
                          </label>
                        ))}
                      </div>
                      {selectedQuestionTopics.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Selected topics:
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {selectedQuestionTopics.map((topicId) => {
                              const topic = topics.find(
                                (t) => t.id === topicId
                              );
                              return topic ? (
                                <span
                                  key={topicId}
                                  className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {topic.topicName}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowQuestionForm(false)}
                        className="flex-1 px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg transition duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] text-sm"
                      >
                        Submit Question
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}            {/* Questions Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {selectedTopicFilter
                      ? topics.find((t) => t.id === selectedTopicFilter)
                          ?.topicName || "Questions"
                      : "Latest Questions"}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    {filteredQuestions.length} question
                    {filteredQuestions.length !== 1 ? "s" : ""} found
                    {!selectedTopicFilter && " • Sorted by newest first"}
                  </p>
                </div>

                {selectedTopicFilter && (
                  <button
                    onClick={() => handleTopicFilter(null)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium self-start sm:self-auto"
                  >
                    View all questions →
                  </button>
                )}
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500"
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
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                    {selectedTopicFilter
                      ? "No questions in this topic yet. Be the first to ask!"
                      : "Start the conversation by asking the first question."}
                  </p>
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
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
                <div className="space-y-4 sm:space-y-6">                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Question Header */}
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 leading-tight">
                            {question.title}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap self-start sm:self-auto">
                            {formatRelativeTime(question.createdAt)}
                          </span>
                        </div>
                        {question.topics && question.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                            {question.topics.map((topicId) => {
                              const topic = topics.find(
                                (t) => t.id === topicId
                              );
                              return topic ? (
                                <span
                                  key={topicId}
                                  className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {topic.topicName}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                          {question.desc}
                        </p>
                        {/* Display attached image if exists */}
                        {question.image && (
                          <div className="mb-4">
                            <img
                              src={question.image}
                              alt="Question attachment"
                              className="max-w-full max-h-48 sm:max-h-64 rounded-lg border border-gray-200 shadow-sm object-contain"
                            />
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-500 gap-2 sm:gap-0">
                          <span>
                            {
                              answers.filter(
                                (answer) => answer.questionId === question.id
                              ).length
                            }{" "}
                            answers
                          </span>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  U
                                </span>
                              </div>
                              <span>
                                By Unknown User
                              </span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {formatRelativeTime(question.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>                      {/* Answers Section */}
                      <div className="border-t border-gray-100">
                        <div className="p-4 sm:p-6">
                          {(() => {
                            const questionAnswers = answers.filter(
                              (answer) => answer.questionId === question.id
                            );
                            const answerCount = questionAnswers.length;
                            const isExpanded = expandedQuestions.has(
                              question.id
                            );
                            const showAnswerFormForQuestion =
                              showAnswerForm.has(question.id);

                            // Show first 2 answers by default, all when expanded
                            const displayedAnswers = isExpanded
                              ? questionAnswers
                              : questionAnswers.slice(0, 2);

                            return (
                              <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                                    Answers ({answerCount})
                                  </h4>
                                  {answerCount === 0 && (
                                    <button
                                      onClick={() =>
                                        toggleAnswerForm(question.id)
                                      }
                                      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition duration-300 font-medium text-xs sm:text-sm shadow-md hover:shadow-lg self-start sm:self-auto"
                                    >
                                      Answer
                                    </button>
                                  )}
                                </div>

                                {answerCount === 0 ? (
                                  <div className="text-center py-6 sm:py-8 text-gray-500">
                                    <p className="mb-2 sm:mb-3 text-sm sm:text-base">No answers yet</p>
                                    <p className="text-xs sm:text-sm">
                                      Be the first to help!
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                      {displayedAnswers.map((answer) => (
                                        <div
                                          key={answer.id}
                                          className="bg-gray-50 rounded-lg p-3 sm:p-4"
                                        >
                                          <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                              <span className="text-xs text-white font-medium">
                                                U
                                              </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                                                <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                                  Unknown User
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {formatRelativeTime(
                                                    answer.createdAt
                                                  )}
                                                </span>
                                              </div>
                                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                                {answer.answer}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between pl-8 sm:pl-11">
                                            <button
                                              onClick={() =>
                                                handleLikeAnswer(answer.id)
                                              }
                                              className={`flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm font-medium ${
                                                answer.isLiked
                                                  ? "text-red-600 hover:text-red-700"
                                                  : "text-blue-600 hover:text-blue-700"
                                              }`}
                                            >
                                              <svg
                                                className="w-3 h-3 sm:w-4 sm:h-4"
                                                fill={
                                                  answer.isLiked
                                                    ? "currentColor"
                                                    : "none"
                                                }
                                                stroke="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                              <span>
                                                {answer.isLiked
                                                  ? "Unlike"
                                                  : "Like"}{" "}
                                                ({Number(answer.likes) || 0})
                                              </span>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>                                    {/* Show More/Less Answers Button */}
                                    {answerCount > 2 && (
                                      <div className="flex justify-center mb-3 sm:mb-4">
                                        <button
                                          onClick={() =>
                                            toggleShowMoreAnswers(question.id)
                                          }
                                          className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors"
                                        >
                                          {isExpanded ? (
                                            <>
                                              <svg
                                                className="w-3 h-3 sm:w-4 sm:h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M5 15l7-7 7 7"
                                                />
                                              </svg>
                                              <span>Show Less Answers</span>
                                            </>
                                          ) : (
                                            <>
                                              <svg
                                                className="w-3 h-3 sm:w-4 sm:h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 9l-7 7-7-7"
                                                />
                                              </svg>
                                              <span>
                                                Show More Answers (
                                                {answerCount - 2} more)
                                              </span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Answer Form - Show for questions with answers or when explicitly requested */}
                                {(answerCount > 0 ||
                                  showAnswerFormForQuestion) && (
                                  <>
                                    {answerCount > 0 &&
                                      !showAnswerFormForQuestion && (
                                        <div className="flex justify-center mb-3 sm:mb-4">
                                          <button
                                            onClick={() =>
                                              toggleAnswerForm(question.id)
                                            }
                                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition duration-300 font-medium text-xs sm:text-sm shadow-md hover:shadow-lg"
                                          >
                                            Add Answer
                                          </button>
                                        </div>
                                      )}

                                    {showAnswerFormForQuestion && (
                                      <form
                                        onSubmit={(e) => {
                                          answerQuestion(e, question.id);
                                          setShowAnswerForm((prev) => {
                                            const newSet = new Set(prev);
                                            newSet.delete(question.id);
                                            return newSet;
                                          });
                                        }}
                                        className="bg-gray-50 rounded-lg p-3 sm:p-4"
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                                            Your Answer
                                          </h5>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              toggleAnswerForm(question.id)
                                            }
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label="Close answer form"
                                          >
                                            <svg
                                              className="w-4 h-4 sm:w-5 sm:h-5"
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
                                        <textarea
                                          placeholder="Write your answer..."
                                          onChange={(e) =>
                                            handleAnswerChange(e, question.id)
                                          }
                                          name="answer"
                                          value={
                                            answerValues[question.id] || ""
                                          }
                                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white text-sm resize-none"
                                          rows={3}
                                        ></textarea>
                                        <div className="flex justify-end mt-3">
                                          <button
                                            type="submit"
                                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition duration-300 font-medium text-xs sm:text-sm shadow-md hover:shadow-lg"
                                          >
                                            Submit Answer
                                          </button>
                                        </div>
                                      </form>
                                    )}
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>          </div>
        </main>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setShowQuestionForm(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-30 flex items-center justify-center"
        aria-label="Ask a question"
      >
        <svg
          className="w-6 h-6"
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
  );
};

export default UserDashboard;
