var fs = require('fs')
const JSONb = require('circular-json')
module.exports = {
    getUsers: ()=>{
        return fs.createReadStream('./usersDB.db', {autoclose: true, encoding:'utf8'})
    },
    setUser: (user)=>{
        var item= ''
        var test = fs.createReadStream('./usersDB.db', {autoclose: true, encoding:'utf8'});
        test.on('data', (data)=>{
            item+= data
        })
        test.on('end', ()=>{
            //.log(JSONb.parse(item))
            var temp = JSONb.parse(item)
            console.log(user)
            temp.push(user)
            var reecrit = fs.createWriteStream('./usersDB.db',{encoding:'utf8'})
            reecrit.write(JSONb.stringify(temp))
            reecrit.end()
        })
    },
    saveUsers(liste){
        var enregistre = fs.createWriteStream('./usersDB.db',{encoding:'utf8'})
            enregistre.write(JSONb.stringify(liste))
            enregistre.end()
    }
}