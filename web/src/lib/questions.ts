export const ARENA_QUESTIONS = [
  // Javascript Questions
  {
    language: "javascript",
    title: "Reverse a string",
    difficulty: "Easy",
    description: "Write a function reverseString(str) that returns the string reversed. e.g. reverseString('hello') → 'olleh'",
    stub: "function reverseString(str) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "FizzBuzz",
    difficulty: "Easy",
    description: "Write a function fizzBuzz(n) that returns an array of numbers 1–n, replacing multiples of 3 with 'Fizz', 5 with 'Buzz', and both with 'FizzBuzz'.",
    stub: "function fizzBuzz(n) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "Find duplicates in array",
    difficulty: "Easy",
    description: "Write a function findDuplicates(arr) that returns an array of elements that appear more than once. e.g. [1,2,2,3,3,4] → [2,3]",
    stub: "function findDuplicates(arr) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "Count vowels",
    difficulty: "Easy",
    description: "Write a function countVowels(str) that returns the number of vowels (a,e,i,o,u) in a string.",
    stub: "function countVowels(str) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "Flatten one level",
    difficulty: "Easy",
    description: "Write a function flattenOne(arr) that flattens an array one level deep without using Array.flat(). e.g. [[1,2],[3,4]] → [1,2,3,4]",
    stub: "function flattenOne(arr) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "Group by property",
    difficulty: "Medium",
    description: "Write a function groupBy(arr, key) that groups an array of objects by a given key. e.g. groupBy([{type:'a'},{type:'b'},{type:'a'}], 'type') → {a:[...], b:[...]}",
    stub: "function groupBy(arr, key) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "Debounce function",
    difficulty: "Medium",
    description: "Implement a debounce(fn, delay) function that returns a debounced version of fn — calling the returned function multiple times only fires fn after delay ms of inactivity.",
    stub: "function debounce(fn, delay) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "Deep clone an object",
    difficulty: "Medium",
    description: "Write a function deepClone(obj) that returns a deep copy of a plain JS object (with nested objects/arrays) without using JSON.parse/JSON.stringify.",
    stub: "function deepClone(obj) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "Promise.all from scratch",
    difficulty: "Medium",
    description: "Implement myPromiseAll(promises) that behaves like Promise.all — resolves with all results in order, rejects if any promise rejects.",
    stub: "function myPromiseAll(promises) {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "javascript",
    title: "LRU Cache",
    difficulty: "Medium",
    description: "Implement a class LRUCache(capacity) with get(key) and put(key, value) methods. Evict the least recently used item when capacity is exceeded.",
    stub: "class LRUCache {\n  constructor(capacity) {\n    // Initialize cache\n  }\n\n  get(key) {\n    // Write your code here...\n  }\n\n  put(key, value) {\n    // Write your code here...\n  }\n}\n"
  },

  // Solidity Questions
  {
    language: "solidity",
    title: "Store and retrieve a value",
    difficulty: "Easy",
    description: "Write a contract SimpleStorage with a uint256 variable storedValue. Add set(uint256 val) and get() functions to update and return it.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract SimpleStorage {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "Check even or odd",
    difficulty: "Easy",
    description: "Write a pure function isEven(uint256 n) returns (bool) that returns true if n is even, false otherwise.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract MathHelper {\n  function isEven(uint256 n) public pure returns (bool) {\n    // Write your code here...\n  }\n}\n"
  },
  {
    language: "solidity",
    title: "Ether piggy bank",
    difficulty: "Easy",
    description: "Write a contract PiggyBank where anyone can deposit() ether. Only the owner (set in constructor) can withdraw() the full balance.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract PiggyBank {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "Counter with events",
    difficulty: "Easy",
    description: "Write a contract Counter with increment(), decrement(), and reset() functions. Emit a CountChanged(uint256 newValue) event on every change.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract Counter {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "Whitelist mapping",
    difficulty: "Easy",
    description: "Write a contract Whitelist where the owner can addAddress(address) and removeAddress(address). Add a view function isWhitelisted(address) returns (bool).",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract Whitelist {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "ERC20 token — manual",
    difficulty: "Medium",
    description: "Implement a minimal ERC20 token with balanceOf, transfer(to, amount), approve, and transferFrom — without inheriting OpenZeppelin.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract MinimalToken {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "Time-locked withdrawal",
    difficulty: "Medium",
    description: "Write a contract TimeLock where users can deposit ether with a lock duration. They can only withdraw after their lock period has expired.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract TimeLock {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "Multi-sig wallet (2 of 3)",
    difficulty: "Medium",
    description: "Implement a 2-of-3 multisig wallet. Owners can submitTransaction, confirmTransaction, and executeTransaction — execution requires 2 confirmations.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract MultiSigWallet {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "Dutch auction",
    difficulty: "Medium",
    description: "Write a DutchAuction contract where the price starts high and decreases linearly over time. A buyer can call buy() to purchase at the current price.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract DutchAuction {\n  // Write your code here...\n\n}\n"
  },
  {
    language: "solidity",
    title: "Reentrancy guard",
    difficulty: "Medium",
    description: "Write a contract VulnerableBank with a withdraw(uint amount) function. Then add a nonReentrant modifier from scratch (no OpenZeppelin) to protect it.",
    stub: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract VulnerableBank {\n  mapping(address => uint256) public balances;\n\n  // Add nonReentrant modifier and protect withdraw\n  function withdraw(uint amount) public {\n    require(balances[msg.sender] >= amount);\n    (bool success, ) = msg.sender.call{value: amount}(\"\");\n    require(success);\n    balances[msg.sender] -= amount;\n  }\n}\n"
  }
];
