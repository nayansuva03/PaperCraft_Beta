import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Trash2,
  ExternalLink,
  Calendar,
  Tag,
  Lock,
  FolderOpen,
  Loader2
} from "lucide-react";

function SavedServices() {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const navigate = useNavigate();

  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchSavedPdfs() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/saved-pdfs`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch saved PDFs");
        }

        setPdfs(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedPdfs();
  }, [isLoggedIn]);

  async function handleDelete(id) {
    try {
      setDeletingId(id);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/saved-pdfs/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete PDF");
      }

      setPdfs((current) => current.filter((pdf) => pdf._id !== id));
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Feature Locked View
  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0A0D18] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#121829] border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-500/20">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Feature Locked</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Please sign in to access and manage your saved services and documents.
          </p>
          <button
            onClick={() => navigate("/signIn")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Loading View
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0A0D18] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading saved PDFs...</p>
      </div>
    );
  }

  // Error View
  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0A0D18] text-white flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl max-w-md text-center">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (pdfs.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0A0D18] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#121829] border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-700/50">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">No saved PDFs yet</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Generate a Max Question paper, Exam Paper, or Quiz Result and it will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Main Grid Layout
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0A0D18] text-white py-10 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Services</h1>
            <p className="text-slate-400 text-sm mt-1">
              Access and manage all your generated PDF documents in one place.
            </p>
          </div>
          <span className="self-start sm:self-auto bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-300 font-medium">
            {pdfs.length} {pdfs.length === 1 ? "Document" : "Documents"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div
              key={pdf._id}
              className="bg-[#121829] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition duration-200 flex flex-col justify-between gap-5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50 capitalize">
                    <Tag className="w-3 h-3 text-indigo-400" />
                    {pdf.type}
                  </span>
                </div>

                <h2 className="font-semibold text-lg text-slate-100 group-hover:text-indigo-400 transition duration-200 line-clamp-1">
                  {pdf.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(pdf.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/60">
                <a
                  href={pdf.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition duration-200"
                >
                  <span>View PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleDelete(pdf._id)}
                  disabled={deletingId === pdf._id}
                  className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 rounded-lg border border-slate-700/50 hover:border-red-500/20 transition duration-200 disabled:opacity-50"
                  title="Delete PDF"
                >
                  {deletingId === pdf._id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SavedServices;