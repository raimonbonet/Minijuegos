import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    register(body: any): Promise<{
        name: string | null;
        id: string;
        email: string;
        googleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any): Promise<"No user from google" | {
        message: string;
        user: {
            name: string | null;
            id: string;
            email: string;
            password: string | null;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    getProfile(req: any): any;
}
