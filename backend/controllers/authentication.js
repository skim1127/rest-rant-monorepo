const router = require('express').Router()
const db = require("../models")
const bcrypt = require('bcrypt')
const jwt = require('json-web-token')

const { User } = db

router.post('/', async (req, res) => {
    
    let user = await User.findOne({
        where: { email: req.body.email }
    })

    // console.log(user)

    if (!user || !await bcrypt.compare(req.body.password, user.passwordDigest)) {
        res.status(404).json({
            message: `Could not find a user with the provided username and password`
        })
    } else {
        const result = await jwt.encode(process.env.JWT_SECRET, { id: user.userId })
        res.json({ user: user, token: result.value })
    }
})

router.get('/profile', async (req, res) => {
    try {
        // Split the authorization header into [ "Bearer", "TOKEN" ]:
        const [authenticationMethod, token] = req.headers.authorization.split(' ')

        // Only handle "Bearer" authorization for now
        // (We could add other authorizaion strategies later):
        if (authenticationMethod == 'Bearer') {
            
            // Decode the JWT
            const result = await jwt.decode(process.env.JWT_SECRET, token)
            
            // Get logged in user's id from payload
            const { id } = result.value
        
            // Find user object using id
            let user = await User.findOne({
                where: {
                    userId: id
                }
            })
        res.json(user)
        }
    } catch{
        res.json(null)
    }
})

module.exports = router