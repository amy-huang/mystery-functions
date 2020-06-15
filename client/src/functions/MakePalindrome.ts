import ListOfInteger from "../types/ListOfInteger"
import Integer from "../types/Integer"

class MakePalindrome {
  static numArgs = 1

  static description(): string {
    return "MakePalindrome"
  }

  static function(items: any[]): any[] {
    var newItems = Array.from(items)
    if (newItems.length < 2) {
      return newItems
    }
    var i = 0
    var j = newItems.length - 1
    while (i < j) {
      newItems[j] = newItems[i]
      i += 1
      j -= 1
    }
    return newItems
  }

  static inputGenerators(): Function[] {
    return [() => { return [333] }, () => { return [0, 0] }, () => { return [9, 9, 8] }]
  }

  static answerText(): string {
    return "This function transforms any list of items into a palindromic one by changing the second half of it to mirror the first. The output list is the same whether or not you reverse it.";
  }

  static inputPlaceHolderText(): string {
    return ListOfInteger.placeholderText()
  }

  static outputPlaceHolderText(): string {
    return ListOfInteger.placeholderText()
  }

  static inputDescription(): string {
    return ListOfInteger.longDescription()
  }

  static outputDescription(): string {
    return ListOfInteger.longDescription()
  }

  static validInput(input: any): boolean {
    return ListOfInteger.valid(input)
  }

  static validOutput(out: any): boolean {
    return ListOfInteger.valid(out)
  }

  static parseInput(input: any): any[] {
    return ListOfInteger.parse(input)
  }

  static parseOutput(output: any): any[] {
    return ListOfInteger.parse(output);
  }

  static equivalentOutputs(first: any[], second: any[]): boolean {
    return ListOfInteger.areEquivalent(first, second)
  }

  static inputDisplayStr(input: number[]): string {
    return ListOfInteger.displayString(input)
  }

  static outputDisplayStr(output: number[]): string {
    return ListOfInteger.displayString(output)
  }

  static inputDBStr(input: number[]): string {
    return ListOfInteger.dbString(input)
  }

  static outputDBStr(output: number[]): string {
    return ListOfInteger.dbString(output)
  }
}

export default MakePalindrome