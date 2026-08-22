<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        return [
            'mrn' => 'MRN-'.strtoupper($this->faker->unique()->bothify('######')),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'date_of_birth' => $this->faker->dateTimeBetween('-80 years', '-1 year')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'blood_type' => $this->faker->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'phone' => '+675 '.$this->faker->numerify('7### ####'),
            'email' => $this->faker->optional(0.4)->safeEmail(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->randomElement([
                'Port Moresby', 'Lae', 'Mount Hagen', 'Goroka', 'Madang',
                'Kokopo', 'Wewak', 'Kimbe', 'Alotau', 'Mendi',
                'Popondetta', 'Daru', 'Kavieng', 'Vanimo', 'Kerema',
            ]),
            'country' => 'Papua New Guinea',
            'nationality' => 'Papua New Guinean',
            'marital_status' => $this->faker->randomElement(['single', 'married', 'divorced', 'widowed']),
            'occupation' => $this->faker->jobTitle(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'emergency_contact_relationship' => $this->faker->randomElement(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend']),
            'is_active' => true,
        ];
    }
}
