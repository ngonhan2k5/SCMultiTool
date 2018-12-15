var isTest = process.env.OS == 'Windows_NT' || process.argv[2] == 'debug' || process.env.npm_lifecycle_event == 'dev' 
const LINK = isTest?'localhost:3000':'talex.b-reserved.com'
const fetch = require('node-fetch');

var utils = require('./utils')

console.log(454545, isTest)

// var Datastore = require('nedb')
// var db = new Datastore({ filename: 'db/usertz.db', autoload: true });
// const tokens = new Datastore({ filename: 'db/usertoken.db', autoload: true });
// const channels = new Datastore({ filename: 'db/channels.db', autoload: true });

// const {RichEmbed } = require('discord.js');


const FORMAT = 'LT ll',
      FORMAT_TIME = 'LT'

const doAction = {
  ping: (data)=>{
    var {send, client} = data;
    // utils.renderShip([], client)
    //https://media.discordapp.net/attachments/514297100566265869/522964764230418467/hello_world.png?width=322&height=468
    send('sss', {file:'https://media.discordapp.net/attachments/514297100566265869/522964764230418467/hello_world.png'}).then(
      function(msg){
        console.log(1111111111,msg)
      }
    )
  },
  get: function(data, url, selector){
    var {send} = data
    utils.renderImage(url).then(
      function(path){
        send('<'+path+'>', {file:path})
      }
    )
  },
  img: function(data){
    var pageUrl = 'https://starcitizen.tools/Hull_D'
    utils.fetchAsset(pageUrl, false).then(
      function(ret){
        console.log(12121212, ret)
        data.send(ret)
        // send('<'+ret.url+'>', {files:[{attachment: ret.path, name: ret.path.split('/').pop()}]}).then(
        //   function (msg){
        //       console.log(3333335, msg, msg.attachments.values().next().value.proxyURL)
        //       utils.saveAsset(pageUrl, msg.attachments.values().next().value.proxyURL)
        //   }
        // )
      }
    )
  },
  fact: function(data, kw, ...kw1){
    console.log(55555555, kw, kw1)
    var {send} = data
    utils.findQuery(kw, kw1.join(' '), true).then(
      function(qdocs){
        console.log(8888888888, qdocs)
        send('Matched items: '+ qdocs.map(function(item){return '>>'+item.name}).join(', '))
      }
    )
  },
  search: function(data, kw, ...kw1){
    //var data = args.shift()
    //var kw = args.join(' ')
    console.log(55555555, kw, kw1)
    var {send} = data
    const assetType = 'embed'

    utils.findQuery(kw, kw1.join(' ')).then(
      function(qdoc){
        console.log(555555,qdoc)
        if (qdoc){
          var pageUrl = qdoc.pageUrl
          utils.findAsset(pageUrl, assetType).then(
            function(doc){
              if (doc && doc.asset){
                  console.log('Found', doc)
                  if (typeof doc.asset == 'string'){
                    send('Test'+' <'+ pageUrl +'>', {file:doc.asset})
                  }else{
                    send({embed:doc.asset})
                  }
              }else{
                  console.log('Not Found', pageUrl, utils.hashCode(pageUrl), 'indoc')
                  utils.fetchAsset(pageUrl, assetType).then(
                    function(ret){
                      console.log(2323232, ret)
                      if(ret.title)
                        send(ret).then(
                          function (msg){
                            console.log(3333335, msg)
                            utils.saveAsset(pageUrl, ret, 'embed')
                          }
                        )
                      else
                        send('<'+ret.url+'>', {files:[{attachment: ret.path, name: ret.path && ret.path.split('/').pop()}]}).then(
                          function (msg){
                              console.log(3333335, msg, msg.attachments.values().next().value.proxyURL)
                              utils.saveAsset(pageUrl, msg.attachments.values().next().value.proxyURL, 'image')
                          }
                        )
                    }
                  )
              }
            },
            function(){}
          )
        }else{
          console.log('Nothing')
        }
      }
    )
   
  },
  // Register
  reg : function (data, tz, pmKey, pm=null){
    console.log(666, tz, pmKey, pm)

    var {userID, user, send, isDM} = data;


  }, // end reg


  help: function(data, detail=false){
    var {send, client} = data;
    console.log('h1', send)

    return utils.sendHelpShort(send, client)
  },

  _run: function(data){
    var args = [...arguments].slice(1)
    var {send, userID, isDM, bot} = data;

    //if (args.length == 0 || userID != global.OWNER) return
    var cmd = args.shift()

    args = args.map(function(item){return item.replace(/_/g,' ')})

    const spawn = require('cross-spawn');
    const child = spawn(cmd, args);

    // use child.stdout.setEncoding('utf8'); if you want text chunks
    child.stdout.on('data', (chunk) => {
      // data from standard output is here as buffers
      send(chunk.toString(), userID)
    });

    // since these are streams, you can pipe them elsewhere
    child.stderr.on('data', (chunk) => {
      // data from standard output is here as buffers
      send(chunk.toString(), userID)
    });

    child.on('close', (code) => {
      send(`child process exited with code ${code}`, userID)
      console.log(`child process exited with code ${code}`);
    });
  },

  
  _mark:(data, message)=>{
    return
    // console.log('aaaaa', data)
    // return
    var {userID, user, send, isDM, bot, d:{channel_id:channelID, id:messageID}} = data;
    // Object.values(bot.servers).map((item)=>{
    //   console.log(item)
    // })

    var allowReaction = ((bot.channels[channelID] &&
                          bot.channels[channelID].permissions.user[global.BOTID] &&
                          bot.channels[channelID].permissions.user[global.BOTID].allow) & 64) == 64
    // var allowReaction2 = ((bot.channels[channelID] &&
    //                                             bot.channels[channelID].permissions.user[global.BOTID] &&
    //                                             bot.channels[channelID].permissions.user[global.BOTID].allow) & 64) == 64
    //console.log(allowReaction, bot.channels['514297100566265869'].permissions.user['515540575504826368'])
    utils.getChannelOption(channelID, allowReaction).then(
      function(reaction){
        // console.log(90909090, reaction)
        if (reaction){
          var items = res.process(message)
          if (items.length){
            // console.log('aaaaa',d)
            bot.addReaction({channelID: channelID, messageID: messageID, reaction: '🕰' })
          }
        }
      },
      function(err){}
    )

  }
}


// var sender;
//(cmd, args, userID, user, send)
const route = function(action, data, args){
  // console.log(8888888, [data, ...args])
  // normal actions
  if (!action.startsWith('_') && doAction[action]){

    return doAction[action].apply(doAction, [data, ...args]) || true;
  // operating actions start with _ for only bot owner
  }else if (doAction['_'+action] && data.userID == global.OWNER){
    return doAction['_'+action].apply(doAction, [data, ...args]) || true;
  }else{
    return false
  }
}

// const regLink = (data) => {
//     var {user, send, isDM, userID} = data
//     var doc = {token:utils.token(), userID, user}
//     return new Promise ((resolve, reject)=>{
//       tokens.insert(doc, function (err, newDoc) {   // Callback is optional
//         if(newDoc){
//           resolve(newDoc)
//         }else{
//           reject(err)
//         }
//       })
//     })
//   }
//

const log = function(name, query, send){
  //send(global.OWNER)('['+name+'] '+JSON.stringify(query, null, '\t').substr(0,2000))
  // send(global.OWNER)('['+name+'] ' + util.inspect(query).substr(0,1000))

}


module.exports = {
  route:route,
}

// https://discordbots.org/bot/522068856512970752
