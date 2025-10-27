import React, { useEffect, useState } from "react";
import { Typography, Chip, Stack } from "@mui/material";

export default function RoomStatus() {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/rooms").then(r=>r.json()).then(setRooms).catch(()=>setRooms([{id:1,name:"A1",status:"AVAILABLE"}]));
  }, []);

  return (
    <div>
      <Typography variant="h6">Trạng thái phòng</Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {rooms.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>{r.name}</div>
            <Chip label={r.status === "AVAILABLE" ? "Còn trống" : "Đang sử dụng"} color={r.status === "AVAILABLE" ? "success" : "error"} />
          </div>
        ))}
      </Stack>
    </div>
  );
}
