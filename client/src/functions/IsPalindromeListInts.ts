import ListOfInteger from "../types/ListOfInteger"
import Bool from "../types/Bool"

class IsPalindromeListInts {
  static numArgs = 1

  static description(): string {
    return "IsPalindromeListInts"
  }

  static function(items: number[]): boolean {
    var firstEnd = 0
    var secondEnd = items.length - 1

    while (firstEnd < secondEnd) {
      if (items[firstEnd] !== items[secondEnd]) {
        return false
      }
      firstEnd++
      secondEnd--
    }

    return true
  }

  static inputGenerators(): Function[] {
    return [() => { return [2, 9, -1, 9, 2] }, () => { return [9, -1, 9] }, () => { return [10, -1, 3, 2] }, () => { return [-4, -4, -4, -4, -4] }, () => { return [9967] }]
  }

  static answerText(): string {
    return "This function returns whether or not the input list is palindromic - if the reverse would not be different from the original.";
  }

  static inputPlaceHolderText(): string {
    return ListOfInteger.placeholderText()
  }

  static outputPlaceHolderText(): string {
    return Bool.placeholderText()
  }

  static inputDescription(): string {
    return ListOfInteger.longDescription()
  }

  static outputDescription(): string {
    return Bool.longDescription()
  }

  static validInput(input: any): boolean {
    return ListOfInteger.valid(input)
  }

  static validOutput(out: any): boolean {
    return Bool.valid(out)
  }

  static parseInput(input: any): any[] {
    return ListOfInteger.parse(input)
  }

  static parseOutput(output: any): boolean {
    return Bool.parse(output);
  }

  static equivalentOutputs(first: any, second: any): boolean {
    return Bool.areEquivalent(first, second)
  }

  static inputDisplayStr(input: number[]): string {
    return ListOfInteger.displayString(input)
  }

  static outputDisplayStr(output: boolean): string {
    return Bool.displayString(output)
  }

  static inputDBStr(input: number[]): string {
    return ListOfInteger.dbString(input)
  }

  static outputDBStr(output: boolean): string {
    return Bool.dbString(output)
  }
}

export default IsPalindromeListInts