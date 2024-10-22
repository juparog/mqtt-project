import { IUser } from '@kuiiksoft/common';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth';
import { AgentService } from './agent.service';
import { AgentResponseDto, CreateAgentDto } from './dtos';

@ApiTags('agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  async createUser(
    @Body() createAgentDto: CreateAgentDto,
    @CurrentUser() user: IUser
  ): Promise<AgentResponseDto> {
    const agentCreated = await this.agentService.create(
      user.id,
      createAgentDto
    );
    return new AgentResponseDto(agentCreated);
  }
}
