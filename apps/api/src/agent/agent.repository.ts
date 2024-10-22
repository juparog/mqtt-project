import { RepositoryBase } from '@kuiiksoft/common';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AgentEntity } from './agent.entity';

@Injectable()
export class AgentRepository extends RepositoryBase<AgentEntity> {
  constructor(manager: EntityManager) {
    super(AgentEntity, manager);
  }

  async createAgent(agent: Partial<AgentEntity>): Promise<AgentEntity> {
    const newAgent = this.create(agent);
    return this.save(newAgent);
  }
}
