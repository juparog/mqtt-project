export interface ConfigProps {
  edgeAgent: EdgeAgentConfig;
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
