export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
};

export const validateName = (name: string): boolean => {
    return name.trim().length > 0;
};

export interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
}

export const validateUserForm = (values: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!validateName(values.firstName)) {
        errors.firstName = 'First name is required';
    }

    if (!validateName(values.lastName)) {
        errors.lastName = 'Last name is required';
    }

    if (!values.phone) {
        errors.phone = 'Phone number is required';
    } else if (!validatePhone(values.phone)) {
        errors.phone = 'Phone must be exactly 10 digits';
    }

    if (!values.email) {
        errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
        errors.email = 'Invalid email format';
    }

    return errors;
};