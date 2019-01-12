const ldapAuth = require('./ldap')
const db = require('../mongodb')
const bodyParser = require('body-parser')
const jsonwebtoken = require('jsonwebtoken')
const md5 = require('md5')

let router = {}
if (process.env.NODE_ENV !== 'production') {
  const { Router } = require('express')
  router = Router()
} else {
  const app = require('express')()
  router = app
}
router.use(bodyParser.json())

router.use('*', (req, res, next) => {
  console.log(`AUTH:: ${req.method} ${req.baseUrl}`)
  next()
})

// Import API Routes
const userData = [
  'name',
  'mail',
  'title',
  'company',
  'permission',
  'department',
  'office_name',
  'description',
  'display_name',
  'telephone_no',
  'user_name',
  'user_type',
  'lasted',
  'created'
]
router.get('/user', (req, res) => (async () => {
  let raw = req.headers['authorization']
  if (!raw) return res.json({})

  try {
    let { User } = await db.open()
    raw = raw.replace(/^bearer /ig, '')
    if (raw === 'undefined') throw new Error('user data not found.')

    let decode = decodeToken(raw)
    let data = await User.findById(decode._id, userData.join(' '))
    if (!data) throw new Error('user data not found.')
    res.json({ user: data })
  } catch (ex) {
    res.json({})
  }
})().catch((ex) => {
  res.json({})
}))

const encodeToken = (data) => {
  const hashId = md5(data.mail + (+(new Date())))
  return jsonwebtoken.sign({ hash: hashId, ...data }, process.env.JWT_KEYHASH)
} 

const decodeToken = (data) => {
  return jsonwebtoken.verify(data, process.env.JWT_KEYHASH)
}

router.post('/recheck', (req, res) => (async () => {
  let { user } = req.body
  let { User } = await db.open()
  try {
    if (!user) throw new Error('Unauthorized 402')
    user = user.trim().toLowerCase()

    let acc = await User.findOne({ mail: user })
    if (!acc) throw new Error('Unauthorized 403')
    res.json({ enabled: acc.enabled, activate: acc.activate })
  } catch (ex) {
    res.json({ error: ex.message || ex })
  }
})().catch(ex => {
  res.json({ error: ex.message || ex })
}))


router.post('/login', (req, res) => (async () => {
  let date = new Date()
  
  let auth = {}
  let raw = req.headers['authorization']
  if (raw) {
    let IsEncode = false
    try {
      auth = new Buffer.from(raw.replace(/^basic /ig, ''), 'base64').toString('utf8')
      auth = /(?<usr>.*?):(?<pwd>.*)/ig.exec(auth).groups || {}
      IsEncode = true
    } finally { /* decode but user random charector and send to server. */}

    if (!IsEncode) return res.status(401).json({ error: 'Unauthorized (401)'})
  } else {
    let { user, pass } = req.body
    auth = { usr: user, pwd: pass }
  }

  let { User, UserHistory } = await db.open()
  try {
    if (!auth) throw new Error('Unauthorized (402)')
    auth.usr = auth.usr.trim().toLowerCase()

    let user = await User.findOne({ mail: auth.usr })

    let data = null
    try {
      data = await ldapAuth(auth.usr, auth.pwd)
      data.mail = data.mail.trim().toLowerCase()
    } catch (ex) {
      data = { error: ex.message || ex }
      user = await User.findOne({ mail: auth.usr, pwd: md5(auth.pwd) })
    }
    if (!user && data.error) throw new Error(data.error)
    if (!user) {
      user = await new User(Object.assign({
        pwd: md5(auth.pwd),
        token: null,
        activate: false,
        enabled: false,
        lasted: date,
        updated: date,
        created: date
      }, data)).save()
    } else {
      await User.updateOne({ _id: user._id }, {
        $set: {
          pwd: md5(auth.pwd),
          token: null,
          lasted: date
        }
      })
    }
 
    let accessToken = encodeToken({ _id: user._id })
    await User.updateOne({ _id: user._id }, { $set: { token: accessToken } })
    if (user.activate && user.enabled) {
      await new UserHistory({ mail: auth.usr, error: data.err, token: accessToken, created: date }).save()
      res.json({ token: accessToken })
    } else {
      await new UserHistory({ mail: auth.usr, error: 'account suspended or inactivate', token: accessToken, created: date }).save()
      res.status(401).json({ error: 'Unauthorized (403)' })
    }
  } catch (ex) {
    await new UserHistory({ mail: auth.usr, error: (ex.message || ex), token: null, created: date }).save()
    res.json({ error: ex.message || ex })
  }
})().catch(ex => {
  res.status(401).json({ error: ex.message || ex })
}))

router.post('/logout', (req, res) => (async () => {
  res.json({})
})().catch((ex) => {
  res.status(401).json({})
}))

// Export the server middleware
module.exports = {
  path: '/auth',
  handler: router
}
