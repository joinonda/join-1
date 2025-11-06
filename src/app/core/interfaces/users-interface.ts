export interface User {

    id?: string;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptPrivacyPolicy: boolean;
}