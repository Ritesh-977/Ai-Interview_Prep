import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4">
      {/* --- Hero Section --- */}
      <div className="text-center py-24 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
          Ace Your Next Tech Interview
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Upload your resume and a job description to start a personalized
          mock interview. Our AI analyzes your answers and gives you
          instant, resume-based feedback.
        </p>
        <Link
          to={isAuthenticated ? '/upload' : '/signup'}
          className="bg-blue-600 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-blue-700 transition duration-300 shadow-lg"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
        </Link>
      </div>

      {/* --- "How It Works" Section --- */}
      <div className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold">1</span>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              Upload Documents
            </h3>
            <p className="text-gray-600">
              Provide your current resume and the job description (JD) for the
              role you're targeting.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold">2</span>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              Start the Interview
            </h3>
            <p className="text-gray-600">
              Our AI generates realistic technical and behavioral questions
              based on the job description.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold">3</span>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
              Get Instant Feedback
            </h3>
            <p className="text-gray-600">
              Receive a 1-10 score and constructive feedback on how well your
              answer aligns with your resume.
            </p>
          </div>
        </div>
      </div>

      {/* --- Final CTA Section --- */}
      <div className="text-center bg-gray-100 py-20 mt-16 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Land Your Dream Job?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Practice makes perfect. Start your first mock interview today.
        </p>
        <Link
          to={isAuthenticated ? '/upload' : '/signup'}
          className="bg-blue-600 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-blue-700 transition duration-300 shadow-lg"
        >
          {isAuthenticated ? 'Start Practicing' : 'Sign Up Now'}
        </Link>
      </div>
    </div>
  );
};

export default Landing;