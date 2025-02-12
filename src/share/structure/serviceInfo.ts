type ServiceJson = {
  services: {
    name: string;
    description?: string;
    commands?: {
      name: string;
      description?: string;
      public?: string;
    }[];
  }[];
  id: string;
  description?: string;
};

export { ServiceJson };
