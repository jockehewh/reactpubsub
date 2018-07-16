const j = React.createElement;
const jsp = JSON.parse
const jss = JSON.stringify
/* 
    couleurs:
    #ef5350 rouge brique pale
    #ff5252 rouge brick eclatant
    #5c6bc0 bleu indigo leger
    #536dfe bleu indigo eclatant
    #e64a19 orange pale 
    #cfd8dc bleu gris clair
    #1de9b6 teal bleu special
*/
var identity = ""
var amis = []
/* 
**
*/
const element =  j('h1', {class:'text'}, 'Hello World')
// demande d'indentification
function login(props){
    return j('div', {class: 'logindiv'}, [
        j('p', null, 'Entrez votre prénom pour commencer:'),
        j('input', {type: 'text', placeholder:'Votre prénom ici.'}),
        j('button', {onClick: ()=>{
            var nominput = document.querySelector('.logindiv input');
            if(nominput.value !== "" && nominput.value !== undefined){
                localStorage.nom = nominput.value
                ReactDOM.render(j(bodyclass, null, null), document.getElementById('main'))
            }else{
                var p = document.createElement('p');
                p.innerText = "Merci d'utiliser un nom."
                document.querySelector('.logindiv').appendChild(p)
            }
        }}, 'Commencer')
    ])
}
// organise et affiche les messages des diferentes discussion
function chat(props){
    //AFFICHAGE GENERAL
     var msgs = props.messages.map(message =>{
        if(message.sender !== identity){
            return j('li', {class: 'received'}, message.message)
        }else{
            return j('li', {class: 'sended'}, message.message)
        }
    })
    return j('ul', {class: 'discussion',
    onClick: (e)=>{
        document.querySelectorAll('.tosend').forEach(el=>{
            el.style.display = 'none';
        })
        if(e.currentTarget.lastChild.className === 'tosend') {
            e.currentTarget.lastChild.style.display = 'block'
            return
        }
        var li = document.createElement('li');
        var input = document.createElement('input');
        input.type = 'text'
        li.appendChild(input)
        li.classList.add('tosend')
        input.addEventListener('blur', ()=>{
            li.style.display= 'none'
        })
        input.addEventListener('keydown', (e)=>{
            if(e.code === 'Enter' || e.code === 'NumpadEnter'){
                console.log(e.code+' has been pressed')
                // GERER L'ENVOIS DU MESSAGE
                console.log(e.target.parentNode.parentNode.parentNode.getAttribute('dataname'))
                console.log(e)
                console.log(input.value)
                var lemessage = {
                    sender: identity,
                    receiver: e.target.parentNode.parentNode.parentNode.getAttribute('dataname'),
                    message: input.value
                }
                var msgEnvoyé = document.createElement('li')
                msgEnvoyé.classList.add('sended')
                msgEnvoyé.innerText = input.value
                e.target.parentNode.parentNode.appendChild(msgEnvoyé)
                if(!localStorage[lemessage.receiver]){
                    var newchat = {
                        nom: lemessage.receiver,
                        messages:[{message: lemessage.message, sender: lemessage.sender}]
                    }
                    localStorage[lemessage.receiver] = jss(newchat)
                }else{
                    var data = jsp(localStorage[lemessage.receiver])
                    data.messages.push({message: lemessage.message, sender: lemessage.sender})
                    localStorage[lemessage.receiver] = jss(data)
                }
                props.webex.send(jss({unmessage: lemessage}))
                input.remove()

            }
        })
        e.currentTarget.appendChild(li)
        input.focus()
    }},
    msgs)
}
// charge les messages si le contact existe. cree un contact si le contact n'existe pas
async function chargeMessages(nomAmi, props){
    console.log(props)
    if(localStorage[nomAmi] === undefined){
        var newAmi = {
            name: nomAmi,
            messages: [{}]
        }
        localStorage[nomAmi] = jss(newAmi)
        var text = await jsp(localStorage[nomAmi]);
        window[nomAmi] = text.messages
        ReactDOM.render(j(chatTab, {contact: nomAmi, webex: props.webex}, null), document.querySelector('.body'))
    }else{
        var text = await jsp(localStorage[nomAmi]);
        var disc = text.messages.map(msg=>{
            return msg
        })
        console.log(disc)
        if(disc.length === 0){
            disc.push({message: '', sender: identity})
        }
        window[nomAmi] = disc
        localStorage[nomAmi] = jss(text)
        ReactDOM.render(j(chatTab, {contact: nomAmi, webex: props.webex}, null), document.querySelector('.body'))
    }
}
// transmet la liste d'amis et le websocket au composant SideBar
function listAmis(props){
        var amisliste = amis.map(ami=>{
            return j('li', {class:'ami'}, ami)
        })
        ReactDOM.render(j(sideBar, {listeA: amisliste, webex: props.webex}, null), document.querySelector('.sideb'))
}
// cree la sidebar qui permet d'ajouter des amis et d'afficher sa liste d'amis
class sideBar extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return j('div', {class:'friends-bar'}, [
            j('ul', {class: 'friends-list'}, this.props.listeA),
            j('input', {type:'text', class: "ajoutamis", placeholder:'Ajouter un ami'}, null),
            j('button', {onClick:(e)=>{
                e.preventDefault();
                var lademande = document.querySelector('.ajoutamis').value;
                if(lademande != ''){
                    this.props.webex.send(jss({ajout: {ask:identity ,req:lademande}}))
                    chargeMessages(lademande, {webex: this.props.webex})
                }
            }}, 'Ajouter')
        ])
    }
}
// cree la mise en page et affiche les discussion :/AREFAIRE
class chatTab extends React.Component{
    constructor(props){
        super(props);
        this.menu = []
        this.chats = []
    }
    componentDidMount(){
        console.log(identity)
    }
    render(){
        console.log(this.props.contact)
        this.menu.push(j('li', {class: 'chat-tab', dataname: this.props.contact}, this.props.contact))
        this.chats.push(j('li', {class: 'tab-content', dataname: this.props.contact}, chat({messages: window[this.props.contact], webex: this.props.webex})))
        return [j('ul', {class: 'chat-menu'}, ["Mes discussions en cours ", this.menu.map((item)=>{return item})]), j('ul', {class: 'chat-content'}, this.chats)]
    }
}
// composant de pied de page
function footerComp(props){
    return j('div', {class:'footy'}, [
        j('p', null, 'Bienvenue sur React')
    ])
}
/* 
**
*/
function iter(props){
    var itemtab = []
    while(props.items > 0){
        itemtab.push(j('li', null, `object number: ${props.items}`))
        props.items--;
    }
    return j('ul', null, itemtab)
}
/*
 composant principale, verifie l'existence de l'utilisateur
 et gère le websocket
 */ 
