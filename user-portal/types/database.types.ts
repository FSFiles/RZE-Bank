export type AccountType = "savings" | "current";
export type AccountStatus = "active" | "frozen" | "closed";
export type GenderType = "male" | "female" | "other";
export type TxnType =
  | "deposit"
  | "withdrawal"
  | "transfer_in"
  | "transfer_out"
  | "admin_credit"
  | "admin_debit"
  | "interest_credit";
export type TxnStatus = "pending" | "success" | "failed" | "reversed";
export type RequestStatus = "pending" | "approved" | "rejected" | "expired" | "needs_info" | "closed";
export type LoanType = "personal" | "home" | "vehicle" | "education" | "business";
export type CustomerStatus = "pending" | "active" | "suspended" | "rejected";
export type ServiceRequestType =
  | "account_creation"
  | "deposit_request"
  | "withdrawal_request"
  | "loan_request"
  | "profile_update"
  | "account_upgrade"
  | "debit_card_request"
  | "credit_card_request"
  | "cheque_book_request"
  | "mobile_change"
  | "email_change"
  | "account_closure"
  | "complaint";
export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";
export type AdminRole = "admin";

export interface Database {
  public: {
    Tables: {
      customers: {
        Relationships: [];
        Row: {
          id: string;
          auth_user_id: string;
          customer_id: string;
          first_name: string;
          last_name: string;
          phone_number: string;
          email: string;
          dob: string;
          gender: GenderType;
          aadhaar_number: string;
          pan_number: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          pin_code: string;
          country: string;
          profile_picture_url: string | null;
          notification_preferences: { email: boolean; sms: boolean; push: boolean };
          security_settings: { two_factor_enabled: boolean };
          status: CustomerStatus;
          status_reason: string | null;
          deleted_at: string | null;
          transaction_pin_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
      };
      pending_registrations: {
        Relationships: [];
        Row: {
          auth_user_id: string;
          first_name: string;
          last_name: string;
          phone_number: string;
          dob: string;
          gender: GenderType;
          aadhaar_number: string;
          pan_number: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          pin_code: string;
          country: string;
          account_type: AccountType;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pending_registrations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["pending_registrations"]["Row"]>;
      };
      accounts: {
        Relationships: [
          {
            foreignKeyName: "accounts_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          account_number: string;
          customer_id: string;
          account_type: AccountType;
          ifsc: string;
          branch: string;
          upi_id: string | null;
          balance: number;
          status: AccountStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["accounts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["accounts"]["Row"]>;
      };
      transactions: {
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_counterparty_account_id_fkey";
            columns: ["counterparty_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          account_id: string;
          counterparty_account_id: string | null;
          type: TxnType;
          amount: number;
          status: TxnStatus;
          reference_note: string | null;
          latitude: number | null;
          longitude: number | null;
          city: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
      };
      deposits: {
        Relationships: [
          {
            foreignKeyName: "deposits_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          account_id: string;
          amount: number;
          method: string;
          reference_number: string;
          receipt_url: string | null;
          status: RequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["deposits"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["deposits"]["Row"]>;
      };
      withdrawals: {
        Relationships: [
          {
            foreignKeyName: "withdrawals_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          withdrawal_id: string;
          account_id: string;
          amount: number;
          qr_payload: string;
          status: RequestStatus;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["withdrawals"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["withdrawals"]["Row"]>;
      };
      loans: {
        Relationships: [
          {
            foreignKeyName: "loans_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          customer_id: string;
          loan_type: LoanType;
          loan_category: string | null;
          amount: number;
          monthly_income: number;
          occupation: string;
          purpose: string;
          document_urls: string[];
          status: RequestStatus;
          cibil_score: number | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["loans"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["loans"]["Row"]>;
      };
      notifications: {
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          customer_id: string;
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      admin_users: {
        Relationships: [];
        Row: {
          id: string;
          auth_user_id: string;
          name: string;
          email: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
      };
      service_requests: {
        Relationships: [
          {
            foreignKeyName: "service_requests_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          customer_id: string;
          request_type: ServiceRequestType;
          request_details: Record<string, unknown>;
          priority: ServiceRequestPriority;
          source_table: string | null;
          source_id: string | null;
          status: RequestStatus;
          admin_message: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["service_requests"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["service_requests"]["Row"]>;
      };
      admin_activity_logs: {
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          }
        ];
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_activity_logs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["admin_activity_logs"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      provision_customer: {
        Args: {
          p_auth_user_id: string;
          p_first_name: string;
          p_last_name: string;
          p_phone_number: string;
          p_email: string;
          p_dob: string;
          p_gender: GenderType;
          p_aadhaar_number: string;
          p_pan_number: string;
          p_address_line1: string;
          p_address_line2: string | null;
          p_city: string;
          p_state: string;
          p_pin_code: string;
          p_country: string;
          p_account_type: AccountType;
        };
        Returns: { out_customer_id: string; out_account_number: string }[];
      };
      admin_review_service_request: {
        Args: {
          p_request_id: string;
          p_new_status: RequestStatus;
          p_admin_message?: string | null;
        };
        Returns: void;
      };
      admin_adjust_balance: {
        Args: {
          p_account_id: string;
          p_amount: number;
          p_txn_type: "admin_credit" | "admin_debit" | "interest_credit";
          p_note?: string | null;
        };
        Returns: void;
      };
      admin_set_customer_status: {
        Args: {
          p_customer_id: string;
          p_new_status: CustomerStatus;
          p_reason?: string | null;
        };
        Returns: void;
      };
      admin_soft_delete_customer: {
        Args: {
          p_customer_id: string;
          p_reason?: string | null;
        };
        Returns: void;
      };
      process_transfer: {
        Args: {
          p_sender_account_id: string;
          p_receiver_identifier: string;
          p_identifier_type: "account_number" | "phone_number" | "upi_id";
          p_amount: number;
          p_note?: string | null;
        };
        Returns: {
          out_status: string;
          out_message: string;
          out_transaction_id: string | null;
          out_receiver_name: string | null;
        }[];
      };
      set_transaction_pin: {
        Args: { p_pin: string };
        Returns: void;
      };
      verify_transaction_pin: {
        Args: { p_pin: string };
        Returns: boolean;
      };
      has_transaction_pin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      next_withdrawal_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      admin_approve_deposit: {
        Args: { p_deposit_id: string };
        Returns: { out_status: string; out_message: string }[];
      };
      admin_reject_deposit: {
        Args: { p_deposit_id: string; p_reason?: string | null };
        Returns: { out_status: string; out_message: string }[];
      };
      admin_set_loan_cibil_score: {
        Args: { p_loan_id: string; p_score: number };
        Returns: { out_status: string; out_message: string }[];
      };
      admin_approve_loan: {
        Args: { p_loan_id: string };
        Returns: { out_status: string; out_message: string }[];
      };
      admin_reject_loan: {
        Args: { p_loan_id: string; p_reason?: string | null };
        Returns: { out_status: string; out_message: string }[];
      };
    };
  };
}
