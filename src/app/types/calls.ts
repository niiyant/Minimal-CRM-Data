export interface Call {
  id: string;
  id_contact: string;
  full_name: string;
  location_name: string;
  phone_start_time: string;
  phone_duration: number;
  phone_call_status: string;
  phone_direction: "inbound" | "outbound";
  phone_number: string;
  created_at: string;
  updated_at: string;
}
