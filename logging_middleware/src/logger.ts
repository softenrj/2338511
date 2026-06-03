import { LogLevel, AllowedPackage, LogPayload, LogConfig } from './types.js';

export class CentralLogger {
  private serverUrl: string;
  private authToken: string;

  constructor(config: LogConfig) {
    this.authToken = config.authToken;
    this.serverUrl = config.serverUrl || 'http://localhost:3000/log';

    if (!config.authToken) {
      console.warn('[CentralLogger Warning] Token missing. Remote sync calls will fail validation.');
    }
  }


  public async log(level: LogLevel, pkg: AllowedPackage, message: string): Promise<void> {
    const payload: LogPayload = {
      stack: 'frontend',
      level: level.toLowerCase() as LogLevel,
      package: pkg.toLowerCase() as AllowedPackage,
      message: message || 'No descriptive logs provided'
    };

    // act as a logger print in console , select method first like log or error and then it attach it to console[method] as console.log
    const consoleMethod = level === 'fatal' || level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[LOCAL LOG] [${level.toUpperCase()}] [package: ${pkg}]: ${message}`);

    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error(`[Remote Sync Failed] HTTP Status ${response.status}`, errorBody);
        return;
      }

      const data = await response.json();
      console.log(`[Remote Sync Success] Log ID verified: ${data.logID}`);
    } catch (netError) {
      console.error('[Remote Sync Exception] Target evaluation server unreachable:', netError);
    }
  }

  public debug(pkg: AllowedPackage, msg: string) {
    return this.log('debug', pkg, msg);
  }
  public info(pkg: AllowedPackage, msg: string) {
    return this.log('info', pkg, msg);
  }
  public warn(pkg: AllowedPackage, msg: string) {
    return this.log('warn', pkg, msg);
  }
  public error(pkg: AllowedPackage, msg: string) {
    return this.log('error', pkg, msg);
  }
  public fatal(pkg: AllowedPackage, msg: string) {
    return this.log('fatal', pkg, msg);
  }
}
