import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import API from "../api";
import LoadingSpinner from "./LoadingSpinner";

const ACCEPTED_EXTENSIONS = ["csv", "pdf", "xls", "xlsx"];

function isSupported(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return ACCEPTED_EXTENSIONS.includes(extension);
}

export default function UploadSection({ onUploadSuccess }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [uploading, setUploading] = useState(false);

  const setSelectedFile = (candidate) => {
    if (!candidate) return;

    if (!isSupported(candidate)) {
      setStatus({
        type: "error",
        message: "Unsupported file type. Please upload PDF, CSV, or Excel files.",
      });
      return;
    }

    setFile(candidate);
    setStatus({ type: "", message: "" });
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || uploading) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setProgress(0);
    setStatus({ type: "", message: "" });

    try {
      const response = await API.post("upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });

      setStatus({
        type: "success",
        message: response.data?.message || "Statement uploaded successfully.",
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      const fallback = "Upload failed. Please verify file format and try again.";
      setStatus({
        type: "error",
        message: error.response?.data?.error || fallback,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setSelectedFile(dropped);
  };

  return (
    <section className="surface-card p-6" id="upload-section">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-lg bg-teal-100 p-2 text-teal-700">
          <FileUp className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Upload Financial Statement</h3>
          <p className="text-sm text-slate-600">Drop file or select manually. Supported: PDF, CSV, Excel.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleUpload}>
        <div
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            dragOver
              ? "border-teal-400 bg-teal-50"
              : "border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-teal-300 hover:bg-teal-50/40"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <UploadCloud className="mx-auto h-9 w-9 text-teal-600" />
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {file ? file.name : "Drag and drop file here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Max upload size based on backend/server configuration</p>
        </div>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".csv,.pdf,.xls,.xlsx"
          onChange={(event) => setSelectedFile(event.target.files?.[0])}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" type="submit" disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload Now"}
          </button>
          {uploading ? <LoadingSpinner label="Processing file..." /> : null}
        </div>

        {uploading ? (
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-600">{progress}% uploaded</p>
          </div>
        ) : null}

        {status.message ? (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
