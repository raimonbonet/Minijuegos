import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    register(body: any): Promise<{
        message: string;
    }>;
    verify(token: string): Promise<{
        access_token: string;
    }>;
    completeProfile(req: any, body: any): Promise<{
        id: string;
        email: string;
        username: string;
        googleId: string | null;
        dni: string | null;
        password: string | null;
        nombre: string | null;
        apellidos: string | null;
        fechaNacimiento: Date | null;
        sexo: string | null;
        creditos: import("@prisma/client-runtime-utils").Decimal;
        membership: boolean;
        affiliateName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any, res: any): Promise<void>;
    getProfile(req: any): any;
}
