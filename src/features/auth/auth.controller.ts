import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
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
        return this.authService.register(body.email, body.password, body.name);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Request() req) { }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleAuthRedirect(@Request() req) {
        return this.authService.googleLogin(req);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
