import adler from "adler-32";
const { str } = adler;
console.log(str(JSON.stringify({ value: 0 })));
console.log(str(JSON.stringify({ value: 450 })));
//# sourceMappingURL=test.js.map