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
        address?: string;
        postalCode?: string;
        city?: string;
        province?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        username: string;
        googleId: string | null;
        dni: string | null;
        password: string | null;
        nombre: string | null;
        apellidos: string | null;
        fechaNacimiento: Date | null;
        sexo: string | null;
        Zoins: import("@prisma/client-runtime-utils").Decimal;
        isAdmin: boolean;
        membership: import("@prisma/client").$Enums.MembershipType;
        dailyGamesLeft: number;
        extraGames: number;
        lastDailyReset: Date;
        profileCompleted: boolean;
        isFrozen: boolean;
        address: string | null;
        postalCode: string | null;
        city: string | null;
        province: string | null;
        affiliateName: string | null;
        updatedAt: Date;
    }>;
    changePassword(req: any, body: {
        password: string;
        currentPassword?: string;
    }): Promise<{
        message: string;
    }>;
}
