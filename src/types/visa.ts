export type Visa = {
  slug: string;
  title: string;
  summary: string;
};

export type VisaDetail = {
  slug: string;
  title: string;
  summary: string;
  html: string;
};

export type DocumentItem = {
  id: string;
  name: string;
};

// Payload type for contact ticket API
export type TicketPayload = {
  type: string | null;
  id: string | null;
  source: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string; // normalized to a non-empty string in the route
  message: string; // normalized to string in the route
  status: string; // e.g., NEW | OPEN | PENDING | RESOLVED | CLOSED
  priority: string; // e.g., LOW | NORMAL | HIGH
  locale: string | null;
  sessionId: string | null;
  userId: string | null;
  assigneeUserId: string | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
