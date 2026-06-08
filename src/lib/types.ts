export interface Course {
  id: number;
  nameAr: string;
  nameEn: string;
  icon: string;
  level: string;
  benefitAr: string;
  benefitEn: string;
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

export interface Registration {
  id?: string;
  fullName: string;
  phone: string;
  age: number;
  courses: number[];
  totalPrice: number;
  firstInstallment: number;
  secondInstallment: number;
  registrationCode: string;
  grantCodeUsed: string;
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
