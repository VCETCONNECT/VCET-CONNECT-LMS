import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Loader2,
  Send,
  Bot,
  User,
  ChevronRight,
  ArrowRight,
  Star,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Code,
  Brain,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const LoadingDots = () => (
  <div className="flex space-x-1.5">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"
        style={{ animationDelay: `${i * 200}ms` }}
      />
    ))}
  </div>
);

const AIIntegrations = ({ student }) => {
  const [savedResults, setSavedResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const fetchSavedResults = async () => {
    try {
      const response = await fetch(
        `/api/cgpa/getStudentResults?studentId=${student.id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSavedResults(data.data);
      }
    } catch (err) {
      console.error("Error fetching saved results:", err);
    }
  };

  useEffect(() => {
    if (student?.id) {
      fetchSavedResults();
    }
  }, [student]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatResponse = (text) => {
    // First, try to split by section markers
    let sections = [];
    const rawSections = text.split(/\*\*|\|\|/).filter((s) => s.trim());

    rawSections.forEach((section) => {
      // Check if this is a section header or content
      if (section.includes(":")) {
        // This is a section with a header
        const [title, ...content] = section.split(":");
        sections.push({
          title: title.trim(),
          content: content.join(":").trim(),
        });
      } else if (section.trim()) {
        // This is content that belongs to the previous section
        if (sections.length > 0) {
          sections[sections.length - 1].content += "\n" + section.trim();
        } else {
          // If there's no previous section, create a default one
          sections.push({
            title: "Response",
            content: section.trim(),
          });
        }
      }
    });

    return (
      <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        {sections.map((section, index) => (
          <div key={index} className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              {section.title.toLowerCase().includes("performance") && (
                <ChevronRight className="w-5 h-5 text-blue-500" />
              )}
              {section.title.toLowerCase().includes("skills") && (
                <Code className="w-5 h-5 text-green-500" />
              )}
              {section.title.toLowerCase().includes("improvement") && (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              {section.title.toLowerCase().includes("follow") && (
                <Brain className="w-5 h-5 text-purple-500" />
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
            </div>

            {/* Section Content */}
            <div className="space-y-2 pl-4">
              {section.content.split("\n").map((line, idx) => {
                const text = line.trim();
                if (!text) return null;

                // Check if this is a follow-up question
                if (section.title.toLowerCase().includes("follow-up")) {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputMessage("");
                        generateResponse(text);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      {text}
                    </button>
                  );
                }

                // Handle regular content
                const isListItem = text.startsWith("-");
                const isSubListItem =
                  text.startsWith("  -") || text.startsWith("--");
                const contentText = text.replace(/^-+\s*/, "").trim();

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      isSubListItem ? "ml-6" : ""
                    }`}
                  >
                    {isListItem || isSubListItem ? (
                      <>
                        {section.title.toLowerCase().includes("skills") ? (
                          <Star className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        ) : section.title
                            .toLowerCase()
                            .includes("improvement") ? (
                          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                        )}
                        <span className="text-gray-700 dark:text-gray-300">
                          {contentText}
                        </span>
                      </>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 ml-6">
                        {contentText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const generateResponse = async (userMessage) => {
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(
        "AIzaSyAc-kBlcM6kKE2zofwL-_-Y1zk0K7FoF_Y"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const formattedAcademicData = Object.entries(savedResults).map(
        ([semester, data]) => ({
          semester,
          gpa: data.gpa,
          cgpa: data.cgpa,
          courses: data.courses.map((course) => ({
            code: course.course_code,
            name: course.course_name,
            grade: course.grade,
            credits: course.credits,
          })),
        })
      );

      const prompt = `As an academic advisor specializing in Computer Science and Engineering, analyze the student's performance and provide a response using the following format also provide the responce like intracting with the student:

Start each section with ** followed by the section title and a colon. For example:
**Performance Analysis:
- Point 1
- Point 2

**Core Skills Assessment:
- Skill 1
- Skill 2

**Areas for Improvement:
- Area 1
- Area 2

Use - for bullet points.
Use -- or indent with spaces for sub-points.
Keep responses focused and actionable.
End with relevant follow-up questions under:
**Follow-up Questions:
- Question 1?
- Question 2?

Student's Academic Data:
${JSON.stringify(formattedAcademicData, null, 2)}

Student's Question: ${userMessage}

Focus on addressing the specific question asked and provide clear, structured advice.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      setMessages((prev) => [
        ...prev,
        { type: "user", content: userMessage },
        { type: "bot", content: response, formatted: true },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        { type: "user", content: userMessage },
        {
          type: "bot",
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    generateResponse(inputMessage);
    setInputMessage("");
  };

  const suggestions = [
    "Analyze my core CSE subject performance",
    "What technical skills should I focus on?",
    "How to prepare for technical interviews?",
    "Suggest projects based on my grades",
    "Which programming languages should I master?",
    "Areas of improvement in DSA and core subjects",
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900  rounded-md">
      <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FcGoogle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Get your Performance Analysis with Gemini
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your personal AI-powered academic advisor
            </p>
          </div>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.length === 0 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
                <FcGoogle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-3">
                Welcome to Your CSE Academic Advisor
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Powered by Google's Gemini AI to analyze your technical skills
                and provide career guidance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto px-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(suggestion);
                    generateResponse(suggestion);
                  }}
                  className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base text-gray-700 dark:text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${
                message.type === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === "user"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {message.type === "user" ? (
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <FcGoogle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div
                className={`flex-1 ${
                  message.type === "user"
                    ? "bg-blue-600 text-white rounded-lg p-4 ml-12"
                    : "mr-12"
                }`}
              >
                {message.formatted
                  ? formatResponse(message.content)
                  : message.content}
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-start gap-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FcGoogle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 rounded-lg p-4 bg-white dark:bg-gray-800 mr-12">
              <LoadingDots />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your technical skills and career..."
            className="flex-1 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 text-base font-medium"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIIntegrations;
