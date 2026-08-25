import {
  Body,
  Controller,
  Post,
  Res,
  Response,
  Route,
  SuccessResponse,
  TsoaResponse,
} from 'tsoa';
import { LoginRequest, SignupRequest } from '.';
import { AuthService, createJwt } from './service';

const AUTH_COOKIE_OPTIONS = 'HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800';

@Route('auth')
export class AuthController extends Controller {
  @Post('signup')
  @SuccessResponse('201', 'User created')
  @Response('409', 'Email in use')
  public async signup(
    @Body() request: SignupRequest,
    @Res() setCookie: TsoaResponse<201, void, { 'Set-Cookie': string }>,
  ): Promise<void> {
    const authenticated = await new AuthService().signup(request);
    const jwt = createJwt(authenticated.id)
    return setCookie(201, undefined, {
      'Set-Cookie': `authToken=${encodeURIComponent(jwt)}; ${AUTH_COOKIE_OPTIONS}`
    });
  }

  @Post('login')
  @SuccessResponse('200', 'Logged in')
  @Response('401', 'Bad credentials')
  public async login(
    @Body() request: LoginRequest,
    @Res() setCookie: TsoaResponse<200, void, { 'Set-Cookie': string }>,
  ): Promise<void> {
    const authenticated = await new AuthService().login(request);
    const jwt = createJwt(authenticated.id)
    return setCookie(200, undefined, {
      'Set-Cookie': `authToken=${encodeURIComponent(jwt)}; ${AUTH_COOKIE_OPTIONS}`
    });
  }
}
