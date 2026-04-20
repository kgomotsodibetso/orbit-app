// Orbit Tech — Database types
// Replace with `npx supabase gen types typescript --local > types/database.ts` once Supabase project is created

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---- Row types ----

export interface InstitutionRow {
  id: string;
  name: string;
  slug: string;
  tier: number;
  type: string;
  province: string;
  district: string | null;
  emis_number: string | null;
  address: Json | null;
  contact_email: string;
  contact_phone: string | null;
  subscription_status: string;
  subscription_ends_at: string | null;
  max_books: number;
  max_members: number;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  institution_id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'librarian' | 'teacher' | 'viewer';
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface BookRow {
  id: string;
  institution_id: string;
  isbn_13: string;
  isbn_10: string | null;
  title: string;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  published_year: number | null;
  language: string;
  subject_area: string | null;
  grade_level: string[] | null;
  cover_url: string | null;
  description: string | null;
  dewey_decimal: string | null;
  location_shelf: string | null;
  condition: string;
  total_copies: number;
  available_copies: number;
  is_reference_only: boolean;
  acquisition_date: string | null;
  acquisition_source: string | null;
  acquisition_cost: number | null;
  barcode: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberRow {
  id: string;
  institution_id: string;
  member_number: string;
  full_name: string;
  member_type: 'learner' | 'teacher' | 'staff' | 'community';
  grade: string | null;
  class_name: string | null;
  date_of_birth: string | null;
  guardian_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  max_loans: number;
  loan_period_days: number;
  is_active: boolean;
  notes: string | null;
  joined_at: string;
  created_at: string;
}

export interface LoanRow {
  id: string;
  institution_id: string;
  book_id: string;
  member_id: string;
  checked_out_by: string;
  checked_in_by: string | null;
  checked_out_at: string;
  due_date: string;
  returned_at: string | null;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  renewal_count: number;
  condition_on_return: string | null;
  fine_amount: number;
  fine_paid: boolean;
  notes: string | null;
  created_at: string;
}

export interface SmsAlertRow {
  id: string;
  institution_id: string;
  loan_id: string;
  member_id: string;
  phone_number: string;
  message: string;
  alert_type: 'due_tomorrow' | 'overdue_1d' | 'overdue_7d' | 'overdue_14d';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  panacea_message_id: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface IsbnCacheRow {
  isbn_13: string;
  title: string;
  authors: string[] | null;
  publisher: string | null;
  published_year: number | null;
  cover_url: string | null;
  description: string | null;
  raw_data: Json | null;
  fetched_at: string;
}

export interface DbeReportRow {
  id: string;
  institution_id: string;
  report_type: 'annual_stocktake' | 'assets_register' | 'loans_summary';
  report_year: number;
  term: number | null;
  generated_by: string;
  status: 'draft' | 'submitted' | 'approved';
  file_url: string | null;
  data_snapshot: Json | null;
  submitted_at: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  institution_id: string;
  performed_by: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Json | null;
  new_values: Json | null;
  ip_address: string | null;
  created_at: string;
}

// ---- Insert types (flat, no circular refs) ----

export type InstitutionInsert = Omit<InstitutionRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
export type ProfileInsert = Omit<ProfileRow, 'created_at'>;
export type BookInsert = Omit<BookRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
export type MemberInsert = Omit<MemberRow, 'id' | 'created_at'> & { id?: string };
export type LoanInsert = Omit<LoanRow, 'id' | 'created_at'> & { id?: string };
export type SmsAlertInsert = Omit<SmsAlertRow, 'id' | 'created_at'> & { id?: string };
export type IsbnCacheInsert = Omit<IsbnCacheRow, 'fetched_at'> & { fetched_at?: string };
export type DbeReportInsert = Omit<DbeReportRow, 'id' | 'created_at'> & { id?: string };
export type AuditLogInsert = Omit<AuditLogRow, 'id' | 'created_at'> & { id?: string };

// ---- Update types ----

export type InstitutionUpdate = Partial<InstitutionInsert>;
export type ProfileUpdate = Partial<ProfileInsert>;
export type BookUpdate = Partial<BookInsert>;
export type MemberUpdate = Partial<MemberInsert>;
export type LoanUpdate = Partial<LoanInsert>;

// ---- Database interface (for Supabase client typing) ----

export interface Database {
  public: {
    Tables: {
      institutions: { Row: InstitutionRow; Insert: InstitutionInsert; Update: InstitutionUpdate; Relationships: [] };
      profiles:     { Row: ProfileRow;     Insert: ProfileInsert;     Update: ProfileUpdate;     Relationships: [] };
      books:        { Row: BookRow;        Insert: BookInsert;        Update: BookUpdate;        Relationships: [] };
      members:      { Row: MemberRow;      Insert: MemberInsert;      Update: MemberUpdate;      Relationships: [] };
      loans:        { Row: LoanRow;        Insert: LoanInsert;        Update: LoanUpdate;        Relationships: [] };
      sms_alerts:   { Row: SmsAlertRow;   Insert: SmsAlertInsert;   Update: Partial<SmsAlertInsert>;   Relationships: [] };
      isbn_cache:   { Row: IsbnCacheRow;  Insert: IsbnCacheInsert;  Update: Partial<IsbnCacheInsert>;  Relationships: [] };
      dbe_reports:  { Row: DbeReportRow;  Insert: DbeReportInsert;  Update: Partial<DbeReportInsert>;  Relationships: [] };
      audit_log:    { Row: AuditLogRow;   Insert: AuditLogInsert;   Update: Partial<AuditLogInsert>;   Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      auth_institution_id: { Args: Record<string, never>; Returns: string };
      auth_role:           { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
  };
}

// ---- Convenience aliases ----

export type Institution = InstitutionRow;
export type Profile = ProfileRow;
export type Book = BookRow;
export type Member = MemberRow;
export type Loan = LoanRow;
export type SmsAlert = SmsAlertRow;
export type IsbnCache = IsbnCacheRow;
export type DbeReport = DbeReportRow;
export type AuditLog = AuditLogRow;

export type UserRole = ProfileRow['role'];
export type LoanStatus = LoanRow['status'];
export type MemberType = MemberRow['member_type'];
export type BookCondition = BookRow['condition'];
