export type Role =
    | 'super_admin'
    | 'hospital_admin'
    | 'doctor'
    | 'nurse'
    | 'receptionist'
    | 'pharmacist'
    | 'lab_staff'
    | 'radiologist'
    | 'accountant'
    | 'patient';

export type User = {
    id: number;
    tenant_id: string | null;
    name: string;
    email: string;
    role: Role;
    phone?: string | null;
    avatar?: string | null;
    gender?: 'male' | 'female' | 'other' | null;
    date_of_birth?: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type Tenant = {
    id: string;
    name: string;
    slug: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    website: string | null;
    logo: string | null;
    is_active: boolean;
    users_count?: number;
    created_at: string;
    updated_at: string;
};

export type DashboardStat = {
    label: string;
    value: number;
    icon: string;
};

// Phase 2 types
export type Patient = {
    id: number;
    mrn: string;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    blood_type: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    nationality: string | null;
    marital_status: string | null;
    occupation: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    insurance_provider: string | null;
    insurance_policy_number: string | null;
    insurance_expiry: string | null;
    is_active: boolean;
    allergies?: PatientAllergy[];
    chronic_diseases?: PatientChronicDisease[];
    documents?: PatientDocument[];
    appointments?: Appointment[];
    created_at: string;
    updated_at: string;
};

export type PatientAllergy = {
    id: number;
    patient_id: number;
    allergen: string;
    reaction: string | null;
    severity: 'mild' | 'moderate' | 'severe';
    created_at: string;
};

export type PatientChronicDisease = {
    id: number;
    patient_id: number;
    condition_name: string;
    icd10_code: string | null;
    diagnosed_at: string | null;
    managing_doctor: string | null;
    notes: string | null;
    created_at: string;
};

export type PatientDocument = {
    id: number;
    patient_id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    description: string | null;
    created_at: string;
};

export type Department = {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    is_active: boolean;
};

export type Specialization = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
};

export type DoctorSchedule = {
    id: number;
    doctor_id: number;
    day_of_week: number;
    day_name: string;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    is_active: boolean;
};

export type Doctor = {
    id: number;
    user_id: number;
    full_name: string;
    license_number: string | null;
    consultation_fee: string;
    bio: string | null;
    qualification: string | null;
    experience_years: number;
    is_available: boolean;
    user?: User;
    department?: Department | null;
    specialization?: Specialization | null;
    schedules?: DoctorSchedule[];
    appointments?: Appointment[];
    created_at: string;
    updated_at: string;
};

export type Appointment = {
    id: number;
    appointment_number: string;
    patient_id: number;
    doctor_id: number;
    department_id: number | null;
    scheduled_at: string;
    duration_minutes: number;
    type: 'in_person' | 'telemedicine';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    chief_complaint: string | null;
    notes: string | null;
    cancellation_reason: string | null;
    confirmed_at: string | null;
    cancelled_at: string | null;
    patient?: Patient;
    doctor?: Doctor;
    department?: Department | null;
    booked_by_user?: User | null;
    created_at: string;
    updated_at: string;
};

export type PaginatedResult<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

// Phase 3 types

export type MedicalRecord = {
    id: number;
    record_number: string;
    patient_id: number;
    doctor_id: number;
    appointment_id: number | null;
    visit_date: string;
    visit_type: 'outpatient' | 'inpatient' | 'emergency' | 'follow_up' | 'telemedicine';
    chief_complaint: string | null;
    history_of_present_illness: string | null;
    past_medical_history: string | null;
    physical_examination: string | null;
    assessment: string | null;
    plan: string | null;
    notes: string | null;
    status: 'draft' | 'finalized' | 'amended';
    finalized_at: string | null;
    patient?: Patient;
    doctor?: Doctor;
    appointment?: Appointment | null;
    vitals?: Vitals | null;
    diagnoses?: Diagnosis[];
    prescriptions?: Prescription[];
    created_at: string;
    updated_at: string;
};

export type Vitals = {
    id: number;
    medical_record_id: number;
    patient_id: number;
    temperature: string | null;
    pulse_rate: number | null;
    respiratory_rate: number | null;
    systolic_bp: number | null;
    diastolic_bp: number | null;
    oxygen_saturation: string | null;
    weight: string | null;
    height: string | null;
    bmi: string | null;
    blood_glucose: number | null;
    notes: string | null;
    recorded_at: string;
};

