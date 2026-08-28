<?php

declare(strict_types=1);

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super_admin';
    case HospitalAdmin = 'hospital_admin';
    case Doctor = 'doctor';
    case Nurse = 'nurse';
    case Receptionist = 'receptionist';
    case Pharmacist = 'pharmacist';
    case LabStaff = 'lab_staff';
    case Radiologist = 'radiologist';
    case Accountant = 'accountant';
    case Patient = 'patient';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::HospitalAdmin => 'Hospital Admin',
            self::Doctor => 'Doctor',
            self::Nurse => 'Nurse',
            self::Receptionist => 'Receptionist',
            self::Pharmacist => 'Pharmacist',
            self::LabStaff => 'Lab Staff',
            self::Radiologist => 'Radiologist',
            self::Accountant => 'Accountant',
            self::Patient => 'Patient',
        };
    }

    public static function hospitalStaffRoles(): array
    {
        return [
            self::HospitalAdmin,
            self::Doctor,
            self::Nurse,
            self::Receptionist,
            self::Pharmacist,
            self::LabStaff,
            self::Radiologist,
            self::Accountant,
        ];
    }

    public static function manageableStaffRoles(): array
    {
        return array_values(array_filter(
            self::hospitalStaffRoles(),
            fn (self $role) => $role !== self::HospitalAdmin,
        ));
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
