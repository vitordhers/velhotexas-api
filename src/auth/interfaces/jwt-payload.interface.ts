export interface JwtPayload {
    id: string;
    role: string;
    access: string;
    iat?: number;
    exp?: number;
}