import {Controller, Get, Route, Security} from 'tsoa';
import {Lobby} from '.';
import {LobbyService} from './service';

@Route('lobby')
export class LobbyController extends Controller {
  @Get()
  @Security('cookie')
  public async getAll(): Promise<Lobby[]> {
    return new LobbyService().getAll();
  }
}
