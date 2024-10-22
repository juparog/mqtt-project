import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity } from './agent.entity';
import { CreateAgentDto } from './dtos';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>
  ) {}

  async create(
    userId: string,
    createAgentDto: CreateAgentDto
  ): Promise<AgentEntity> {
    const existingAgent = await this.agentRepository.findOne({
      where: { name: createAgentDto.name, userId },
    });
    if (existingAgent) {
      throw new ConflictException('Agent name already in use');
    }

    const agent = AgentEntity.create({
      name: createAgentDto.name,
      description: createAgentDto.description,
      user: { id: userId },
    });
    return this.agentRepository.save(agent);
  }
}
