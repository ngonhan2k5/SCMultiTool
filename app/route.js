var isTest = process.env.OS == 'Windows_NT' || process.argv[2] == 'debug'
const LINK = isTest?'localhost:3000':'talex.b-reserved.com'

// var Datastore = require('nedb')
// var db = new Datastore({ filename: 'db/usertz.db', autoload: true });
// const tokens = new Datastore({ filename: 'db/usertoken.db', autoload: true });
// const channels = new Datastore({ filename: 'db/channels.db', autoload: true });

const FORMAT = 'LT ll',
      FORMAT_TIME = 'LT'

const doAction = {
  // Register
  reg : function (data, tz, pmKey, pm=null){
    console.log(666, tz, pmKey, pm)

    var {userID, user, send, isDM} = data;


  }, // end reg


  help: function(data, detail=false){
    var {send} = data;
    console.log('h1', send)

    return detail?utils.sendHelp(send):utils.sendHelpShort(send)
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

  
  mark:(data, message)=>{
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

var utils = {
  isServerOwner:(userID, channelID, bot)=>{
    return Object.values(bot.servers).find((srv)=>{
      console.log(22222222,srv, userID, channelID)
      return (srv.owner_id==userID && srv.channels[channelID])
    }) != null
  },
  serverOwner:(channelID, bot)=>{
    var srv = Object.values(bot.servers).find((srv)=>{
      // console.log(22222222,srv, userID, channelID)
      return (!!srv.channels[channelID])
    })
    return srv && srv.owner_id
  },

  sendHelpShort: function(send, bot){
    send({
      color: 3447003,
      // author: {
      //   name: client.user.username,
      //   icon_url: client.user.avatarURL
      // },
      title: "Help for MantleMantis",
      url: "https://discordbots.org/bot/522068856512970752",
      description: "Helper for StarCitizen game's Discord channels",
      fields: [
        {
          name: "0. How to",
          value: "★　\r\n"+
                "★　"
        },

      ],
      timestamp: new Date(),
      footer: {
        // icon_url: client.user.avatarURL,
        text: "© MantleMantis"
      }
    })
  },

  token : () => {
    return Math.random().toString(36).substr(2); // remove `0.`
  },
  getChannelOption: function(channelID, bypass){
    return new Promise((resolve, reject)=>{
      if (!bypass){
        channels.findOne({ _id: channelID}, (err,doc)=>{
          if (doc)
            resolve(doc.reaction)
          else {
            reject(false)
          }
        })
      }else{
        resolve(true)
      }
    })
  },
  saveChannelOption : function (data){
    // console.log(send('111111'), 11111111)
    var {channelID, reaction} = data

    var newData = { _id: channelID, reaction: reaction}

    return new Promise((resolve, reject)=>{
      channels.insert(newData, function (err, newDoc) {   // Callback is optional
        console.log("Reg error", err, err && err.errorType)
        if (!err)
          resolve(1)
        else if (err.errorType == 'uniqueViolated'){
          channels.update({ _id: channelID }, { $set: newData}, {}, function (err, numReplaced) {
            console.log("Update error", err, numReplaced)
            if (!err && numReplaced){
              resolve(1)
            }else {
              reject(0)
            }
          });
        }else{
          reject(0)
        }

      });
    })
  }

}

// var sender;
//(cmd, args, userID, user, send)
const route = function(action, data, args){
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

var util = require('util')

const log = function(name, query, send){
  //send(global.OWNER)('['+name+'] '+JSON.stringify(query, null, '\t').substr(0,2000))
  // send(global.OWNER)('['+name+'] ' + util.inspect(query).substr(0,1000))

}


module.exports = {
  route:route,
}

// https://discordbots.org/bot/509269359231893516
