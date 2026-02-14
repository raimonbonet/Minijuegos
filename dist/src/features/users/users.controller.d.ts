import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    updateProfile(req: any, body: {
        nombre?: string;
        apellidos?: string;
        fechaNacimiento?: string;
        dni?: string;
        sexo?: string;
    }): Promise<{
        id: string;
        email: string;
        username: string;
        password: string | null;
        googleId: string | null;
        nombre: string | null;
        apellidos: string | null;
        fechaNacimiento: Date | null;
        sexo: string | null;
        Zoins: import("@prisma/client-runtime-utils").Decimal;
        isAdmin: boolean;
        membership: import("@prisma/client").$Enums.MembershipType;
        dailyGamesPlayed: number;
        lastDailyReset: Date;
        profileCompleted: boolean;
        isFrozen: boolean;
        dni: string | null;
        affiliateName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(req: any, body: {
        password: string;
        currentPassword?: string;
    }): Promise<{
        message: string;
    }>;
}
