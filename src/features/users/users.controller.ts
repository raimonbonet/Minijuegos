import { Controller, Put, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    async updateProfile(@Request() req, @Body() body: { nombre?: string; apellidos?: string; fechaNacimiento?: string; dni?: string; sexo?: string; address?: string; postalCode?: string; city?: string; province?: string }) {
        return this.usersService.updateProfile(req.user.userId, {
            nombre: body.nombre,
            apellidos: body.apellidos,
            fechaNacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento) : undefined,
            dni: body.dni,
            sexo: body.sexo,
            address: body.address,
            postalCode: body.postalCode,
            city: body.city,
            province: body.province,
            profileCompleted: true // If they update, we assume generic completion
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Request() req, @Body() body: { password: string; currentPassword?: string }) {
        if (!body.password || body.password.length < 6) {
            throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres');
        }

        const user = await this.usersService.findOne(req.user.userId);
        if (!user) throw new BadRequestException('Usuario no encontrado');

        // If user has a password, verify current password
        if (user.password) {
            if (!body.currentPassword) {
                throw new BadRequestException('Debes introducir tu contraseña actual');
            }
            const isMatch = await bcrypt.compare(body.currentPassword, user.password);
            if (!isMatch) {
                throw new BadRequestException('La contraseña actual es incorrecta');
            }
        }

        const hash = await bcrypt.hash(body.password, 10);
        await this.usersService.changePassword(req.user.userId, hash);
        return { message: 'Contraseña actualizada correctamente' };
    }
}
