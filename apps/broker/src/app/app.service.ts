import {
  Client,
  Function,
  OnClient,
  OnClientDisconnect,
  OnHeartBeat,
  OnPreConnect,
  OnPublish,
  Packet,
  Payload,
  Topic,
} from '@kuiiksoft/shared/mqtt-broker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
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
