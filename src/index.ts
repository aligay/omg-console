import chalk from 'chalk'
import * as path from 'path'
import { getOriginalPosition } from './sourcemap'
const isString = s => typeof s === 'string'
const isNumber = n => typeof n === 'number'
const isBoolean = b => typeof b === 'boolean'

const pad = (s, n = 2) => (s + '').padStart(n, '0')
interface IOptions {
  name: string
}

export default class Logger {
  public log
  public debug
  public info
  public dirxml
  public warn
  public error
  public dir
  public time
  public timeEnd
  public timeLog
  public trace
  public assert
  public clear
  public count
  public countReset
  public group
  public groupCollapsed
  public groupEnd
  public table
  public Console
  public profile
  public profileEnd
  public timeStamp
  public context
  private mapping = {
    log: ['white', ''],
    info: ['green'],
    error: ['red'],
    warn: ['yellow'],
    debug: ['yellow']
  }

  constructor (options?: IOptions | string) {
    let config = options as IOptions
    if (!options || isString(options)) {
      config = {
        name: options as string
      }
    }

    let logger = this
    Object.keys(console).forEach(type => {
      logger[type] = (...rest) => {
        if (!this.mapping[type]) {
          console[type].apply(console, rest)
          return
        }

        const color: string = this.mapping[type][0]
        rest = rest.map(s => {
          if (isString(s)) return chalk[color](s)
          if (isNumber(s)) return chalk.yellow(s + '')
          if (isBoolean(s)) return chalk.blueBright(s + '')
          if (s == null) return chalk.gray(s + '')
          if (s.stack) return chalk.red(s.stack + '\n')
          return s
        })

        const prefix = chalk[color](`[${type[0].toUpperCase()}] `)
        const time = chalk.gray(this._getNow())
        const namespace = chalk.gray(config.name ? ` [${config.name}]` : '')
        this._getInfo().then(whocall => {
          rest.unshift(`${prefix}${time}${namespace}`)
          rest.push(chalk.gray(`${whocall.pathname}:${whocall.line}:${whocall.column}`))
          process[type === 'error' ? 'stderr' : 'stdout'].write(rest.join(' ') + '\n')
        })
      }
    })
  }

  private _getNow (): string {
    const d = new Date()
    const HH = pad(d.getHours())
    const mm = pad(d.getMinutes())
    const ss = pad(d.getSeconds())
    const ms = pad(d.getMilliseconds(), 3)
    return `${HH}:${mm}:${ss}.${ms}`
  }

  /**
   * @return - file name and line number
   */
  private _getInfo (): Promise<{
    pathname: string
    filename: string
    line: number
    column: number
  }> {
    const REG = /([/\w\d\-_.]*:\d+:\d+)/
    let info
    try {
      throw new Error()
    } catch (e) {
      const lines = e.stack.split('\n')
      const line = lines[3]
      const matched = line.match(REG)
      info = matched[1]
    }
    let [pathname, line, column] = info.split(':')
    let filename = path.relative(__dirname, pathname)
    line = +line
    column = +column
    return new Promise(resolve => {
      getOriginalPosition({ codeUrl: pathname, line, column }).then(rawInfo => {
        if (rawInfo && rawInfo.source) {
          pathname = path.resolve(pathname, '../', rawInfo.source)
          filename = rawInfo.source
          line = rawInfo.line
          column = rawInfo.column
        }
        resolve({
          pathname,
          filename,
          line,
          column
        })
      })
    })
  }
}
