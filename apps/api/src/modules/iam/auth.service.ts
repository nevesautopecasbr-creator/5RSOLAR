import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
  permissions: string[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private getAccessTtlMinutes() {
    return Number(process.env.JWT_ACCESS_MINUTES ?? 15);
  }

  private getRefreshTtlDays() {
    return Number(process.env.JWT_REFRESH_DAYS ?? 7);
  }

  private getRefreshSecret() {
    return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "change-me";
  }

  private async issueTokens(userId: string, email: string): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      { expiresIn: `${this.getAccessTtlMinutes()}m` },
    );

    const refreshTokenId = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, tokenId: refreshTokenId },
      {
        secret: this.getRefreshSecret(),
        expiresIn: `${this.getRefreshTtlDays()}d`,
      },
    );
    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(
          Date.now() + this.getRefreshTtlDays() * 24 * 60 * 60 * 1000,
        ),
      },
    });

    return { accessToken, refreshToken };
  }

  private async resolvePermissions(userId: string, companyId?: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        ...(companyId ? { companyId } : {}),
      },
      include: { role: { include: { grants: { include: { permission: true } } } } },
    });

    const permissions = new Set<string>();
    for (const userRole of userRoles) {
      for (const grant of userRole.role.grants) {
        if (!companyId || !grant.permission.companyId || grant.permission.companyId === companyId) {
          permissions.add(grant.permission.name);
        }
      }
    }

    return Array.from(permissions).sort();
  }

  private async buildSessionUser(
    user: { id: string; name: string; email: string },
    companyId?: string,
  ): Promise<SessionUser> {
    const permissions = await this.resolvePermissions(user.id, companyId);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      permissions,
    };
  }

  async login(email: string, password: string, companyId?: string) {
    const emailHasAt = email.includes("@");
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || !user.isActive) {
        throw new UnauthorizedException("Credenciais inválidas");
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException("Credenciais inválidas");
      }

      const tokens = await this.issueTokens(user.id, user.email);
      const sessionUser = await this.buildSessionUser(
        { id: user.id, name: user.name, email: user.email },
        companyId,
      );
      return {
        ...tokens,
        user: sessionUser,
      };
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7c7a3af8-2979-4f40-9dcc-4e60fdd8a2be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'modules/iam/auth.service.ts:78',message:'auth_login_error',data:{name:(error as Error)?.name,message:(error as Error)?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'L6'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  async register(name: string, email: string, phone: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email já cadastrado");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        isActive: true,
      },
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  async refresh(refreshToken: string, companyId?: string) {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      tokenId: string;
    }>(refreshToken, { secret: this.getRefreshSecret() });

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
    });

    if (
      !stored ||
      stored.userId !== payload.sub ||
      stored.revokedAt ||
      stored.expiresAt < new Date()
    ) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    const matches = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (!matches) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException("Usuário inválido");
    }

    const tokens = await this.issueTokens(user.id, user.email);
    const sessionUser = await this.buildSessionUser(
      { id: user.id, name: user.name, email: user.email },
      companyId,
    );
    return {
      ...tokens,
      user: sessionUser,
    };
  }

  async logout(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      tokenId: string;
    }>(refreshToken, { secret: this.getRefreshSecret() });

    await this.prisma.refreshToken.updateMany({
      where: { id: payload.tokenId, userId: payload.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async me(userId: string, companyId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Usuário inválido");
    }

    return this.buildSessionUser(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      companyId,
    );
  }
}
