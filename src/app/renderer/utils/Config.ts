class Config {
  private static INSTANCE: Config;

  private cache: Record<string, unknown> | undefined;

  private constructor() {
    // empty
  }

  public static getInstance(): Config {
    if (!Config.INSTANCE) {
      Config.INSTANCE = new Config();
    }
    return Config.INSTANCE;
  }

  public async buildCache(): Promise<void> {
    this.cache = await window.app.getConfigCache();
  }

  public get(key: string): unknown {
    if (!this.cache) {
      throw new Error('Cache not initialized');
    }
    return this.cache[key];
  }

  public add(key: string, value: unknown): void {
    if (!this.cache) {
      throw new Error('Cache not initialized');
    }
    const current = this.cache[key];
    if (current instanceof Array) {
      current.push(value);
      this.cache[key] = current;
      window.app.setConfigData(key, current);
    } else if (current === undefined) {
      this.cache[key] = [value];
      window.app.setConfigData(key, [value]);
    }
  }

  public remove(key: string, value: unknown): void {
    if (!this.cache) {
      throw new Error('Cache not initialized');
    }
    const current = this.cache[key];
    if (current instanceof Array) {
      const idx = current.indexOf(value);
      if (idx > -1) {
        current.splice(idx, 1);
        this.cache[key] = current;
        window.app.setConfigData(key, current);
      }
    }
  }

  public set(key: string, value: unknown): void {
    if (!this.cache) {
      throw new Error('Cache not initialized');
    }
    this.cache[key] = value;
    window.app.setConfigData(key, value);
  }
}

export { Config };
