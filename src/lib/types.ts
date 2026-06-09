export interface Course {
  id: number;
  nameAr: string;
  nameEn: string;
  icon: string;
  level: string;
  benefitAr: string;
  benefitEn: string;
  detailsAr?: string[];
  detailsEn?: string[];
  originalPrice: number;
  grantPrice: number;
}

export interface GrantCode {
  code: string;
  nameAr: string;
  nameEn: string;
  whatsappNumber: string;
  isActive: boolean;
  createdAt?: string;
}

export interface RegistrationInput {
  fullName: string;
  phone: string;
  age: number;
  courses: number[];
  totalPrice: number;
  firstInstallment: number;
  secondInstallment: number;
  grantCodeUsed?: string;
}

export interface Registration extends RegistrationInput {
  id?: string;
  registrationCode: string;
  createdAt?: string;
}

export interface CartItem {
  course: Course;
  selected: boolean;
}

export interface DiscountRule {
  count: number;
  discount: number;
}

export interface GrantOwnerNotification {
  whatsappUrl: string;
  phone: string;
  message: string;
}

export interface CodeRequestInput {
  fullName: string;
  phone: string;
  email: string;
}
