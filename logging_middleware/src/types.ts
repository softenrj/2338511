export type LogStack = 'frontend' | 'backend';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';

export type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';

export type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';

export type AllowedPackage = FrontendPackage | SharedPackage | BackendPackage;

export interface LogPayload {
  stack: LogStack;
  level: LogLevel;
  package: AllowedPackage;
  message: string;
}

export interface LogConfig {
  authToken: string;
  serverUrl?: string;
}
