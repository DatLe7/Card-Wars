import {Controller, Get, Post, Route, Security, SuccessResponse, Request, Response, Path} from 'tsoa';
import {Lobby} from '.';
import {LobbyService} from './service';

import * as express from 'express';

@Route('lobby')
export class LobbyController extends Controller {
  @Get()
	@SuccessResponse('200', 'All Lobbies')
  @Security('cookie')
  public async getAll(
    @Request() request: express.Request,
  ): Promise<Lobby[]> {
    return new LobbyService().getAll(request.user);
  }
	
	@Post()
	@SuccessResponse('201', 'Lobby Created')
	@Security('cookie')
  public async create(
		@Request() request: express.Request,
  ): Promise<Lobby> {
    return new LobbyService().create(request.user)
  }

	@Post('{lobbyId}/join')
	@SuccessResponse('200', 'Lobby Joined')
	@Response('404', 'Lobby Not Found')
	@Response('409', 'User Already Associated With Another Lobby')
	@Security('cookie')
	public async join(
		@Path() lobbyId: string,
		@Request() request: express.Request,
	): Promise<Lobby> {
	  return await new LobbyService().join(lobbyId, request.user);
	}
}
