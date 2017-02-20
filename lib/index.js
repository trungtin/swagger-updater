#!/usr/bin/env node debug
// @flow
var fs = require('fs')
var path = require('path')
var pify = require('pify')
var chalk = require('chalk')

chalk.error = chalk.bold.red

var yaml = require('js-yaml')

const DEFAULT_YAML_PATH = './api/swagger/swagger.yaml'

type OptionsInput = {
  filePath: string
}

module.exports = updateYaml

/**
 * update yaml file
 * @param  {Object} content                     [description]
 * @param  {Object} options                     [description]
 * @return {null}                              Nothing return
 */
function updateYaml (content: Object, { filePath = DEFAULT_YAML_PATH }: OptionsInput = {}): void {
  const fullFilePath = path.resolve(process.cwd(), filePath)
  let oldContent
  try {
    oldContent = yaml.safeLoad(fs.readFileSync(fullFilePath), 'utf8')
  } catch (e) {
    chalk.error('swagger-updater::: Cannot parse your swagger spec file.')
    throw e
  }
  const updated = oldContent

  updated['definitions'] = updateDefinitions(oldContent['definitions'], content['definitions'])
  updated['paths'] = updatePaths(oldContent['paths'], content['paths'])
  const backupFileName = fullFilePath.slice(0, -fullFilePath.lastIndexOf('.')) + '.' + Date.now() + '.yaml'
  pify(fs.rename)(fullFilePath, backupFileName)
    .then(() => {
      const fileContent = yaml.safeDump(updated)
      return pify(fs.writeFile)(fullFilePath, fileContent, { encoding: 'utf8' })
    })
    .then(() => {
      chalk.bold.green('DONE updating yaml file. A backup file was saved as: ' + backupFileName)
    })
}

/**
 * update definitions part. Return the update definitions and keep any key
 * from old definitions doesn't appear in update definitions for now
 * @param  {Object} oldDefs    the current spec definitions
 * @param  {Object} updateDefs the update spec definitions
 * @return {Object}            updated definitions
 */
function updateDefinitions (oldDefs: Object, updateDefs: Object): Object {
  const ret = mergeUntilLevel({ level: 1 })(oldDefs, updateDefs)
  return ret
}

/**
 * update paths path
 * @param  {Object} oldPaths the current spec paths
 * @param  {Object} update   the update spec paths
 * @return {Object}          updated paths
 */
function updatePaths (oldPaths: Object, update: Object): Object {
  const merge4Level = mergeUntilLevel({ level: 4 })
  function mergeFieldExceptResponse (s: Object, u: Object, k?: string): Object {
    if (k !== 'response') {
      return u
    }
    return merge4Level(s, u)
  }
  const ret = mergeUntilLevel({ level: 2, updateFunction: mergeFieldExceptResponse })
  return ret
}

/**
 * Merge function factory
 * @param  {Number}    [level=0]                    Deep level until replace with field from update
 * @param  {Function}  [updateFunction=(s,u) => u]  The update function will be called when merging last level, default to return field from update
 * @return {Function}                               The actual merge function
 */
function mergeUntilLevel (
  { level = 0, updateFunction = (s, u) => u }
    : { level?: number, updateFunction?: {(s: Object, u: Object, k?: string): Object} } = {}
): {(s: Object, u: Object): Object} {
  function merge (
    source: Object,
    update: Object
  ): Object {
    const ret = source
    for (var key in update) {
      if (update.hasOwnProperty(key)) {
        if (!ret.hasOwnProperty(key) || level === 0) {
          ret[key] = updateFunction(ret[key], update[key], key)
        } else if (!(typeof source[key] === 'object' && typeof ret[key] === 'object')) {
          console.error(chalk.error('Incompatible type when merging object.\n' +
                                    'Received source type: ' + typeof ret[key] + '\n' +
                                    'Received update type: ' + typeof update[key] + '\n' +
                                    'With key: ' + key))
        } else {
          ret[key] = mergeUntilLevel({ level: level - 1, updateFunction })(ret[key], update[key])
        }
      }
    }
    return ret
  }
  return merge
}
