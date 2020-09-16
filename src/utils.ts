export const isString = s => typeof s === 'string'
export const isNumber = n => typeof n === 'number'
export const isBoolean = b => typeof b === 'boolean'
const isArray = a => Array.isArray(a)
export const isObject = o => Object.prototype.toString.call(o) === '[object Object]'
const isPlainObject = (value) => {
  if (!value || typeof value !== 'object' || ({}).toString.call(value) !== '[object Object]') {
    return false
  }
  let proto = Object.getPrototypeOf(value)
  if (proto === null) {
    return true;
  }
  let Ctor = global.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor === 'function' && Ctor instanceof Ctor && Function.prototype.toString.call(Ctor) === Function.prototype.toString.call(Object);
}

export const isJSON = obj => {
  if (!isObject(obj)) return false
  try {
    JSON.stringify(obj)
  } catch (e) {
    return false;
  }
  const checkValue = (o) => {
    for (let i in o) {
      if (!o.hasOwnProperty(i)) continue
      if (isString(o[i]) || isNumber(o[i]) || o[i] == null) {
        continue
      }
      if (isObject(o[i]) || isArray(o[i])) {
        console.log(o[i])
        checkValue(o[i])
        continue
      }
      return false
    }
    return true
  }
  return checkValue(obj)
  // let s: string
  // if (!(isArray(o) || isObject(o))) return false
  // try {
  //   return isString(JSON.stringify(o))
  // } catch (e) {
  //   return false
  // }
}

const isFunction = f => typeof f === 'function'
const pad = (s, n = 2) => (s + '').padStart(n, '0')
export const getNow = (): string => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const HH = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  const ms = pad(d.getMilliseconds(), 3)
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}.${ms}`
}
