import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
} from '../services/api';

// Progress bar component
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

// Single document item
// const DocumentItem = ({ doc, onFileDelete }) => (
//   <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
//     <div>
//       <span
//         className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
//           doc.type === 'resume'
//             ? 'bg-green-100 text-green-800'
//             : 'bg-blue-100 text-blue-800'
//         }`}
//       >
//         {doc.type}
//       </span>
//       <a
//         href={doc.fileUrl}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-600 hover:underline ml-2"
//       >
//         {doc.fileName}
//       </a>
//     </div>
//     <button
//       onClick={() => onFileDelete(doc._id)}
//       className="text-red-500 hover:text-red-700 font-medium"
//     >
//       Delete
//     </button>
//   </div>
// );


const DocumentItem = ({ doc, onFileDelete }) => {
  // Create the download URL by dynamically adding the 'fl_attachment' flag


  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
      {/* File Info */}
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            doc.type === 'resume'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {doc.type}
        </span>
        <span className="text-gray-700 font-medium">{doc.fileName}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* VIEW BUTTON */}
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View
        </a>
        
        {/* DELETE BUTTON */}
        <button
          onClick={() => onFileDelete(doc._id)}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const Upload = () => {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(null); // 'resume' or 'jd'
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await listDocuments();
      setDocuments(res.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
      console.error(error);
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = null;
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size cannot exceed 2MB');
      e.target.value = null;
      return;
    }

    fileType === 'resume' ? setResume(file) : setJd(file);
  };

  const handleUpload = async (fileType) => {
    const file = fileType === 'resume' ? resume : jd;
    if (!file) {
      toast.error(`Please select a ${fileType} file first`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);

    setUploading(fileType);
    setProgress(0);

    try {
      await uploadDocument(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      });

      toast.success(`${fileType} uploaded successfully!`);

      // Clear file input after upload
      if (fileType === 'resume') {
        setResume(null);
        document.getElementById('resume-input').value = null;
      } else {
        setJd(null);
        document.getElementById('jd-input').value = null;
      }

      fetchDocuments();
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setUploading(null);
      setProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
      console.error(error);
    }
  };

  // Check uploaded documents
  const resumeDoc = documents.find((doc) => doc.type === 'resume');
  const jdDoc = documents.find((doc) => doc.type === 'jd');
  const canStart = resumeDoc && jdDoc;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resume Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">1. Upload Your Resume</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload your latest resume in PDF format (max 2MB).
          </p>
          <input
            id="resume-input"
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'resume')}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 mb-4"
          />
          {uploading === 'resume' && <ProgressBar progress={progress} />}
          <button
            onClick={() => handleUpload('resume')}
            disabled={uploading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading === 'resume' ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>

        {/* JD Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">2. Upload Job Description</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload the Job Description (JD) in PDF format (max 2MB).
          </p>
          <input
            id="jd-input"
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e, 'jd')}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100 mb-4"
          />
          {uploading === 'jd' && <ProgressBar progress={progress} />}
          <button
            onClick={() => handleUpload('jd')}
            disabled={uploading}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {uploading === 'jd' ? 'Uploading...' : 'Upload JD'}
          </button>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Uploaded Documents</h3>
        <div className="space-y-3">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <DocumentItem key={doc._id} doc={doc} onFileDelete={handleDelete} />
            ))
          ) : (
            <p className="text-gray-500 text-center">No documents uploaded yet.</p>
          )}
        </div>

        {/* Start Mock Interview */}
        {canStart && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                if (resumeDoc.embeddingFailed || jdDoc.embeddingFailed) {
                  toast.error(
                    "Embeddings could not be generated due to OpenAI quota limits. Please try again later."
                  );
                  return;
                }
                navigate('/chat');
              }}
              className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition duration-300"
            >
              Start Your Mock Interview!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
