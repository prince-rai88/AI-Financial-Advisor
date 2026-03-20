import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { financeApi } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import { notify } from "../utils/toast";

const ACCEPTED_EXTENSIONS = ["csv", "xlsx"];

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
      const message = "Unsupported file type. Please upload CSV or XLSX files.";
      setStatus({ type: "error", message });
      notify(message, "error");
      return;
    }

    setFile(candidate);
    setStatus({ type: "", message: "" });
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    setProgress(0);
    setStatus({ type: "", message: "" });

    try {
      const response = await financeApi.uploadStatement(file, (progressEvent) => {
        if (!progressEvent.total) return;
        setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      });

      const message = response.data?.message || "Statement uploaded successfully.";
      setStatus({ type: "success", message });
      notify(message, "success");

      if (response.data?.warning) {
        notify(response.data.warning, "info");
      }

      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "Upload failed. Please verify file format and try again.";
      setStatus({ type: "error", message });
      notify(message, "error");
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
    <section className="rounded-xl border border-border-subtle bg-bg-surface p-4" id="upload-section">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-lg bg-accent/10 p-2 text-accent">
          <FileUp className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Upload Financial Statement</h3>
          <p className="text-xs text-text-muted">Drop file or select manually. Supported: CSV, XLSX.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleUpload}>
        <div
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            dragOver
              ? "border-accent bg-bg-elevated"
              : "border-border-subtle bg-bg-elevated/60 hover:border-accent/60 hover:bg-bg-elevated"
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
          <UploadCloud className="mx-auto h-9 w-9 text-accent" />
          <p className="mt-3 text-sm font-semibold text-text-primary">
            {file ? file.name : "Drag and drop file here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-text-muted">Max upload size depends on server config</p>
        </div>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".csv,.xlsx"
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
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-blue transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">{progress}% uploaded</p>
          </div>
        ) : null}

        {status.message ? (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              status.type === "success"
                ? "border-green/30 bg-green/10 text-green"
                : "border-red/30 bg-red/10 text-red"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
