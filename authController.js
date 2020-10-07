const bcryptjs = require('bcryptjs')

module.exports = {
    register: async(req,res) => {
        const {email,password} = req.body
        const db = req.app.get('db');

        const foundUser = await db.check_user({email})
        if(foundUser[0]){
            return res.status(400).send('email already in use')
        }

        let salt = bcrypt.genSalSync(10)
        let hash = bcrypt.hashSync(password, salt);//encrypts password

        const newUser = await db.register_user({email, hash})
        req.session.user = newUser[0]
        res.status(201).send(req.session.user)
    },
    login: async(req,res) => {
        const {email, password} = req.body
        const db = req.app.get('db')
        
        const foundUser = await db.check_user({email})
        if(!foundUser[0]){
            return res.status(400).send('email not found')
        }
        const authenticated = bcrypt.compareSync(password, foundUser[0].password)
        if(!authenticated){
            return res.status(401).send("password is incorrect")
        }

        delete foundUser[0].password
        req.session.user = foundUser[0]
        res.status(202).send(req.session.user)
    },
    logout: (req,res) => {
        req.session.destroy();
        res.sendStatus(200)
    },
}