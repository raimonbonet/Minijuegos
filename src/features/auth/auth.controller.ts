import { Controller, Post, UseGuards, Request, Get, Body, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard, GoogleAuthGuard, JwtAuthGuard } from './guards/auth.guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body.email, body.password, body.username);
    }

    @Post('verify')
    async verify(@Body('token') token: string) {
        return this.authService.verifyUser(token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('complete-profile')
    async completeProfile(@Request() req, @Body() body: any) {
        return this.authService.completeProfile(req.user.userId, {
            username: body.username,
            nombre: body.nombre,
            apellidos: body.apellidos,
            fechaNacimiento: new Date(body.fechaNacimiento),
            dni: body.dni,
            sexo: body.sexo,
            affiliateName: body.affiliateName
        });
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Request() req) { }

    @UseGuards(JwtAuthGuard)
    @Post('change-username')
    async changeUsername(@Request() req, @Body('username') username: string) {
        return this.authService.changeUsername(req.user.userId, username);
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req, @Response() res) {
        const result = await this.authService.googleLogin(req);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const token = result.access_token;
        const isNewUser = result.isNewUser;

        // Redirect to dashboard with welcome flag for new users
        if (isNewUser) {
            const userName = result.user.nombre || 'Usuario';
            res.redirect(`${frontendUrl}/?token=${token}&welcome=true&name=${encodeURIComponent(userName)}`);
        } else {
            res.redirect(`${frontendUrl}/?token=${token}`);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        const user = await this.authService.getFullProfile(req.user.userId);
        return user;
    }
}
