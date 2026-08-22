import { Body, Controller, Post, Route, SuccessResponse, Response, Res, TsoaResponse } from 'tsoa';
import { User } from '.';
import { createJwt } from '../auth/service';
import { UserService } from './service';

@Route('user')
export class UserController extends Controller {
  @Post('signup')
  @SuccessResponse('201', 'User created')
  @Response('409', 'Email in use')
  public async signup(
    @Body() user: User,
		@Res() setCookie: TsoaResponse<
      201,
      void,
      { 'Set-Cookie': string }
    >,
  ): Promise<void> {
    const created = await new UserService().create(user);

    if (!created) {
      this.setStatus(409);
      return;
    }

    const authToken = createJwt(created.id);

    return setCookie(201, undefined, {
      'Set-Cookie': `authToken=${encodeURIComponent(authToken)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800`,
    });
  }
}
