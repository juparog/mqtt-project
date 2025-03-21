import {
  generateCode,
  PaginationService,
  stringToBoolean,
} from '@kuiiksoft/common';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity } from './agent.entity';
import { AgentPaginationDto, AuthenticateDto, CreateAgentDto } from './dtos';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    private readonly paginationService: PaginationService
  ) {}

  async create(
    userId: string,
    createAgentDto: CreateAgentDto
  ): Promise<AgentEntity> {
    const existingAgent = await this.agentRepository.findOne({
      where: { name: createAgentDto.name, userId },
    });
    if (existingAgent) {
      throw new ConflictException('Agent name already in use by user');
    }

    const token = this.generateToken();
    const agent = AgentEntity.create({
      name: createAgentDto.name,
      description: createAgentDto.description,
      user: { id: userId },
      token,
    });
    const savedAgent = await this.agentRepository.save(agent);
    savedAgent.token = token;
    return savedAgent;
  }

  async listPaginated(
    userId: string,
    query: AgentPaginationDto
  ): Promise<[AgentEntity[], number]> {
    return this.paginationService.paginate<AgentEntity>(this.agentRepository, {
      ...query,
      userId,
      isActive: stringToBoolean(query.isActive || 'true'),
    });
  }

  async regenerateAgentToken(agentId: string): Promise<string> {
    const agent = await this.agentRepository.findOneBy({ id: agentId });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const newToken = this.generateToken();
    agent.token = newToken;
    await this.agentRepository.save(agent);

    return newToken;
  }

  async authenticate(authenticateDto: AuthenticateDto): Promise<boolean> {
    const agent = await this.agentRepository.findOne({
      where: { id: authenticateDto.agentId },
      select: ['token'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent.compareToken(authenticateDto.token, agent.token);
  }

  private generateToken(): string {
    return generateCode('at_');
  }
}
