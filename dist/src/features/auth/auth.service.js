"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const wallet_service_1 = require("../wallet/wallet.service");
const email_service_1 = require("../../shared/email/email.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    walletService;
    emailService;
    constructor(usersService, jwtService, walletService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.walletService = walletService;
        this.emailService = emailService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOneByEmail(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async googleLogin(req) {
        console.log('AuthService.googleLogin started', req.user);
        if (!req.user) {
            throw new common_1.InternalServerErrorException('No user from google');
        }
        let user = await this.usersService.findOneByGoogleId(req.user.googleId);
        let isNewUser = false;
        if (!user) {
            console.log('Creating new Google user...');
            user = await this.usersService.create({
                email: req.user.email,
                googleId: req.user.googleId,
                nombre: req.user.firstName,
                apellidos: req.user.lastName,
                username: `user_${req.user.googleId.substr(0, 8)}`,
                profileCompleted: false,
            });
            isNewUser = true;
            console.log('Creating wallet for new user:', user.id);
            await this.walletService.createWallet(user.id);
        }
        else if (!user.profileCompleted) {
            user = await this.usersService.updateProfile(user.id, { profileCompleted: true });
        }
        console.log('Google login successful:', user.id);
        return {
            message: 'User information from google',
            user,
            isNewUser,
            access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
        };
    }
    async getFullProfile(userId) {
        return this.usersService.findOne(userId);
    }
    async register(email, pass, username) {
        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            throw new common_1.InternalServerErrorException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(pass, 10);
        const verificationPayload = {
            email,
            username,
            passwordHash: hashedPassword,
            type: 'verification'
        };
        const token = this.jwtService.sign(verificationPayload, { expiresIn: '24h' });
        await this.emailService.sendVerificationEmail(email, username, token);
        return { message: 'Verification email sent' };
    }
    async verifyUser(token) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'verification') {
                throw new Error('Invalid token type');
            }
            const existingUser = await this.usersService.findOneByEmail(payload.email);
            if (existingUser) {
                return this.login(existingUser);
            }
            const user = await this.usersService.create({
                email: payload.email,
                password: payload.passwordHash,
                username: payload.username,
                nombre: null,
                apellidos: null,
                fechaNacimiento: null,
                sexo: null,
                dni: null,
                profileCompleted: false
            });
            await this.walletService.createWallet(user.id);
            return this.login(user);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Invalid or expired verification token');
        }
    }
    async completeProfile(userId, data) {
        const existingUser = await this.usersService.findOneByUsername(data.username);
        if (existingUser && existingUser.id !== userId) {
            throw new common_1.InternalServerErrorException('El nombre de usuario ya está en uso');
        }
        return this.usersService.updateProfile(userId, {
            ...data,
            profileCompleted: true
        });
    }
    async changeUsername(userId, newUsername) {
        const existingUser = await this.usersService.findOneByUsername(newUsername);
        if (existingUser && existingUser.id !== userId) {
            throw new common_1.InternalServerErrorException('El nombre de usuario ya está en uso');
        }
        return this.usersService.updateProfile(userId, {
            username: newUsername,
            profileCompleted: true
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        wallet_service_1.WalletService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map