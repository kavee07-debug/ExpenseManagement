import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USERS } from '../data/mock-data';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(email: string, _password: string) {
    const user = USERS.find(u => u.email === email && u.isActive);
    if (!user) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

    const { passwordHash, ...safeUser } = user;
    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { data: { user: safeUser, token } };
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException();
    }
  }

  getMe(userId: string) {
    const user = USERS.find(u => u.id === userId);
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...safeUser } = user;
    return { data: safeUser };
  }
}
