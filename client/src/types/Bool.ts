class Bool {
  static shortDescription() {
    return "boolean"
  }

  static longDescription() {
    return "BOOLEAN, represented by the words true or false exactly, with no capitalization"
  }

  static placeholderText(): string {
    return ""
  }

  static valid(member: any): boolean {
    var parsed
    try {
      parsed = JSON.parse(member)
    } catch {
      return false
    }
    if (typeof parsed !== "boolean") {
      return false
    }

    return true
  }

  static parse(input: any): boolean {
    var parsed
    try {
      parsed = JSON.parse(input)
    } catch {
      return false
    }
    return parsed
  }

  static areEquivalent(first: any, second: any): boolean {
    return this.parse(first) === this.parse(second)
  }

  static displayString(member: boolean): string {
    return member.toString()
  }

  static dbString(member: boolean): string {
    return member.toString()
  }
}

export default Bool