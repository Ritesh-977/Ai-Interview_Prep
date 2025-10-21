import React, { useState, useEffect, useRef } from 'react';
import { startChat, sendQuery } from '../services/api';
import toast from 'react-hot-toast';

// --- Message Components ---

// Displays a message from the User
const UserMessage = ({ message }) => (
  <div className="flex justify-end mb-4">
    <div className="bg-blue-500 text-white p-3 rounded-l-lg rounded-br-lg max-w-lg">
      <p>{message}</p>
    </div>
  </div>
);

// Displays a message from the AI Assistant (questions or feedback)
const AssistantMessage = ({ message, score }) => (
  <div className="flex justify-start mb-4">
    <div className="bg-gray-200 text-gray-800 p-3 rounded-r-lg rounded-bl-lg max-w-lg">
      {/* Show score if it exists */}
      {score && (
        <div className="mb-2">
          <span className="font-bold text-lg text-blue-700">Score: {score}/10</span>
        </div>
      )}
      {/* Format newlines in the message */}
      {message.split('\n').map((line, index) => (
        <p key={index} className="mb-2">
          {line}
        </p>
      ))}
    </div>
  </div>
);

// --- Chat Page Component ---

const Chat = () => {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]); // List of { role, content, score }
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Loading on initial start
  const [isReplying, setIsReplying] = useState(false); // Loading for replies

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const chatEndRef = useRef(null); // To auto-scroll to bottom

  // --- Effects ---

  // 1. On component mount: start the chat
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await startChat();
        const { _id, messages: initialMessages } = res.data;
        const assistantMsg = initialMessages[initialMessages.length - 1];

        setChatId(_id);
        setMessages(initialMessages);

        // Parse the questions
        const questionList = assistantMsg.content.split('\n').filter(q => q.trim() !== '');
        setQuestions(questionList);

      } catch (error) {
        console.error(error);
        toast.error('Failed to start chat. Do you have a Resume and JD uploaded?');
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, []);

  // 2. Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Handlers ---

  const handleSend = async (e) => {
    e.preventDefault();
    if (!currentInput.trim() || isReplying || !chatId) return;

    const currentQuestion = questions[questionIndex];
    const userMessage = { role: 'user', content: currentInput };

    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsReplying(true);

    try {
      // Send message to backend
      const res = await sendQuery({
        chatId: chatId,
        question: currentQuestion,
        message: userMessage.content,
      });

      // Add AI feedback to state
      setMessages(prev => [...prev, res.data]);

      // Move to the next question
      setQuestionIndex(prev => prev + 1);

    } catch (error) {
      console.error(error);
      toast.error('Failed to get a response from the AI.');
    } finally {
      setIsReplying(false);
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-semibold">Loading Your Interview...</h2>
        <p>The AI is reading your Job Description and preparing questions.</p>
        {/* You can add a spinner component here */}
      </div>
    );
  }

  const isChatFinished = questionIndex >= questions.length;

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-center">Your Mock Interview</h2>
        {/* Show current question */}
        {!isChatFinished && (
          <p className="text-center text-gray-600 mt-2">
            Question {questionIndex + 1} of {questions.length}: <br/>
            <strong className="text-gray-800">{questions[questionIndex]}</strong>
          </p>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => {
          if (msg.role === 'user') {
            return <UserMessage key={index} message={msg.content} />;
          }
          if (msg.role === 'assistant') {
            return <AssistantMessage key={index} message={msg.content} score={msg.score} />;
          }
          return null; // Ignore system messages
        })}
        
        {/* Show loading spinner while AI is replying */}
        {isReplying && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-r-lg rounded-bl-lg">
              <p className="animate-pulse">Assistant is typing...</p>
            </div>
          </div>
        )}

        {/* Show finished message */}
        {isChatFinished && (
            <AssistantMessage 
              message="You have completed all the questions! This interview session is over. Feel free to review your feedback." 
            />
        )}
        
        {/* Dummy div to scroll to */}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder={isChatFinished ? "Interview complete." : "Type your answer..."}
            disabled={isReplying || isChatFinished}
            className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isReplying || isChatFinished}
            className="px-6 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;