import React, { createContext, useContext, useState } from "react";

export type MeetingRole = "HOST" | "SECRETARY" | "MEMBER";

interface MeetingRoleContextType {
  role: MeetingRole | null;
  loadRoleForMeeting: (meetingId: string, userId: string) => Promise<void>;
}

const MeetingRoleContext = createContext<MeetingRoleContextType>({} as MeetingRoleContextType);

export const MeetingRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<MeetingRole | null>(null);

  const loadRoleForMeeting = async (meetingId: string, userId: string) => {
    await new Promise((res) => setTimeout(res, 400));
    if (meetingId === "123") setRole("SECRETARY");
    else if (meetingId === "124") setRole("MEMBER");
    else setRole("HOST");
  };

  return <MeetingRoleContext.Provider value={{ role, loadRoleForMeeting }}>{children}</MeetingRoleContext.Provider>;
};

export const useMeetingRole = () => useContext(MeetingRoleContext);
