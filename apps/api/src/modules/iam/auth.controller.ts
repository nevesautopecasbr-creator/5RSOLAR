import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response, Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CompanyId } from "../../common/decorators/company-id.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("IAM")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @CompanyId() companyId?: string,
  ) {
    const result = await this.authService.login(dto.email, dto.password, companyId);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.phone, dto.password);
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CompanyId() companyId?: string,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return { user: null };
    }
    const result = await this.authService.refresh(refreshToken, companyId);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    this.clearAuthCookies(res);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: { sub: string; email: string }, @CompanyId() companyId?: string) {
    return this.authService.me(user.sub, companyId);
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const accessMinutes = Number(process.env.JWT_ACCESS_MINUTES ?? 15);
    const refreshDays = Number(process.env.JWT_REFRESH_DAYS ?? 7);
    const common = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    res.cookie("access_token", accessToken, {
      ...common,
      maxAge: accessMinutes * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
      ...common,
      maxAge: refreshDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
  }
}
