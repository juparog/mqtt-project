export interface ConfigProps {
  edgeAgent: EdgeAgentConfig;
  broker: BrokerConfig;
}

export interface EdgeAgentConfig {
  broker: {
    url: string;
  };
  client: {
    id: string;
    token: string;

    qos: number;
  };
}

export interface BrokerConfig {
  port: number;
  id: string;
  transport: string;
  concurrency: number;
  queueLimit: number;
  maxClientsIdLength: number;
  connectTimeout: number;
  heartbeatInterval: number;
}
