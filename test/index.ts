import Console from '../src/index'

const console = new Console('omg-console')

console.log(1, 'it\'s console.log', Object.keys({ a: 1, b: 2 }))
console.info(2, 'it\'s console.info')
console.warn(3, 'it\'s console.warn')

console.log(4, Promise)
console.log(5, null, undefined)
console.log(6, Infinity)
console.log(7, { b: () => {alert('1111')} })
console.log(8, { a: 1, b: [2, 3] })
try {
  throw new Error('aaaaaa')
} catch (e) {
  console.error(10, e)
}
