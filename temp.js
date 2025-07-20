let t ='```xml <task_summary>ewgqwew</task_summary>```'
const match = t.match(/<task_summary>\s*([\s\S]*?)\s*<\/task_summary>/);
console.log(match[0].replace('<task_summary>','').replace('</task_summary>',''))