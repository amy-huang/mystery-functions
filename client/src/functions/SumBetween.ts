import Integer from "../types/Integer";

// Need to show 2 input text fields and do checking on each
// # args property for each fcn needs to exist, and actual
// input put into fcn could be an array or json to support
// multiple inputs of differing types.
// process inputs fcn somehow...

class SumBetween {
  static inputType = Integer
  static numArgs = 2
  static outputType = Integer

  static description(): string {
    return "SumBetween"
  }

  static function(first: number, second: number): number {
    var sum = 0
    for (var num = first; num <= second; num++) {
      sum += num
    }
    return sum
  }

  static inputGenerators(): Function[] {
    return [() => { return [2, 5] }, () => { return [5, 2] }, () => { return [-2, 3] }]
  }

  static answerText(): string {
    return "This function returns the sum of the range of integers from the first of the input integers to the second one, inclusive. Given x and y, with x <= y, it would return x + x+1 + ... + y. If x > y, then the sum is 0."
  }

  static inputPlaceHolderText(): string {
    return this.inputType.placeholderText()
  }

  static outputPlaceHolderText(): string {
    return this.outputType.placeholderText()
  }

  static inputDescription(): string {
    return this.inputType.longDescription()
  }

  static outputDescription(): string {
    return this.outputType.longDescription()
  }

  static validInput(input: any): boolean {
    if (!this.inputType.valid(input)) {
      return false
    }
    return true
  }

  /* Should not have to touch functions below here! */

  static validOutput(input: any): boolean {
    return this.outputType.valid(input)
  }

  static parseInput(input: any): number {
    return this.inputType.parse(input)
  }

  static parseOutput(output: any): number {
    return this.outputType.parse(output);
  }

  static equivalentInputs(first: any, second: any): boolean {
    return this.inputType.areEquivalent(first, second)
  }

  static equivalentOutputs(first: any, second: any): boolean {
    return this.outputType.areEquivalent(first, second)
  }

  static inputDisplayStr(input: number): string {
    return this.inputType.displayString(input)
  }

  static outputDisplayStr(output: number): string {
    return this.outputType.displayString(output)
  }

  static inputDBStr(input: number): string {
    return this.inputType.dbString(input)
  }

  static outputDBStr(output: number): string {
    return this.outputType.dbString(output)
  }
}

export default SumBetween