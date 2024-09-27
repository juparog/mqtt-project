import {
  Client,
  Function,
  OnClientDisconnect,
  OnPreConnect,
  OnPublish,
  Packet,
  Payload,
  Topic,
} from '@kuiiksoft/mqtt-broker';
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
  OnPublish(
    @Topic() topic,
    @Packet() packet,
    @Payload('text') payload,
    @Client() client
  ) {
    console.log('Function: @OnPublish() - Topic:', topic, 'Payload:', payload);
  }
}
