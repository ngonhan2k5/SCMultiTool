const {RichEmbed } = require('discord.js');
const fetch = require('node-fetch')
var Datastore = require('nedb')
var assetDB = new Datastore({ filename: 'db/asset.db', autoload: true });
var queryCache = new Datastore({ filename: 'db/query.db', autoload: true });
const searchApi = 'https://starcitizen.tools/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=30&suggest=true&search='
const scToolBase = 'https://starcitizen.tools'
const logos = require('../meta.json')

assetDB.ensureIndex({ fieldName: 'timestamp', expireAfterSeconds: global.isTest?60 : 24*60*60 }, function (err) {
  // If there was an error, err is not null
  console.log('aaaaaaaaaaaaaaa', err)
});

var utils = {
    // search: function(kw){
    //     return new Promise(function(resolve, reject){

    //     }
    // },
    sendImage: function(send, path){
        //var at =new Attachment(path, 'hello_world.png')
          send('<'+path+'>', {file:path}).then(
              function(msg){
                  console.log(22222222, utils.hashCode(path), msg)
              }
          )
    },
    renderShip: function(data, client){
        var embed =  {
            color: 3447003,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: "This is an embed",
            url: "http://google.com",
            description: "This is a test embed to showcase what they look like and what they can do.",
            fields: [
            //   {
            //     name: "Fields",
            //     value: "They can have different fields with small headlines."
            //   },
            //   {
            //     name: "Masked links",
            //     value: "You can put [masked links](http://google.com) inside of rich embeds."
            //   },
            //   {
            //     name: "Markdown",
            //     value: "You can put all the *usual* **__Markdown__** inside of them."
            //   }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
              text: "© Example"
            }
          }
    },
    saveAsset: function(key, asset, assetType='image'){
        var item = {_id: utils.hashCode(key)+'_'+assetType, asset:asset, type:assetType, timestamp: new Date()}
        assetDB.update({_id: item._id}, item, { upsert: true })
    },
    findAsset: function(key, assetType='image'){
        return new Promise(function(resolve, reject){
            assetDB.findOne({_id: utils.hashCode(key)+'_'+assetType, type:assetType}, function(err, doc){
              console.log(666666,utils.hashCode(key), doc)
              resolve(doc)
            })
        })
    },
    saveQuery: function(item){
      item.nameLen = item.name.length
      item.timestamp = new Date()
      //var item = {_id: utils.hashCode(key), url:assetUrl}
      queryCache.update({name: item.name}, item, { upsert: true })

    },
    findQuery: function(kw, kw1, retAll=false){
        return new Promise(function(resolve, reject){
            
            var keyword = [kw].concat(kw1).join(' ').trim()
            console.log(8989,  kw, kw1, keyword)
            queryCache.find({ $where: function () { return this.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1 }}).sort({nameLen:1}).exec( function(err, docs){
                if (docs && docs.length){
                    console.log('Found query in cache')
                    if (retAll)
                      resolve(docs)
                    else
                      resolve(docs.shift())
                }else{
                    console.log('Not Found query in cache -> query to site', searchApi+encodeURIComponent(kw) )

                    fetch(searchApi+encodeURIComponent(kw) )
                    .then(res => res.json())
                    .then(json => {
                        console.log(json)
                        if (json[1].length){
                          var items = json[1].map(function(name, i){
                            utils.saveQuery({name:name, pageUrl:json[3][i]})
                            return {name:name, pageUrl:json[3][i]}
                          })
                          
                        }else{
                          reject()
                          return
                        }
                        
                        // find use kw1
                        var matchItems = items.filter(function(it, i){
                          return kw1? it.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1: !i
                        })

                        if(retAll)
                          resolve(matchItems)
                        else{
                          var matchItem = matchItems.shift()
                          if (matchItem){
                              resolve(matchItem)
                          }else{
                              reject()
                          }
                        }
                    })
                }

            })
        })
    },
    fetchAsset: function (url, assetType){
        
      return new Promise(function(resolve, reject){
          var _url =url.startsWith('http')?url:('https://'+url)
          var path = "public/images/"+ utils.hashCode(_url) + ".png"
          fetch(_url)
          .then(res => res.text())
          .then(body => {
              //console.log(body)});
              var cheerio = require('cheerio'),
              $ = cheerio.load(body);

              var table = $('.infobox-table')

              if (table.length ==0 ) return // ?????

              if (assetType=='image')
                resolve(utils.assetImage(table, _url))
              else
                resolve (utils.assetEmbed(utils.parseAsset(table, $), _url))
          })
      })
    },
    assetImage: function(table, pageUrl){
      var fs = require('fs');
      var path = "public/images/"+ utils.hashCode(pageUrl) + ".png"
      return new Promise(function(resolve, reject){
        if (fs.existsSync(path)) {
            // var at =new Attachment(path, 'hello_world.png')
            //   send('<'+'https://'+url+'>', at)
            //utils.sendImage(send, path)
            resolve({path, url: pageUrl})
        }else{
          var webshot = require('webshot');
          var option = { 
              screenSize: {
                  width: 320
                  , height: 200
              },
              shotSize: {
                  width: 'all'
                  , height: 'all'
              },
              shotOffset:{
                  right: -3,
                  left:3
              },
              quality:75,
              siteType:'html',
              userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us'
          }

          var tableHtml = table.html().replace('/images/','https://starcitizen.tools/images/')
          var html = '<html class="dark">{CSS}<body><table style="margin-right:5px;padding-top:0" class="infobox-table hproduct">{table}</table></body></html>'.replace('{table}', tableHtml).replace('{CSS}', CSS+CSS2)

          console.log(html)

          console.log(11111111222, path)
          webshot(html, path, option, function(err) {
          // screenshot now saved to hello_world.png
          // const attachment = new MessageAttachment('public/hello_world.png');
          // send('Message that goes above image', {files: ["../hello_world.png"]});
            resolve({path, url: pageUrl})
          
          });
        }
      })
    },
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
  
    sendHelpShort: function(send, client){
      send({embed:{
        color: 0xBACD31,
        author: {
           name: client.user.username,
           icon_url: client.user.avatarURL,
           url:'https://discordbots.org/bot/522068856512970752'
        },
        title: "Help for MantleMantis",
        url: "https://discordbots.org/bot/522068856512970752",
        description: "Helper for StarCitizen game's Discord channels",
        fields: [
          {
            name: "1. Look up SC ingame object informartion (https://starcitizen.tools)",
            value: "`>>keyword` for lookup object details\r\n" 
          },
          {
            name: "2. If not found, try to find the names first",
            value: "`>keyword` for lookup object names\r\n"
                  
          },
        ],
        timestamp: new Date(),
        footer: {
          // icon_url: client.user.avatarURL,
          text: "© MantleMantis",
          icon_url:'https://i.imgur.com/gHsDOmU.png'
        }
      }})
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
    },
    hashCode : function(str) {
        // var hash = 0, i, chr
        // if (str.length === 0) return hash
        // for (i = 0; i < str.length; i++) {
        //     chr   = str.charCodeAt(i)
        //     hash  = ((hash << 5) - hash) + chr
        //     hash |= 0; // Convert to 32bit integer
        // }
        return str.split('/').pop().replace('.png','').replace(/\W/g, '-')
    },
    assetEmbed: function(data, _url){
      const e = new RichEmbed().setURL(_url).setTimestamp().setDescription("--------------------------------------------------------").setColor( 0xBACD31)
      var title = [],
        logo,logo2

      //var item = data.shift()
      for(var i=0; i < data.length; i++){
        let item = data[i]

        if (item.type=='img' && item.name && item.name.img){
          e.setImage(scToolBase+item.name.img)
        }else if (item.type=='title'){
          //e.setTitle(item.name.text.toUpperCase())
          title.push(item.name.text.toUpperCase())
        }else if (item.name.text =='Manufacturer'){ // Ship and device
          let values = item.value.text.match(/\[(.*)\]\(([^)]*)\)(.*)/)
          if(values && values.shift() && values){
            let name = values.shift(),
                url = values.shift(),
                last = values.shift(),
                abbr = last && last.match(/\((.*)\)/)[1]
            
            logo = logos[name]||logos[abbr]

            e.setAuthor(name+ last, logo , url)
            
            // e.setFooter(item.value.text,logos[name]||logos[abbr])
            delete item
          }
        }else if (item.name.text =='Affiliation'|| item.name.text =='Owner'){ // Planets and moon
          let values = item.value.text.match(/\[(.*)\]\(([^)]*)\)(.*)/)
          if(values && values.shift() && values){
            let name = values.shift(),
                url = values.shift(),
                last = values.shift(),
                abbr = last && last.match(/\((.*)\)/)[1]

            logo = logos[name]||logos[abbr]
            e.setAuthor(name+ last, logo, url)
            
            // e.setFooter(item.value.text,logos[name]||logos[abbr])
            //delete item
          }
        }else if (item.name.text =='Focus' || item.name.text =='Type' || item.name.text == 'System Type'){ // move focus,.. to title
          title.push('('+item.value.text+')')
        }else if (item.type=="prop") {
          // if(item.value && item.value.href)
          //   e.addField(item.name.text, "["+item.value.text+"]("+scToolBase+item.value.href+")", true)
          // else

          // if (item.name.text =='System'){ // For landmark
          //   let values = item.value.text.match(/\[(.*)\]/)
          //   let key = values && values.length && values[1]
          //   logo2 = utils.findAsset(key, 'embed')
          // }
          e.addField(item.name.text, item.value.text, true)
        }
      }

      e.setTitle(title.join(' '))
      .setFooter('©Mantis@MNE.Inc • Credit:starcitizen.tools', 'https://i.imgur.com/gHsDOmU.png')

      if (logo|| logo2)
        e.setThumbnail(logo|| logo2)
      
      return e
    },
    parseAsset:function(table, $){
      var a = table.find('tr').map(function(i, v){
        var trRet = {}
        var tr = $(v).find('th, td').map(function(i, vv){
          if (vv.attribs.class && vv.attribs.class.indexOf("infobox-table-name") > -1)
            trRet.type = 'title'
          else if (vv.attribs.class && vv.attribs.class.indexOf("infobox-table-img") > -1)
            trRet.type = 'img'
          // console.log(vv.children)
          var ret = {}
          var childs = vv.children.map(function(i){
            // console.log(i)
            
            // if(i.type=='text') 
            //   ret.text = (ret.text?ret.text+'\r\n':'') + i.data
            // else 
            if (i.type=='tag' && i.name=='a'){
              console.log(898989,i)
              //ret.href = i.attribs.href
              if (i.children[0].name=='img'){
                ret.img = i.children[0].attribs.src
              }
            }
          })
          ret.text = utils.getText(vv)
          return ret;
        }).get()

        trRet.name = tr[0]
        if (tr.length>1){
          trRet.value = tr[1]
          trRet.type=trRet.type||"prop"
        }else
          trRet.type=trRet.type||"group"
          
        return trRet
      }).get()
      console.log(777777777, a)
      return a

    },
    getText:function(node, glue=' '){
      if (Array.isArray(node)){
        return node.map(function (child){
                if (child.type=='text' && child.data == '2903 (before, actual)')
                  console.log('xxxxxxx',child.parent.children)
                return utils.getText(child)
              }
            ).filter(function(child){
              //console.log('bbbb', child, child&&child!='')
              return !!child.trim()
            }).join(glue).replace(new RegExp(glue+'<br>'+glue,'g'),'\r\n')
      }else{
        if (node.type=='tag' && node.name=='img')
          return '!['+utils.getText(node.children)+']('+scToolBase+node.attribs.src+')'
        else if (node.type=='tag' && node.name=='a')
          return '['+utils.getText(node.children)+']('+scToolBase+node.attribs.href+')'
        else if(node.children && node.children.length)
          return (node.type=='text'?node.data:'') + utils.getText(node.children, node.name=='ul'?'\r\n':' ')
        else
          return (node.type=='text'?node.data:(node.name=='br'?'<br>':''))
      }
    }
  }

