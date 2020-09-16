import chalk from 'chalk'
import * as path from 'path'
import { getOriginalPosition } from './sourcemap'
import { isString, isNumber, isBoolean, isObject, isJSON, getNow } from './utils'
interface IOptions {
  name?: string,
  verbose?: boolean
}

export default class Console {
  /**
   * A simple assertion test that verifies whether `value` is truthy.
   * If it is not, an `AssertionError` is thrown.
   * If provided, the error `message` is formatted using `util.format()` and used as the error message.
   */
  assert!: (value: any, message?: string, ...optionalParams: any[]) => void
  /**
   * When `stdout` is a TTY, calling `console.clear()` will attempt to clear the TTY.
   * When `stdout` is not a TTY, this method does nothing.
   */
  clear!: () => void
  /**
   * Maintains an internal counter specific to `label` and outputs to `stdout` the number of times `console.count()` has been called with the given `label`.
   */
  count!: (label?: string) => void
  /**
   * Resets the internal counter specific to `label`.
   */
  countReset!: (label?: string) => void
  /**
   * The `console.debug()` function is an alias for {@link console.log()}.
   */
  debug!: (message?: any, ...optionalParams: any[]) => void
  /**
   * Uses {@link util.inspect()} on `obj` and prints the resulting string to `stdout`.
   * This function bypasses any custom `inspect()` function defined on `obj`.
   */
  dir!: (obj: any, options?: NodeJS.InspectOptions) => void
  /**
   * This method calls {@link console.log()} passing it the arguments received. Please note that this method does not produce any XML formatting
   */
  dirxml!: (...data: any[]) => void
  /**
   * Prints to `stderr` with newline.
   */
  error!: (message?: any, ...optionalParams: any[]) => void
  /**
   * Increases indentation of subsequent lines by two spaces.
   * If one or more `label`s are provided, those are printed first without the additional indentation.
   */
  group!: (...label: any[]) => void
  /**
   * The `console.groupCollapsed()` function is an alias for {@link console.group()}.
   */
  groupCollapsed!: () => void
  /**
   * Decreases indentation of subsequent lines by two spaces.
   */
  groupEnd!: () => void
  /**
   * The {@link console.info()} function is an alias for {@link console.log()}.
   */
  info!: (message?: any, ...optionalParams: any[]) => void
  /**
   * Prints to `stdout` with newline.
   */
  log!: (message?: any, ...optionalParams: any[]) => void
  /**
   * This method does not display anything unless used in the inspector.
   *  Prints to `stdout` the array `array` formatted as a table.
   */
  table!: (tabularData: any, properties?: string[]) => void
  /**
   * Starts a timer that can be used to compute the duration of an operation. Timers are identified by a unique `label`.
   */
  time!: (label?: string) => void
  /**
   * Stops a timer that was previously started by calling {@link console.time()} and prints the result to `stdout`.
   */
  timeEnd!: (label?: string) => void
  /**
   * For a timer that was previously started by calling {@link console.time()}, prints the elapsed time and other `data` arguments to `stdout`.
   */
  timeLog!: (label?: string, ...data: any[]) => void
  /**
   * Prints to `stderr` the string 'Trace :', followed by the {@link util.format()} formatted message and stack trace to the current position in the code.
   */
  trace!: (message?: any, ...optionalParams: any[]) => void
  /**
   * The {@link console.warn()} function is an alias for {@link console.error()}.
   */
  warn!: (message?: any, ...optionalParams: any[]) => void

  // --- Inspector mode only ---
  /**
   * This method does not display anything unless used in the inspector.
   *  The console.markTimeline() method is the deprecated form of console.timeStamp().
   *
   * @deprecated Use console.timeStamp() instead.
   */
  markTimeline!: (label?: string) => void
  /**
   * This method does not display anything unless used in the inspector.
   *  Starts a JavaScript CPU profile with an optional label.
   */
  profile!: (label?: string) => void
  /**
   * This method does not display anything unless used in the inspector.
   *  Stops the current JavaScript CPU profiling session if one has been started and prints the report to the Profiles panel of the inspector.
   */
  profileEnd!: (label?: string) => void
  /**
   * This method does not display anything unless used in the inspector.
   *  Adds an event with the label `label` to the Timeline panel of the inspector.
   */
  timeStamp!: (label?: string) => void
  /**
   * This method does not display anything unless used in the inspector.
   *  The console.timeline() method is the deprecated form of console.time().
   *
   * @deprecated Use console.time() instead.
   */
  timeline!: (label?: string) => void
  /**
   * This method does not display anything unless used in the inspector.
   *  The console.timelineEnd() method is the deprecated form of console.timeEnd().
   *
   * @deprecated Use console.timeEnd() instead.
   */
  timelineEnd!: (label?: string) => void

  private mapping = {
    log: ['white'],
    info: ['green'],
    error: ['red'],
    warn: ['yellow'],
    debug: ['yellow']
  }

  constructor (options: IOptions | string = '') {
    let config = options as IOptions
    if (isString(config)) {
      config = {
        name: options as string || ''
      }
    }
    config.name = config.name || ''
    config.verbose = !!config.verbose
    if (
      process.env.OMG_CONSOLE_VERBOSE &&
      process.env.OMG_CONSOLE_VERBOSE !== 'false' &&
      process.env.OMG_CONSOLE_VERBOSE !== '0'
    ) {
      config.verbose = true
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
          if (isNumber(s)) return chalk.blueBright(s + '')
          if (isBoolean(s)) return chalk.blueBright(s + '')
          if (s == null) return chalk.gray(s + '')
          if (s.stack) return chalk.red(s.stack + '\n')
          if (isJSON(s)) return chalk.blueBright(JSON.stringify(s, null, 2) + ' ')
          if (isObject(s)) return chalk.yellow(`<JS{${Object.keys(s)}}>`) + JSON.stringify(s, null, 2)
          return s.toString()
        })

        const namespace = chalk.gray(config.name ? ` [${config.name}]` : '')
        if (!config.verbose) {
          namespace && rest.unshift(`${namespace}`)
          process[type === 'error' ? 'stderr' : 'stdout'].write(rest.join(' ') + '\n')
          return
        }

        this._getInfo().then(whocall => {
          const prefix = chalk[color](`[${type[0].toUpperCase()}] `)
          const time = chalk.gray(getNow())
          rest.unshift(`${prefix}${time}${namespace}`)
          rest.push(chalk.gray(`${whocall.pathname}:${whocall.line}:${whocall.column}`))
          process[type === 'error' ? 'stderr' : 'stdout'].write(rest.join(' ') + '\n')
        })
      }
    })
  }

  /**
   * @return - file name and line number
   */
  private _getInfo (): Promise<{
    pathname: string
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
    line = +line
    column = +column
    return new Promise(resolve => {
      getOriginalPosition({ codeUrl: pathname, line, column }).then(rawInfo => {
        if (rawInfo && rawInfo.source) {
          pathname = path.resolve(pathname, '../', rawInfo.source)
          line = rawInfo.line
          column = rawInfo.column
        }
        resolve({
          pathname,
          line,
          column
        })
      })
    })
  }
}

const rawConsole = global.console
const _console = new Console()
export { _console as console, rawConsole }
