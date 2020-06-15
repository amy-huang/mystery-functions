class Float {
  static shortDescription() {
    return "floating point number"
  }

  static longDescription() {
    return "FLOATING POINT NUMBER, represented by a number that can have a decimal point or not, like: 1, 3.5"
  }

  static valid(output: any): boolean {
    var parsed
    try {
      parsed = JSON.parse(output)
    } catch {
      return false
    }
    return this.asFloat(parsed)
  }

  private static asFloat(item: any) {
    if (typeof item === "number") {
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

export default Float