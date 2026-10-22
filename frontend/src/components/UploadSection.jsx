import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileUp, UploadCloud } from "lucide-react";
import { financeApi } from "../api";
import LoadingSpinner from "./LoadingSpinner";
import { isGuestMode } from "../utils/auth";
import { notify } from "../utils/toast";

const ACCEPTED_EXTENSIONS = ["csv", "xlsx"];

function isSupported(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return ACCEPTED_EXTENSIONS.includes(extension);
}

export default function UploadSection({ onUploadSuccess }) {
  const isGuest = isGuestMode();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [uploading, setUploading] = useState(false);

  if (isGuest) {
    return (
      <section className="apple-card p-6 text-center" id="upload-section">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-medium text-white mb-1">
          Demo Mode is Read-Only
        </h3>
        <p className="text-xs text-white/50 max-w-sm mx-auto mb-5 leading-relaxed font-light">
          You are exploring FinAI with a sample deterministic dataset. File upload and real-time transaction ingestion are enabled with an account.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-[#00e599] hover:bg-[#00cc88] text-black text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,229,153,0.2)]"
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] text-xs font-medium transition-all"
          >
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  const setSelectedFile = (candidate) => {
    if (!candidate) return;

    if (!isSupported(candidate)) {
      const message = "Unsupported format. Please upload standard CSV or XLSX files.";
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

      const message = response.data?.message || "Statement processed and ingested.";
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
        "Upload failed. Verify CSV structure and try again.";
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
    <section className="apple-card p-6" id="upload-section">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-2 text-[#00e599]">
          <FileUp className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Upload Financial Statement</h3>
          <p className="text-xs text-white/40 font-light mt-0.5">Drag & drop or select file. Supported formats: CSV, XLSX.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleUpload}>
        <div
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragOver
              ? "border-[#00e599] bg-[#00e599]/[0.03]"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]"
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
          <UploadCloud className="mx-auto h-8 w-8 text-[#00e599]/80 mb-3" />
          <p className="text-xs font-medium text-white/90">
            {file ? file.name : "Drag & drop ledger file here, or click to browse"}
          </p>
          <p className="mt-1 text-[11px] text-white/40 font-mono">Max size 10MB · Automated Categorization Active</p>
        </div>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".csv,.xlsx"
          onChange={(event) => setSelectedFile(event.target.files?.[0])}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-white/95 text-black text-xs font-semibold tracking-wide transition-all shadow-[0_2px_15px_rgba(255,255,255,0.15)] disabled:opacity-40 cursor-pointer"
            type="submit"
            disabled={!file || uploading}
          >
            {uploading ? "Ingesting..." : "Upload & Parse"}
          </button>
          {uploading ? <LoadingSpinner label="Parsing transactions..." /> : null}
        </div>

        {uploading ? (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-[#00e599] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-mono text-white/40">{progress}% uploaded</p>
          </div>
        ) : null}

        {status.message ? (
          <p
            className={`rounded-xl border p-3 text-xs ${
              status.type === "success"
                ? "border-[#00e599]/30 bg-[#00e599]/10 text-[#00e599]"
                : "border-[#f43f5e]/30 bg-[#f43f5e]/10 text-[#f43f5e]"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
