import { IUser } from '@kuiiksoft/common';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth';
import { AgentService } from './agent.service';
import {
  AgentPaginatedDto,
  AgentPaginationDto,
  AgentResponseDto,
  CreateAgentDto,
  RegenerateTokenResponseDto,
} from './dtos';

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

  @Patch(':id/regenerate-token')
  async regenerateToken(
    @Param('id') id: string
  ): Promise<RegenerateTokenResponseDto> {
    const newToken = await this.agentService.regenerateAgentToken(id);
    return new RegenerateTokenResponseDto({
      agentId: id,
      newToken,
    });
  }

  @Get()
  async listAgents(
    @Query() query: AgentPaginationDto,
    @CurrentUser() user: IUser
  ): Promise<AgentPaginatedDto> {
    const [agents, count] = await this.agentService.listPaginated(
      user.id,
      query
    );
    return new AgentPaginatedDto({
      ...query,
      count,
      data: agents.map((agent) => new AgentResponseDto(agent)),
    });
  }
}
