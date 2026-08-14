export type CreateTripInput = {
  name: string;
  destination?: string;
  organizerName: string;
  organizerPhone: string;
};

export type InviteParticipantInput = {
  tripId: string;
  name?: string;
  phoneNumber: string;
};

export type Reminder = {
  participantId: string;
  kind: "invitation" | "preference" | "decision";
  scheduledFor: Date;
  attempt: number;
};
