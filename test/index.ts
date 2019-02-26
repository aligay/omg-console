import Console from '../src/index'

const console = new Console('omy-console')

console.log(1, 'it\'s console.log', Object.keys({ a: 1, b: 2 }))
console.info(2, 'it\'s console.info')
console.warn(3, 'it\'s console.warn')

console.log(4)
console.log(5)
console.log(6)
console.log(7)
try {
  throw new Error('aaaaaa')
} catch (e) {
  console.error(8, e)
}
