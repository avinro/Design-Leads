export type {
  CompositeTypes,
  Constants,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./database.generated";

import type { Database } from "./database.generated";

// Convenience aliases — maintained manually. `npm run gen:types` only updates
// database.generated.ts, so these app-facing aliases remain stable.

export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"];
export type AccountUpdate = Database["public"]["Tables"]["accounts"]["Update"];

export type AccountMember = Database["public"]["Tables"]["account_members"]["Row"];
export type AccountMemberInsert = Database["public"]["Tables"]["account_members"]["Insert"];
export type AccountMemberUpdate = Database["public"]["Tables"]["account_members"]["Update"];

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type MilestoneInsert = Database["public"]["Tables"]["milestones"]["Insert"];
export type MilestoneUpdate = Database["public"]["Tables"]["milestones"]["Update"];

export type Deliverable = Database["public"]["Tables"]["deliverables"]["Row"];
export type DeliverableInsert = Database["public"]["Tables"]["deliverables"]["Insert"];
export type DeliverableUpdate = Database["public"]["Tables"]["deliverables"]["Update"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];

export type IntakeForm = Database["public"]["Tables"]["intake_forms"]["Row"];
export type IntakeFormInsert = Database["public"]["Tables"]["intake_forms"]["Insert"];
export type IntakeFormUpdate = Database["public"]["Tables"]["intake_forms"]["Update"];

export type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];
export type ContactSubmissionInsert = Database["public"]["Tables"]["contact_submissions"]["Insert"];
export type ContactSubmissionUpdate = Database["public"]["Tables"]["contact_submissions"]["Update"];
