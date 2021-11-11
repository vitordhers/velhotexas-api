export interface EmailJwtPayload {
    email: string;
    o: string,
    iat?: string;
    exp?: string
}