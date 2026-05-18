"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DocumentUpload({ token }: { token?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setStatus("idle");
      setMessage("");
      setProgress(0);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus("idle");
    setMessage("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const pollStatus = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/status/${jobId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Status check failed");
      const data = await res.json();
      
      setProgress(data.progress || 0);
      setMessage(data.message || "Processing...");

      if (data.status === "success") {
        setStatus("success");
      } else if (data.status === "error") {
        setStatus("error");
      } else {
        setTimeout(() => pollStatus(jobId), 1500);
      }
    } catch (err) {
      // Don't fail immediately on polling error, just retry a few times
      setTimeout(() => pollStatus(jobId), 3000);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setMessage("Uploading document...");
    setProgress(5);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection", "general");

    try {
      const response = await fetch("http://localhost:8000/api/v1/admin/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.job_id) {
        // Start polling the job ID
        pollStatus(data.job_id);
      } else if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Document uploaded successfully.");
      } else {
        setStatus("error");
        setMessage(data.detail || "Upload failed. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("A network error occurred. Ensure the backend is running.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    if (bytes < k * k) {
      return (bytes / k).toFixed(2) + ' KB';
    }
    return (bytes / (k * k)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border rounded-xl shadow-sm p-6 max-w-2xl mx-auto mt-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Upload Knowledge Document</h3>
        <p className="text-sm text-zinc-500 mt-1">
          Supports PDF, CSV, Word, and Markdown. The AI will learn from these documents.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            isDragging 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
              : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept=".pdf,.csv,.docx,.md,.txt"
          />
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-4">
            <UploadCloud className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Click or drag and drop your file here
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Maximum file size: 50MB
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                <File className="w-6 h-6" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            {status !== "uploading" && (
              <button 
                onClick={clearFile}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {status === "idle" && (
            <button
              onClick={handleUpload}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Upload and Process Document
            </button>
          )}

          {status === "uploading" && (
            <div className="flex flex-col p-4 bg-white dark:bg-zinc-800 border rounded-lg gap-3">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">{message}</span>
                </div>
                <span className="text-sm font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-start p-4 text-green-700 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400 rounded-lg gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Upload Complete</p>
                <p className="text-xs mt-1 opacity-90">{message}</p>
                <button 
                  onClick={clearFile}
                  className="mt-3 text-xs font-medium underline"
                >
                  Upload another file
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start p-4 text-red-700 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 rounded-lg gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Upload Failed</p>
                <p className="text-xs mt-1 opacity-90">{message}</p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="mt-3 text-xs font-medium underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