module.exports = utils;

const CSS = '<style>body{margin:0px;padding:3px 5px} .mw-body #toc h2,.mw-body .toc h2,body,html,input,ul.tabbernav li a {font-family: Roboto,sans-serif; font-size:1.2rem} a{color: #1565c0;text-decoration:none}body,html {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;-ms-overflow-style: -ms-autohiding-scrollbar opacity:1;background: #f9fbfc;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;text-rendering: optimizeLegibility} th{font-size: 1.4em !important;} .live>td:nth-child(2n):after {content: "";background: url(https://starcitizen.tools/images/7/74/Icon_live.svg) center 5px/8px auto no-repeat;width: 16px;height: 16px;margin-left: 2px;display: inline-block;}</style>',
    CSS2='<style>html,html body { background: #091017 }  html #toc,html .mwe-popups .mwe-popups-extract,html .toc,html code,html input,html select,html td.diff-lineno,html textarea { color: #ccc }  html table.infobox-table { background: #141d2a }  #mwe-popups-settings header a:hover,html table.infobox-table th { color: #c3f2ff }  html .mw-body,html table.infobox-table { color: #88a3ad }  html .cquote td { color: rgba(255,255,255,.4) }  html #p-personal ul,html .editButtons input,html .mw-ui-button html .editButtons a,html .mwe-popups,html div.vectorMenu div.menu,html select { background-color: #333 }  html ul.tabbernav li.tabberactive a:link { color: #698fcd!important }  html #p-personal a,html .boilerplate p,html .mw-search-profile-tabs div.search-types ul li.current a,html .mwe-popups>div>div.mwe-popups-timestamp-older,html .thumbcaption,html .tux-grouptab,html div.vectorMenu li a,html ul.tabbernav li a:link { color: #888!important }  html ul.tabbernav li a:hover { color: #aaa!important }  html pre,html table.mw_metadata td,html table.mw_metadata th,html table.wikitable,html table.wikitable>*>tr>td,html table.wikitable>*>tr>th { color: rgba(255,255,255,.7) }  html .mw-pt-languages,html select { border-color: #333 }  html #p-logo,html .catlinks,html .mw-changeslist-legend,html .mw-code,html .mw-editinginterface,html .navplate-table td,html .navplate-table th,html code,html div#mw-panel div.portal h3,html div.mw-warning-with-logexcerpt,html fieldset,html input,html pre,html table.mw_metadata td,html table.mw_metadata th,html table.wikitable,html table.wikitable>*>tr>td,html table.wikitable>*>tr>th,html td.diff-lineno,html textarea { border-color: #2b3d4e }  html #pt-notifications-alert .mw-echo-notifications-badge,html #pt-notifications-message .mw-echo-notifications-badge,html .mw-pt-languages { background-color: #222 }  html .infobox-table td { border-color: #1a252f }  html #infobox-table-img-bg { background-color: #88a3ad }  html #toc>ul,html #toolbar,html .infobox-table tr:hover>td,html .mw-code,html .mw-editinginterface,html .mw-search-profile-tabs,html .navplate-table tr:hover>td,html .toc,html .wikitable tr:hover>td,html code,html div.mw-warning-with-logexcerpt,html fieldset,html pre,html table.diff { background: #1a252f }  html div#mw-panel div.portal div.body ul li a:hover { background-color: rgba(255,255,255,.05) }  html .mw-wiki-logo { background-image: url(/images/9/95/Sc-tools-logo-dark.svg) }  html div#mw-panel div.portal div.body ul li a,html div#mw-panel div.portal div.body ul li a:visited,html div#mw-panel div.portal h3 { color: #2b3d4e }  html #search .oo-ui-textInputWidget [type=search] { padding-top: 10px; padding-bottom: 9px; background: #444; box-shadow: none }  html .mwe-popups.mwe-popups-image-tri:after,html .mwe-popups.mwe-popups-image-tri:before,html .mwe-popups.mwe-popups-no-image-tri:after,html .mwe-popups.mwe-popups-no-image-tri:before { border-bottom-color: #333 } .infobox-table table th, .infobox-table td {padding: .3em .5em!important;font-size: 1.2rem;border-top: 1px solid #eee;}</style>'


