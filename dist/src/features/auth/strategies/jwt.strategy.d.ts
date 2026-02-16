import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: any): Promise<{
        email: any;
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
        userId: any;
    } | null>;
}
export {};
