export default class JunoError {
    timestamp: string;
    status: string;
    error: string;
    details: [
        {
            field: string,
            message: string,
            errorCode: string
        }
    ];
    path: string;
}