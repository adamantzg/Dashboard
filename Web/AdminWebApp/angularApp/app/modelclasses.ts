
export class PasswordChange {
    id: string;
    code: string;
    password: string;
    password2: string;
}

export class Registration {
    registrationCode: string;
    username: string;
    password: string;
    password2: string;
    id: number;
}

export class LoginData {
    username: string;
    password: string;
}

export enum GlobalCommandsEnum {
    SwitchDashboardEdit
}
