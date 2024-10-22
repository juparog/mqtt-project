import { IAgent, IDevice, ResponseBaseDto } from '@kuiiksoft/common';
import { ApiProperty } from '@nestjs/swagger';

export class AgentResponseDto
  extends ResponseBaseDto
  implements Omit<IAgent, 'token' | 'createdAt' | 'updatedAt'>
{
  constructor(agent: Omit<IAgent, 'password'>) {
    super({
      id: agent.id,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      isActive: agent.isActive,
    });
    this.name = agent.name;
    this.description = agent.description;
    this.userId = agent.userId;
    this.devices = agent.devices;
    if (agent.token) {
      this.token = agent.token;
    }
  }

  @ApiProperty({
    description: 'Agent name',
    example: 'Agent 1',
  })
  name: string;

  @ApiProperty({
    description: 'Agent description',
    example: 'Agent 1 description',
  })
  description: string;

  @ApiProperty({
    description: 'Agent token (only in agent creation)',
    example: 'at_1234567890',
    required: false,
  })
  token?: string;

  @ApiProperty({
    description: 'Agent user id',
    example: '236fff90-6cdb-415c-8dcb-978ad01543f5',
  })
  userId: string;

  @ApiProperty({
    description: 'Agent devices',
    example: [],
    required: false,
  })
  devices?: IDevice[];
}
