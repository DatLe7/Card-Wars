import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  Response,
  Route,
  Security,
  SuccessResponse,
  TsoaResponse,
} from 'tsoa';
import { LoginRequest, SignupRequest } from '.';
import { AuthService, createJwt } from './service';
import type * as express from 'express';
import { SessionUser } from '../types/express';

const AUTH_COOKIE_OPTIONS = 'HttpOnly; Secure; SameSite=Lax; Path=/; max-age=2592000';

@Route('auth')
export class AuthController extends Controller {
  @Get('me')
  @SuccessResponse('200', 'Authenticated user')
  @Response('401', 'Authentication required')
  @Security('cookie')
  public async me(
    @Request() request: express.Request,
  ): Promise<SessionUser> {
    return request.user;
  }

  @Post('signup')
  @SuccessResponse('201', 'User created')
  @Response('400', 'Invalid signup details or username in use')
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
  @Response('400', 'Invalid login details')
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
