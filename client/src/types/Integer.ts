class Integer {
  static shortDescription() {
    return "integer"
  }

  static longDescription() {
    return "INTEGER, a non-fractional number like 1, 2, 3, 4"
  }

  static valid(output: any): boolean {
    var parsed
    try {
      parsed = JSON.parse(output)
    } catch {
      return false
    }
    return this.asIntEvaluator(parsed)
  }

  private static asIntEvaluator(item: any) {
    if (Number.isInteger(item)) {
      return true;
    }
    return false;
  }

  static placeholderText(): string {
    return ""
  }

  static parse(input: any): number {
    var parsed
    try {
      parsed = parseInt(input)
    } catch {
      return 0
    }
    return parsed
  }

  static areEquivalent(first: any, second: any): boolean {
    return this.parse(first) === this.parse(second)
  }

  static displayString(member: number): string {
    return member.toString()
  }

  static dbString(member: number): string {
    return member.toString()
  }
}

export default Integer