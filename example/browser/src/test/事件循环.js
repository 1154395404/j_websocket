async function async1 () {
  await async2()
}
async function async2 () {

}
await async1()
new Promise(function (resolve) {
  resolve()
}).then(function () {
  console.log('6promise2')
})

console.log('1async1 start')
console.log('2async2')
console.log('5async1 end')
console.log('3promise1')
console.log('4script end')
