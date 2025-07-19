let t = `
<task_summary>
{
"ai":"ergerg",
"user":"wef4f34g"
}
</task_summary>
`
console.log(JSON.parse(t.split('<task_summary>')[1].split('</task_summary>')[0]))