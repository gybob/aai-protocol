export class MetricsRegistry {
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  increment(name: string, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels);
    this.counters.set(key, (this.counters.get(key) || 0) + 1);
  }

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key)!.push(value);
  }

  private getKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return labelStr ? `${name}{${labelStr}}` : name;
  }

  export(): string {
    let output = '';

    for (const [key, value] of this.counters) {
      const metricName = key.split('{')[0];
      output += `# TYPE ${metricName} counter\n`;
      output += `${key} ${value}\n`;
    }

    for (const [key, values] of this.histograms) {
      const metricName = key.split('{')[0];
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      output += `# TYPE ${metricName} histogram\n`;
      output += `${key}_sum ${sum}\n`;
      output += `${key}_count ${count}\n`;
    }

    return output;
  }
}

export const metrics = new MetricsRegistry();
