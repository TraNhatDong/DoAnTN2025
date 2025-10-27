import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import api from "../../services/api";

export default function AudioUpload({ meetingId, onUploaded }: { meetingId: any; onUploaded?: ()=>void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return alert("Chọn file");
    const fd = new FormData(); fd.append("file", file); fd.append("meetingId", meetingId);
    setLoading(true);
    try {
      await api.post("/audio/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Uploaded");
      onUploaded && onUploaded();
    } catch {
      alert("Upload (mock)");
      onUploaded && onUploaded();
    } finally { setLoading(false); }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <input type="file" accept="audio/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
      <Box sx={{ mt: 1 }}>
        <Button variant="contained" onClick={upload} disabled={loading}>{loading ? "Uploading..." : "Upload audio"}</Button>
      </Box>
    </Box>
  );
}
