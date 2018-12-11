var isTest = process.env.OS == 'Windows_NT' || process.argv[2] == 'debug'
var auth = require('../db/'+(isTest?'authtest':'auth')+'.json');

var {route} = require('./route')

const BOTID = isTest?'522068856512970752':'522068856512970752',
      BOTTAG = '<@'+ BOTID +'>',
      BOTNAME = isTest?'@MantleMantis':'@MantleMantis',
      OWNER = '228072055008919552'

global.OWNER = OWNER
global.BOTID = BOTID

const Discord = require('discord.js');
const client = new Discord.Client();


var sender = function (channel, msg, isDM=false){
    if (typeof msg == 'string')
      channel.send(msg.replace(isDM?(BOTNAME+' '):'','') );
  }

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    console.log(msg.content, msg.channel.type=='dm')
    // avoid message send by bots
    if (msg.author && msg.author.bot) return

    // Is direct message
    var isDM = msg.channel.type=='dm';

    var send = function (message){
          return sender(msg.channel, message, isDM)
      }

    var cmd = 'mark',
        args = [msg.content],
        data = {userID:msg.author.id, user:msg.author.username, send, isDM, client, d:msg},
        message = msg.content

    //msg mention @TimeAlexa or Direct Message to bot,  DM chat have no guid_id
    if (message.startsWith(BOTTAG) || isDM) {
      args = message.split(' ');
      // if mention bot -> remove the mention from args
      if (message.startsWith(BOTTAG)) args.shift()
      cmd = args[0].toLowerCase();
      args = args.splice(1);
    }else if (message.startsWith('!help')) { // global help
      cmd = 'help'
      args = []
    }
    // if(isDM && message.indexOf('>') > -1 ){
    //   cmd = 'from'
    //   args = message.split('>').map((item)=> item.trim());
    // }
    console.log(111111, cmd)
    route(cmd, data, args) //|| route('mark', data, [message])
});
console.log(auth)
client.login(auth.token);
