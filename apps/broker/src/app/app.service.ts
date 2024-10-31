import { IAuthAgentResult } from '@kuiiksoft/common';
import {
  Client,
  Credential,
  CredentialClient,
  DoneFunc,
  Function,
  OnAuthenticate,
  OnClient,
  OnClientDisconnect,
  OnHeartBeat,
  OnPreConnect,
  OnPublish,
  Packet,
  Payload,
  Topic,
} from '@kuiiksoft/shared/mqtt-broker';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private httpService: HttpService) {}

  @OnAuthenticate()
  async onAuthenticate(
    @Client() client,
    @Credential() credential: CredentialClient,
    @Function() done: DoneFunc
  ) {
    this.logger.debug(`Function: @OnAuthenticate() - clientId '${client.id}'`);
    try {
      const { username, password } = credential;
      const response = await this.httpService.axiosRef.post<IAuthAgentResult>(
        'http://localhost:8080/api/agent/authenticate',
        {
          agentId: username,
          token: credential.toString ? password.toString() : password,
        }
      );
      if (response.data.authenticated) {
        return done(null, true);
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      this.logger.error(
        `Function: @OnAuthenticate() - clientId '${client.id}' Error: ${error.message}`
      );
      return done(error, false);
    }
  }

  @OnPreConnect()
  onPreConnect(@Client() client, @Packet() packet, @Function() done) {
    console.log('Function: @onPreConnect()');
    return done(null, true);
  }

  @OnClientDisconnect()
  onClientDisconnect(@Client() client) {
    console.log('Function: @OnClientDisconnect()');
  }

  @OnPublish()
  OnPublish(@Topic() topic, @Packet() packet, @Payload('text') payload) {
    console.log('Function: @OnPublish() - Topic:', topic, 'Payload:', payload);
  }

  @OnClient()
  OnNewClient() {
    console.log('Function: @OnClient()');
  }

  @OnHeartBeat()
  OnHeartBeat(@Topic() topic) {
    console.log('Function: @OnHeartBeat() - Topic:', topic);
  }
}