export type Diagnosis = {
    id: number;
    medical_record_id: number;
    patient_id: number;
    icd10_code: string | null;
    diagnosis_name: string;
    type: 'primary' | 'secondary' | 'differential';
    notes: string | null;
    created_at: string;
};

export type Prescription = {
    id: number;
    prescription_number: string;
    medical_record_id: number;
    patient_id: number;
    doctor_id: number;
    prescribed_date: string;
    expiry_date: string | null;
    status: 'active' | 'dispensed' | 'cancelled' | 'expired';
    notes: string | null;
    items?: PrescriptionItem[];
    created_at: string;
};

export type PrescriptionItem = {
    id: number;
    prescription_id: number;
    medication_name: string;
    generic_name: string | null;
    dosage: string;
    frequency: string;
    route: string | null;
    duration_days: number | null;
    quantity: number | null;
    instructions: string | null;
};

export type LabTest = {
    id: number;
    code: string;
    name: string;
    category: string | null;
    unit: string | null;
    normal_range: string | null;
    price: string;
    turnaround_hours: number;
    is_active: boolean;
};

export type LabOrder = {
    id: number;
    order_number: string;
    patient_id: number;
    doctor_id: number;
    medical_record_id: number | null;
    priority: 'routine' | 'urgent' | 'stat';
    status: 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
    ordered_date: string;
    sample_collected_at: string | null;
    completed_at: string | null;
    clinical_notes: string | null;
    patient?: Patient;
    doctor?: Doctor;
    results?: LabResult[];
    created_at: string;
};

export type LabResult = {
    id: number;
    lab_order_id: number;
    lab_test_id: number;
    result_value: string | null;
    unit: string | null;
    normal_range: string | null;
    flag: 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';
    notes: string | null;
    resulted_at: string | null;
    lab_test?: LabTest;
};

export type ImagingType = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    price: string;
    is_active: boolean;
};

export type RadiologyOrder = {
    id: number;
    order_number: string;
    patient_id: number;
    doctor_id: number;
    imaging_type_id: number;
    medical_record_id: number | null;
    body_part: string | null;
    priority: 'routine' | 'urgent' | 'stat';
    status: 'ordered' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    ordered_date: string;
    scheduled_at: string | null;
    completed_at: string | null;
    clinical_indication: string | null;
    report: string | null;
    images_path: string | null;
    patient?: Patient;
    doctor?: Doctor;
    imaging_type?: ImagingType;
    created_at: string;
};

export type Ward = {
    id: number;
    name: string;
    code: string;
    department_id: number | null;
    type: 'general' | 'private' | 'icu' | 'nicu' | 'maternity' | 'pediatric' | 'surgical' | 'psychiatric';
    total_beds: number;
    floor: string | null;
    is_active: boolean;
    beds?: Bed[];
    available_beds?: Bed[];
};

export type Bed = {
    id: number;
    bed_number: string;
    ward_id: number;
    type: 'standard' | 'icu' | 'isolation' | 'pediatric';
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    is_active: boolean;
    ward?: Ward;
};

export type Admission = {
    id: number;
    admission_number: string;
    patient_id: number;
    bed_id: number;
    ward_id: number;
    admitting_doctor_id: number;
    medical_record_id: number | null;
    admitted_at: string;
    discharged_at: string | null;
    status: 'admitted' | 'discharged' | 'transferred';
    admission_type: 'emergency' | 'elective' | 'transfer';
    diagnosis_on_admission: string | null;
    discharge_summary: string | null;
    discharge_condition: 'improved' | 'recovered' | 'referred' | 'against_advice' | 'deceased' | null;
    days_admitted?: number;
    patient?: Patient;
    admitting_doctor?: Doctor;
    bed?: Bed;
    ward?: Ward;
    medical_record?: MedicalRecord | null;
    created_at: string;
};

export type Medication = {
    id: number;
    code: string;
    brand_name: string;
    generic_name: string | null;
    category: string | null;
    dosage_form: string | null;
    strength: string | null;
    unit: string;
    quantity_in_stock: number;
    reorder_level: number;
    unit_price: string;
    expiry_date: string | null;
    requires_prescription: boolean;
    is_active: boolean;
};

