const mongoose = require('mongoose')
const { Schema } = mongoose
const { Mixed } = Schema.Types

module.exports = [
  {
    id: 'GlobalConfig',
    name: 'config-global',
    schema: Schema({
      segment: {
        type: String,
        index: true
      },
      field: {
        type: String,
        index: true
      },
      value: Mixed,
      created: Date
    })
  },
  {
    id: 'ServiceConfig',
    name: 'config-service',
    schema: Schema({
      segment: {
        type: String,
        index: true
      },
      field: {
        type: String,
        index: true
      },
      value: Mixed,
      created: Date
    })
  },
  {
    id: 'PageSync',
    name: 'db-page-sync',
    schema: Schema({
      route: String,
      module: String,
      query: String,
      crontab: String,
      data: Object,
      updated: Date,
      created: Date
    })
  },
  {
    id: 'User',
    name: 'db-user',
    schema: Schema({
      name: {
        type: String,
        index: true
      },
      mail: {
        type: String,
        index: true
      },
      title: {
        type: String,
        index: true
      },
      company: String,
      department: String,
      office_name: String,
      description: String,
      display_name: String,
      telephone_no: String,
      employee_id: String,
      user_name: String,
      user_type: String,
      user_level: Number,
      pwd: String,
      permission: String,
      enabled: {
        type: Boolean,
        index: true
      },
      activate: {
        type: Boolean,
        index: true
      },
      token: String,
      lasted: {
        type: Date,
        index: true
      },
      updated: Date,
      created: {
        type: Date,
        index: true
      },
    })
  },
  {
    id: 'UserHistory',
    name: 'db-user-history',
    schema: Schema({
      mail: {
        type: String,
        index: true
      },
      error: String,
      token: String,
      created: {
        type: Date,
        index: true
      },
    })
  },
  {
    id: 'Snippet',
    name: 'db-snippet',
    schema: Schema({
      title: String,
      mode: String,
      file: String,
      task: String,
      order: Number,
      user: String,
      avatar: String,
      private: Boolean,
      content: String,
      updated: Date,
      created: Date
    })
  },
  {
    id: 'ServiceLog',
    name: 'db-service-log',
    schema: Schema({
      app: { type: String, index: true },
      group: { type: String, index: true },
      status: { type: String, index: true },
      permission: Number,
      message: Mixed,
      created: { type: Date, index: true }
    })
  },
  {
    id: 'TerminalLog',
    name: 'db-terminal-log',
    schema: Schema({
      user: String,
      stdin: String,
      exec: String,
      stdout: String,
      created: Date
    })
  },
  {
    id: 'TerminalCommand',
    name: 'db-terminal-command',
    schema: Schema({
      cmd: String,
      template: String,
      created: Date
    })
  }
]
