export interface Credentials {
    localId: string;
    expiresIn: number;
    accessToken: string;
    refreshToken?: string;
}