class bodyclass extends React.Component{
    constructor(props){
        super(props)
        this.checkAndConnect.bind(this)
    }
    checkAndConnect(){
        console.log('CHECK AND CONNECT')
        if(identity === ""){
            identity = localStorage.nom
        }
        var webex = new WebSocket('ws://localhost:9899');
        window.onbeforeunload = (e)=>{
            webex.close();
        }

        webex.onopen = ()=>{
            listAmis({webex:webex})
            webex.send(jss({connexionde: identity}))
            //TEST D'AJOUT EN AMIS
            webex.send(jss({ajout: {ask:identity ,req:'nouveau'}}))
        }
        webex.onmessage = (data)=>{
            var usabledata = jsp(data.data)
            console.log(usabledata)
            if(usabledata.discussions){
                amis.push(usabledata.discussions)
                chargeMessages(usabledata.discussions, {webex:webex})
                //LISTE D AMIS
                listAmis({webex:webex})
            }
            if(usabledata.unedemande && usabledata.unedemande !== identity){
                chargeMessages(usabledata.unedemande, {webex:webex})
            }
            if(usabledata.listeamis){
                console.log(usabledata.listeamis)
            }
        }
    }
    componentDidMount(){
        console.log('MOUNTED')
        
    }
    render(){
        if(!localStorage.nom){
            return j('div', {class:'body'}, [
                j(login, null, null)
            ])
        }
        if(localStorage.nom){
            this.checkAndConnect()
            return j('div', {class:'body'}, [])
        }
    }
}
ReactDOM.render(element,document.getElementById('header'))
ReactDOM.render(j(bodyclass, null, null), document.getElementById('main'))
ReactDOM.render(footerComp(), document.getElementById('footer'))