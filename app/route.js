var isTest = process.env.OS == 'Windows_NT' || process.argv[2] == 'debug'
const LINK = isTest?'localhost:3000':'talex.b-reserved.com'

// var Datastore = require('nedb')
// var db = new Datastore({ filename: 'db/usertz.db', autoload: true });
// const tokens = new Datastore({ filename: 'db/usertoken.db', autoload: true });
// const channels = new Datastore({ filename: 'db/channels.db', autoload: true });

const {Attachment } = require('discord.js');


const FORMAT = 'LT ll',
      FORMAT_TIME = 'LT'

const doAction = {
  ping: (data)=>{
    var {send} = data;
    send('Pong')
  },
  get: function(data, url, selector){
    var {send} = data;
    const fetch = require('node-fetch');
    fetch('https://'+url)
    .then(res => res.text())
    .then(body => {
      //console.log(body)});
      var cheerio = require('cheerio'),
      $ = cheerio.load(body);
      // $('.infobox-table.hproduct').find('tr').each(function(i,e){
      //   var a = $('th,td', e).map(function(i, el){return $(el).text()})
      //   console.log(a.get())
      // })

      // console.log($('.infobox-table.hproduct').html())

      var webshot = require('webshot');
      var tableHtml = $('.infobox-table.hproduct').html().replace('/images/thumb','https://starcitizen.tools/images/thumb')
      var html = '<html>{CSS}<body><table style="margin-right:5px">{table}</table></body></html>'.replace('{table}', tableHtml).replace('{CSS}', CSS)
      // var html = "<table><tr><td>dd</td><td>dd</td><td>dd</td><td>dd</td></tr><tr><td>dd</td><td>dd</td><td>dd</td><td>dd</td></tr><tr><td>dd</td><td>dd</td><td>dd</td><td>dd</td></tr></table>"
      console.log(html)
      var path = 'public/hello_world.png'
      var fs = require('fs');
      if (fs.existsSync(path)) {
        var at =new Attachment(path, 'hello_world.png')
          send('<'+'https://'+url+'>', at)
      }else{
        // var option = { 
        //   screenSize: {
        //     width: 320
        //   , height: 480},
        //   shotSize: {
        //       width: 'all'
        //     , height: 'all'
        //     }
        //   ,siteType:'html'
        // }
        // webshot(html, path, option, function(err) {
        //   // screenshot now saved to hello_world.png
        //   // const attachment = new MessageAttachment('public/hello_world.png');
        //   // send('Message that goes above image', {files: ["../hello_world.png"]});
        //   // send('ssssss')
        //   var at =new Attachment(path, 'hello_world.png')
        //   send('<'+'https://'+url+'>', at)
          
        // });
      }
      // var option = {userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
      // + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g', captureSelector:'.infobox-table.hproduct'}
      // webshot('https://'+url, 'public/google.png', option, function(err) {
      //   // screenshot now saved to google.png
      // });
    })
  },
  img: function(){
    
  },
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
  console.log(8888888, [data, ...args])
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

var CSS = '<style>table {  display: table;  border-collapse: separate;  border-spacing: 2px;  border-color: grey;}.mw-body #toc h2,.mw-body .toc h2,body,html,input,ul.tabbernav li a{font-family:Roboto,sans-serif}[type=checkbox]+label{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;cursor:pointer}body,html{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-overflow-style:-ms-autohiding-scrollbar opacity:1;background:#f9fbfc;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}#contfoot-wrapper{margin-left:12rem;max-width:1200px;margin-top:2rem;margin-bottom:0}#toc,.toc,.toctoggle{right:20px;box-shadow:0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12)}.ltr .toctext{direction:ltr}div#mw-panel{max-height:calc(100% - 2rem - 4px);transition:opacity .2s ease-out}.mw-body{margin:0;padding:0 0 1rem;border:0;z-index:2;min-height:calc(100vh - 13rem);overflow:hidden;color:#424242;background:0 0}div#footer{background:#131a21;padding:0;border:0;margin:0;left:0;right:0;position:absolute;z-index:3}#p-cactions,#p-personal{-ms-flex-order:3;-webkit-box-ordinal-group:4;order:3}#left-navigation,#p-views{-ms-flex-order:2;-webkit-box-ordinal-group:3;order:2}#p-search,#right-navigation,.fullMedia span.fileInfo{-ms-flex-order:1;-webkit-box-ordinal-group:2;order:1}.embedvideo.autoResize{position:relative;height:auto;overflow:auto}.embedvideo.autoResize .embedvideowrap{position:relative;padding-bottom:56.25%;padding-top:25px;width:auto!important;height:0}.embedvideo.autoResize iframe{width:100%;height:100%;position:absolute;top:0;left:0}#homegrid a,#mw-navigation a:hover,#toc a,.editButtons a,.noarticletext a:hover,.toc a,a:focus,a:hover{text-decoration:none}.oo-ui-icon-bell{background-image:url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M17.5%2014V9c0-3-2.3-5-5.5-5S6.5%206%206.5%209v5c0%202%200%203-2%203v1h15v-1c-2%200-2-1-2-3zM12%2020H9c0%201%201.6%202%203%202s3-1%203-2h-3z%22%2F%3E%0A%3C%2Fsvg%3E%0A)}.oo-ui-image-invert.oo-ui-icon-bell{background-image:url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%3E%0A%20%20%20%20%3Cpath%20xmlns%3Adefault%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M17.5%2014V9c0-3-2.3-5-5.5-5S6.5%206%206.5%209v5c0%202%200%203-2%203v1h15v-1c-2%200-2-1-2-3zM12%2020H9c0%201%201.6%202%203%202s3-1%203-2h-3z%22%2F%3E%0A%3C%2Fg%3E%3C%2Fsvg%3E%0A)}.oo-ui-icon-bellOn{background-image:url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M17.8%2014.7l1.7-4.7c1-2.8-.5-5.5-3.5-6.6s-5.9%200-6.9%202.8l-1.7%204.7c-.7%201.9-1%202.8-2.9%202.1l-.3%201%2014.1%205.1.3-.9c-1.9-.7-1.5-1.6-.8-3.5zM12%2019.8l-2.8-1c-.3.9.8%202.4%202.1%202.9s3.2.1%203.5-.9l-2.8-1z%22%2F%3E%0A%3C%2Fsvg%3E%0A)}.oo-ui-image-invert.oo-ui-icon-bellOn{background-image:url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%3E%0A%20%20%20%20%3Cpath%20xmlns%3Adefault%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M17.8%2014.7l1.7-4.7c1-2.8-.5-5.5-3.5-6.6s-5.9%200-6.9%202.8l-1.7%204.7c-.7%201.9-1%202.8-2.9%202.1l-.3%201%2014.1%205.1.3-.9c-1.9-.7-1.5-1.6-.8-3.5zM12%2019.8l-2.8-1c-.3.9.8%202.4%202.1%202.9s3.2.1%203.5-.9l-2.8-1z%22%2F%3E%0A%3C%2Fg%3E%3C%2Fsvg%3E%0A)}.oo-ui-icon-speechBubbles{background-image:url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M20%209v9l2%202H8V9h12zM3%204h12v4H7v7H1l2-2V4z%22%2F%3E%0A%3C%2Fsvg%3E%0A)}.oo-ui-image-invert.oo-ui-icon-speechBubbles{background-image:url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%3E%0A%20%20%20%20%3Cpath%20xmlns%3Adefault%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20d%3D%22M20%209v9l2%202H8V9h12zM3%204h12v4H7v7H1l2-2V4z%22%2F%3E%0A%3C%2Fg%3E%3C%2Fsvg%3E%0A)}#pt-notifications-alert .mw-echo-notifications-badge,#pt-notifications-message .mw-echo-notifications-badge{float:right;box-sizing:border-box;text-align:right;display:block;margin:0;padding:10px 15px;width:100%;height:auto;background-size:1rem;background-repeat:no-repeat;border-radius:0;background-color:#d2d2d2;color:#fff!important;font-size:1em}.mw-echo-notifications-badge.mw-echo-unseen-notifications:after{content:"";width:6px;height:6px;background:red;display:block;position:absolute;top:-1.5rem;border-radius:6px;right:.8rem}#ca-translate,#mw-search-top-table div.results-info,#p-cactions-label a,#p-cactions-label span,#p-namespaces ul>li[id^=ca-nstab-],#p-views ul .collapsible,#toc h2,.infocolumn-block .caret,.mw-content-ltr .magnify,.mw-editsection span,.mw-special-Search #mw-content-text .oo-ui-icon-search,.mw-special-Search .mw-indicators,.ns-talk #p-namespaces ul>#ca-talk,.rcoptions legend,.rootpage-Special_Search .firstHeading,.spoilertag.mw-collapsible.mw-collapsed .mw-collapsible-content,.toc h2,.toclimit-2 .toclevel-1 ul,.toclimit-3 .toclevel-2 ul,.toclimit-4 .toclevel-3 ul,.toclimit-5 .toclevel-4 ul,.toclimit-6 .toclevel-5 ul,.toclimit-7 .toclevel-6 ul,.tocnumber,.tux-navitoggle,div.gallerytext,hr,span.mw-editButtons-pipe-separator{display:none}#p-personal:hover>ul,#siteSub,#toc a,.embedvideowrap iframe,.ns-talk #p-namespaces ul>li[id^=ca-nstab-],.toc a,.toctoggle{display:block}body.ltr #pt-notifications-alert .mw-echo-notifications-badge,body.ltr #pt-notifications-message .mw-echo-notifications-badge{background-position:10px center}.mw-echo-ui-notificationBadgeButtonPopupWidget-popup{top:2rem}#pt-notifications-alert,#pt-notifications-message{width:50%!important}.oo-ui-toolGroup,h1,h2,h3,h4,h5,h6{border:none}.toctoggle a:active,.toctoggle a:focus,.toctoggle:active,.toctoggle:focus,:focus{outline:0}span.toctoggle:hover{background:#e8e8e8}td ol{margin-left:1rem!important}blockquote{border-left:4px solid rgba(0,0,0,.8);padding-left:20px;margin-left:-24px;padding-bottom:2px;font-style:italic}td.cquote{float:left}.cquote td{padding-left:30px;font-size:115%;line-height:1.618;font-style:italic;color:rgba(0,0,0,.6)}.cquote td p:first-child{text-indent:-6px}ol li{margin-bottom:.5rem}.nowrap{white-space:nowrap}.mw-editinginterface,.mw-newarticletext.plainlinks,div.mw-warning-with-logexcerpt,fieldset{border:1px solid #ddd;background:#fcfcfc;margin:2rem 0 1.5rem;padding:.5rem 1rem}table.wikitable{margin:.5rem 0 2rem}pre,table.wikitable,table.wikitable>*>tr>td,table.wikitable>*>tr>th{padding:.5rem 2rem .5rem 0;font-size:.8rem;line-height:1.2rem;color:rgba(0,0,0,.7);text-align:left;background-color:transparent;border:0}table.wikitable,table.wikitable>*>tr>td,table.wikitable>*>tr>th{border-bottom:1px solid #eee}table.wikitable>*>tr>th{font-size:.7rem;font-weight:500;letter-spacing:0;color:#888;background-color:transparent}ol.references{margin:.2rem 0 10px 2.2rem;font-size:.8rem;line-height:1.5}.references li{margin-bottom:5px}.references img{vertical-align:sub}.reference-text>span{white-space:normal!important}div.floatright,table.floatright{margin:0 0 0 .5rem}div.ev_right{margin:.5em 0 1.3em 1.4em!important}#mw-content-text .thumbimage,.infobox-table tr:hover>td,.wikitable tr:hover>td{background:#eee}table.diff{position:relative;z-index:100;padding:1.5em;background-color:#fff;box-shadow:0 2px 5px 0 rgba(0,0,0,.16),0 2px 10px 0 rgba(0,0,0,.12)}td .diffchange{color:#4c4c4c}td.diff-addedline,td.diff-context,td.diff-deletedline{border:0;border-radius:0}td.diff-ntitle,td.diff-otitle{text-align:left}td.diff-addedline{background:#c8e6c9;border-left:5px solid #4caf50!important;border-color:#a3d3ff}td.diff-deletedline{background:#ffcdd2;border-left:5px solid #f44336!important}td.diff-lineno{font-size:.8rem;color:#333;border-bottom:1px solid #d0d0d0}.live>td:nth-child(2n),.mw-plusminus-pos{color:#388e3c}.mw-body a.new,.mw-body a.new:visited,.mw-plusminus-neg{color:#d32f2f}#pagehistory li.selected,td.diff-context{color:inherit;background-color:inherit}#toc a,.dablink,.toc a{color:#616161}#pagehistory li,.mw-changeslist-legend,.mw-search-profile-tabs,.mwe-popups,.oo-ui-buttonElement-framed.oo-ui-widget-disabled>.oo-ui-buttonElement-button,html .thumbimage{border:0}.mw-changeslist{overflow:auto}.mw-warning,.toccolours{border:0;background-color:#f5f5f6}#toc,.toc{position:fixed;direction:rtl;top:5.5rem;width:12rem;z-index:999;padding:0;border:0;background:0 0;box-sizing:border-box}#contentSub,#contentSub2,#mw-content-text,div#footer>ul{padding:0 2.5rem}.toctoggle{-webkit-tap-highlight-color:transparent;position:fixed!important;bottom:20px;z-index:9;border-radius:100px;background:#eee;text-indent:-9999px;overflow:hidden;font-size:0;line-height:normal;transition:box-shadow 280ms cubic-bezier(.4,0,.2,1)}.toctoggle a{width:56px;height:56px;background:url(https://starcitizen.tools/images/0/00/ToC.svg) center center/16px no-repeat}.toctoggle:active{box-shadow:0 7px 8px -4px rgba(0,0,0,.2),0 12px 17px 2px rgba(0,0,0,.14),0 5px 22px 4px rgba(0,0,0,.12)}#toc>ul,.toc>ul{display:none;position:fixed;top:3.5rem;right:0;width:12rem;height:calc(100vh - 4rem)!important;max-height:none;margin:0;padding:1.5rem 0 0!important;background:#f6f9fa;box-shadow:rgba(0,0,0,.2) …</style>'

// https://discordbots.org/bot/509269359231893516
