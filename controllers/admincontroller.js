const app = require('../app')
const db = require('../routes/database')
const request = require('request')
const textRes = require('./textresponse')






exports.init = function(req, res) {
    let results = db.pgQuery('SELECT * FROM admin;')
    results.then(queryValue => {
        let team_domain = req.body.team_domain
        if(queryValue.rowCount == 0) {
            let id = '\'' + req.body.user_id + '\''
            let name = '\'' + req.body.user_name + '\''

            let insertStr =  'INSERT INTO admin (id, name) VALUES('+ id + ',' + name + ')'
            let insert = db.pgQuery(insertStr)
            insert.then(_ => {
                let mesg = 'Worksapce *' + team_domain + '*\'s new app \' *Happiness Level* \' init success!'
                textRes.successRes(res,mesg)
            }).catch(err => {
                textRes.errorRes(req,res,err.message||err)
            })
        } else {
            textRes.errorRes(req,res,'Workspace ' + team_domain + ' already init!')
        }    
            
    
    }).catch(err => {
        textRes.errorRes(req,res,err.message||err)
    });
}






exports.add = function(req, res) {
    let isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then(_ => {
        let users = req.body.text.split(' ').map( str => {
            return str.trim()
        })
        let part = users[0]
        let verify = addVerifyParams(users)
        if(verify[0] == false) {
            textRes.errorRes(req,res,verify[1])
            return
        }
        users.splice(0,1)

        addRequestMembers().then(members => {
            let insertStr = addGenerateSql(part, users, members)
            if(insertStr[0] === false) {
                textRes.errorRes(req,res,insertStr[1])
                return
            }
            let insert = db.pgQuery(insertStr[1])
            insert.then(_ => {
                textRes.successRes(res,'Add success!')
            }).catch(err => {
                textRes.errorRes(req,res,err.message||err)
            })
        }).catch(err => {
            textRes.errorRes(req,res,err.message||err)
        })
    }).catch(err => {
        textRes.errorRes(req,res,err.message||err)
    })
}
function addVerifyParams(users) {
    if(users.length < 2 || (users[0] !== 'researcher' && users[0] !== 'manager')) {
        return [false, 'Please input correct command! \n `/admin_add researcher/manager @user1 @user2 ...` ']
    }
}
function addRequestMembers() {
    return new Promise((resolve, reject) => {
        let options = {
            url: 'https://slack.com/api/users.list?scope=users:read',
            headers: {
                'User-Agent': 'SDM Test',
                'Authorization' : 'Bearer xoxa-2-434508566676-445609127334-444065434292-a41d63c89c65b7a2a9bacc9bfe61faa4'
            }
        };
        request(options, (err, _, body) => {
            let result = {}
            if((typeof body) === 'string') {
                result = JSON.parse(body)
            } else {
                result = body
            }
            if(err || result['error']) {
                textRes.textRes(res,true,(err || result['error']))
                reject(err || result['error'])
            }
            let dict = []
            let members = result['members']
            resolve(members)
        })
    })
    
}
function addGenerateSql(role, users, members) {
    var dict = []
    for(let i = 0; i<members.length; i++) {
        for(let j = 0; j<users.length; j++) {
            if(users[j].substring(1) == members[i]['name']) {
                let temp = [members[i]['id'],members[i]['name']]
                let display_name = members[i]['profile']['display_name']
                if(display_name.length == 0) {
                    temp.push(members[i]['profile']['real_name'])
                } else {
                    temp.push(display_name)
                }
                dict.push(temp)
                break;
            }
        }
    }
    if(dict.length === 0) {
        return [false, 'Did not find the member!']
    }
    let insertStr = 'INSERT INTO role VALUES '
    dict.forEach( (e) => {
        insertStr = insertStr + '(\'' + e[0] + '\',\'' + e[1] + '\',\'' + e[2] + '\',\'' + role + '\'),'
    })
    insertStr = insertStr.substring(0, insertStr.length-1) + ';'
    return [true,insertStr]
}





exports.delete = function(req, res) {
    let isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then(_ => {
        let users = req.body.text.split(' ')
        let selectStr = deleteQueryRealname(users)
        db.pgQuery(selectStr).then(value => {
            if(value.rowCount === 0) {
                textRes.errorRes(req,res,'Did not find the member!')
                return
            }
            let deleteStr = deleteGenerateSql(users)
            db.pgQuery(deleteStr).then(_ => {
                let names = ''
                value.rows.forEach(e => {
                    names = names.concat(e['real_name'] + ', ')
                });
                textRes.successRes(res,'Delete success! \n~'+ names.substring(0,names.length-2) +'~')
            }).catch(err => {
                textRes.errorRes(req,res,err.message||err)
            })
        }).catch(err => {
            textRes.errorRes(req,res,err.message||err)
        })
    }).catch(err => {
        textRes.errorRes(req,res,err.message||err)
    })
}
function deleteQueryRealname(users) {
    return 'SELECT real_name FROM role WHERE name IN ' + deleteNames(users)
}
function deleteGenerateSql(users) {
    return 'DELETE FROM role WHERE name IN ' + deleteNames(users)
}
function deleteNames(users) {
    let names = '('
    users.forEach(e => {
        names = names.concat('\'', e.substring(1), '\'', ',')
    });
    return  names.substring(0, names.length-1).concat(')')
}






exports.list = function(req, res) {
    let isAdmin = verifyAdmin(req.body.user_id);
    isAdmin.then(_ => {
        let text = req.body.text.trim()
        if(text !== 'researcher' && text !== 'manager') {
            textRes.errorRes(req,res,'Please input correct command! \n `/admin_list researcher/manager`')
            return
        }
        let selectStr = 'SELECT * FROM role WHERE part=\''+ text +'\';';
        db.pgQuery(selectStr).then(selectValue => {
            let names = ''
            selectValue.rows.forEach((e) => {
                names = names + e['real_name'] + '\n'
            })
            textRes.successRes(res,'*'+ text.substring(0,1).toUpperCase()+text.substring(1) + ': *\n' + names)
        }).catch(err => {
            textRes.errorRes(req,res,err.message||err)
        })
    }).catch(err => {
        textRes.errorRes(req,res,err.message||err)
    })
}





function verifyAdmin(user_id) {
    return new Promise((resolve, reject) => {
        let results = db.pgQuery('SELECT id FROM admin;')
        results.then(value => {
            if(value.rowCount === 0) {
                reject('Workspace needs init first! \n `/admin_init`')
            } else {
                if(user_id !== value.rows[0]['id']) {
                    reject('Only Admin can use this command!')
                } else {
                    resolve('')
                }
            }
        }).catch(error => {
            reject(error.message||err)
        })
    })
}







// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/441441585712/ks8147qG9BaAcmdCI0qaNNbJ","trigger_id":"441581991553.434508566676.747ed520202d5c75a011b6205132d274"}

// {"token":"NoLDQeFvLs2uJmXkbrc1jlEv","team_id":"TCSEYGNKW","team_domain":"sdm-6","channel_id":"GCTJDNRA5","channel_name":"privategroup","user_id":"UCSLXUNRG","user_name":"ioswpf","command":"/init","text":"@ioswpf","response_url":"https://hooks.slack.com/commands/TCSEYGNKW/442073194851/mcrrmvkTpBbJAFXfRMHmm6oz","trigger_id":"442176950850.434508566676.64c034ded49a0a5238acaa808c9ab6fe"}