import Console from '../src/index'

const console = new Console('omy-console')

console.log('it\'s console.log')
console.info('it\'s console.info')
console.warn('it\'s console.warn')

try {
  throw new Error('')
} catch (e) {
  console.error(e)
}
