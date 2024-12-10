export interface IDatabaseConfigAttributes {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number | string;
  dialect?: string;
  urlDatabase?: string;
  logging?: boolean;
  ssl?: boolean;
}

export interface IDatabaseConfig {
  dev: IDatabaseConfigAttributes;
  stage: IDatabaseConfigAttributes;
  prod: IDatabaseConfigAttributes;
}
