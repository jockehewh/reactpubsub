const Koa = require('koa')
const WS = require('ws')
const fs = require('fs')
const uc = require('./utilisateursCollection')
const JSONb = require('circular-json')
const krps = new Koa();
const krpsWS = new WS.Server({port: 9899})
const jsp = JSON.parse
const jss = JSON.stringify

krps.use(async (ctx, next) =>{
    if (ctx.url === '/'){
        ctx.type = 'text/html'
        ctx.body = fs.createReadStream('./index.html', {autoClose: true})
    }
    if(/\.(html|js|css|jpg|jpeg|png)/.test(ctx.url)){
        ctx.type = /\.(html|js|css|jpg|jpeg|png)/.exec(ctx.url)[0]
        ctx.body = fs.createReadStream('./'+ctx.url, {autoClose: true})
    }
    await next()
})
var utilisateursCollection = []
krps.listen(9898, ()=>{
    
    var getUsers = uc.getUsers()
    getUsers.on('data', (data)=>{
        utilisateursCollection += data
    }).on('end', ()=>{
        utilisateursCollection = [JSON.parse(utilisateursCollection)]
    })
    krpsWS.on('connection', (peer)=>{
        peer.on('message', (data)=>{
            var usabledata = jsp(data)
            if(usabledata.connexionde){
                var allusers = utilisateursCollection.map(connected=>{
                    return connected.nom
                })
                console.log('+++++', allusers)
                if(allusers.indexOf(usabledata.connexionde) === -1){
                    console.log('newUser')
                    var newUser = {
                        nom: usabledata.connexionde,
                        online: true,
                        co: peer,
                        amis: [],
                    }
                    utilisateursCollection.push(newUser)
                    uc.setUser({
                        nom: usabledata.connexionde,
                        online: true,
                        amis: [],
                    })
                    /* uc.saveUsers(utilisateursCollection.map(utilisateur =>{
                        utilisateur.co = {}
                        return utilisateur
                    })) */
                }else{
                    utilisateursCollection.forEach(uilisateur=>{
                        if(usabledata.connexionde === uilisateur.nom){
                            var objtemp = {
                                discussions: ""
                            }
                            uilisateur.co = peer
                            uilisateur.online = true
                            uilisateur.co.send(jss({listeamis: uilisateur.amis}))
                            uilisateur.amis.forEach(ami=>{
                                utilisateursCollection.forEach(unit =>{
                                    if (ami.nom === unit.nom && unit.online === true){
                                        //ami.co = unit.co
                                        objtemp.discussions = ami.nom
                                        uilisateur.co.send(jss(objtemp))
                                    }
                                })
                            })
                        }
                    })
                }
            }
            /*  ajout :{
                ask: identity,
                req: value
                } 
            */
            if(usabledata.ajout){
                utilisateursCollection.forEach((obj) =>{
                    console.log('----------', obj.nom)
                    if(obj.nom === usabledata.ajout.req){
                        utilisateursCollection.forEach(ami=>{
                            if(ami.nom === usabledata.ajout.ask){
                                ami.amis.push(usabledata.ajout.req)
                            }
                        })
                        /* 
                        TROUVER POURQUOI YA BUG
                        */
                        obj.amis.push(usabledata.ajout.ask+'P')
                        obj.co.send(jss({unedemande: usabledata.ajout.ask}))
                        var temp = utilisateursCollection.map(utilisateur =>{
                            return {
                                nom: utilisateur.nom,
                                online: utilisateur.online,
                                amis: utilisateur.amis,
                            }
                        })
                        console.log(temp)
                        uc.saveUsers(temp)
                    }
                    
                })
            }
            if(usabledata.unmessage){
                console.log(usabledata)
            }
            console.log(usabledata)
            
            //console.log(krpsWS.clients)
        })// onmessage <<<
    })
    console.log('en ecoute port 9898')
})