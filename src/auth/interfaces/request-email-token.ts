import { UserStatus } from "src/shared/enums/user-status.enum";

export interface EmailTokenRequest {
    user: { _id: string, status: UserStatus, email: string, password: string };
    query: { token: string };
}